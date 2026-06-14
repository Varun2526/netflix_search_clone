# Recommendation System

This document explains how KAIRO recommends movies and games. It is written for the
internship review: it maps the assignment's concepts (collaborative filtering,
content-based filtering, hybrid recommendation, user-behaviour analysis) onto the
actual code, and ends with the path to a v2 Python/ML service.

> **Version 1 (current):** a pure MERN implementation. All scoring is plain
> JavaScript heuristics running inside the Express controller — no Python,
> TensorFlow or Spark yet. This is deliberate: it keeps the whole system in one
> stack and easy to reason about, while leaving a clean seam for v2.

---

## 1. The signals we collect (user-behaviour analysis)

Recommendations are only as good as the behaviour we record. Three signals feed the engine:

| Signal | Where it's stored | How it's captured |
|---|---|---|
| **Ratings** (1–5 stars) | `Rating` collection (`userId`, `contentId`, `score`) | Star widget in the detail modal → `POST /api/content/rate` |
| **Watchlist** | `User.wishlist` (array of `Content` ids) | "Add to Watchlist" → `POST /api/content/wishlist` |
| **Viewing history** | `User.recentlyViewed` (array, most-recent-first, capped at 20) | "Mark as Watched/Played" → `POST /api/content/history` |
| **Explicit favourites** | `User.favoriteGenres` (array of strings) | Genre chips on the Profile page |

Relevant files: [`User.model.js`](../backend/models/User.model.js),
[`Rating.model.js`](../backend/models/Rating.model.js),
[`Content.model.js`](../backend/models/Content.model.js).

> **Implementation note:** `recentlyViewed` is maintained in
> [`addToHistory`](../backend/controllers/content.controller.js) with a
> `$pull` + `$push`/`$slice` so the list stays deduped and bounded to the 20 most
> recent items.

---

## 2. Content-based filtering

**Idea:** recommend items that *resemble* the items a user already likes, based on
the items' own attributes (genres, cast, director, year, type).

This is used in two places.

### 2a. "More Like This" (per item)

Endpoint: `GET /api/content/:id/similar` →
[`getSimilarContent`](../backend/controllers/content.controller.js).

For a given title we pull every other title that shares at least one genre, cast
member, or the director, then score each candidate:

```
score  = (#shared genres   × 3)
       + (#shared cast      × 2)
       + (same director     ? 4 : 0)
       + (same type         ? 1 : 0)
       + (|Δ release year| ≤ 5 ? 1 : 0)
       + averageRating / 10            // tie-breaker toward better titles
```

The top 12 are returned, each with a human-readable `similarityReason`
(e.g. *"by Christopher Nolan"*, *"Action, Sci-Fi"*). Rendered as the **More Like
This** row inside the detail modal.

### 2b. The weighted genre-taste profile (per user)

For personalized recommendations we first build a **genre → weight** map from the
user's behaviour. Crucially, **ratings steer the weight** so a disliked title
pushes its genres *down*:

```
favoriteGenres  → +3 each
viewed/wishlisted (not rated) → +1 to each of its genres
rated title     → (score − 3) to each of its genres   // 5★ = +2, 1★ = −2
```

Only genres with a **net-positive** weight count as "liked". This is the
content-based half of the hybrid score below.

---

## 3. Collaborative filtering

**Idea:** recommend what *similar users* engaged with ("people like you also liked…").

In [`getRecommendations`](../backend/controllers/content.controller.js):

1. Find up to 50 **neighbour users** who share at least one item with the current
   user (overlap in `recentlyViewed` or `wishlist`).
2. For every item those neighbours engaged with that the current user **hasn't**,
   add `+1` (co-occurrence count). This produces a `collabContentScores` map.

This is a simple **item co-occurrence** model — easy to read, no matrix maths. Its
limitations (no neighbour-similarity weighting, no rating weighting on the
collaborative side) are exactly what the v2 Python service in §7 addresses.

---

## 4. Hybrid scoring

Each candidate item gets a single blended score combining both approaches plus a
quality term:

```
recScore = (collabCount × 3)              // collaborative
         + (Σ matched-genre weights × 1.5) // content-based, rating-weighted
         + averageRating                   // quality
```

Candidates come from the **union** of (a) items surfaced by collaborative filtering
and (b) items in the user's liked genres — capped at 250 for performance — then
sorted by `recScore`.

Every item also gets a `reason` string for the UI:
- `collab` dominated → *"Popular with viewers like you"*
- otherwise → *"Because you like {top matched genre}"*

---

## 5. Building the rows (and why nothing repeats)

A recommender that shows the same title in three rows feels broken. We assemble the
"For You" feed greedily with a global `used` set, so **every item appears in exactly
one row**:

1. **Top Picks For You** — best 12 overall by `recScore`
2. **Because You Like {genre}** — one row per top liked genre (up to 4), deeper cuts
3. **Popular With Viewers Like You** — collaborative items (`collab > 0`)
4. **Movies Picked For You** / **Games Picked For You** — per-type variety
5. **More To Explore** — remaining high-scored items

Each row is filled by a `take(pool, n)` helper that skips anything already used.
The Home page applies the **same dedup discipline across the whole page** and makes
"Trending Now" an interleaved movie+game mix so it doesn't mirror "Top Games".

### Cold start

A brand-new user has no signals, so the hybrid path is skipped and we return three
popularity-based rows instead: **Popular Right Now**, **Popular Movies**,
**Popular Games** (sorted by `popularityScore`). The feed is never empty.

---

## 6. API surface

| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/api/content/recommendation` | Personalized hybrid feed (`data`, `sections`, `taste`) — auth required |
| `GET`  | `/api/content/:id/similar` | Content-based "More Like This" |
| `GET`  | `/api/content/trending` | Popularity-sorted (`?type=`, `?limit=`) |
| `POST` | `/api/content/rate` | Submit a 1–5 rating |
| `POST` | `/api/content/wishlist` | Add to watchlist |
| `POST` | `/api/content/history` | Mark watched/played (updates `recentlyViewed`) |

The recommendation response shape:

```jsonc
{
  "success": true,
  "data": [ /* flat Top-Picks list, kept for backward compatibility */ ],
  "sections": [
    { "title": "Top Picks For You", "reason": "Your best matches right now", "items": [ /* … */ ] },
    { "title": "Because You Like Action", "reason": "More Action you might enjoy", "items": [ /* … */ ] }
  ],
  "taste": { "likedGenres": ["Action", "Sci-Fi"], "ratedCount": 7 }
}
```

Frontend consumers: [`Discover.jsx`](../frontend/src/pages/Discover.jsx) (pure feed),
[`Home.jsx`](../frontend/src/pages/Home.jsx) (discovery + personalized rows),
[`ContentDetailsModal.jsx`](../frontend/src/components/ContentDetailsModal.jsx) (More Like This).

---

## 7. Path to v2 (Python / ML)

The REST contract above is the seam. None of the frontend needs to change; we swap
the *implementation* behind `/recommendation` and `/similar`.

1. **Stand up a Python service** (FastAPI) that reads the same MongoDB.
2. **Collaborative filtering, properly** — build a user×item rating matrix and use
   matrix factorization (e.g. `implicit` / `surprise`) or cosine similarity instead
   of raw co-occurrence. This is where TensorFlow/Spark from the brief would slot in
   for scale.
3. **Content-based with embeddings** — replace genre-overlap counting with TF-IDF or
   sentence-embedding similarity over description + genres + cast.
4. **Express calls Python** — the Node controller fetches ranked ids from the Python
   service and hydrates them from MongoDB, keeping auth and response shaping in one place.

Because v1 already separates *signals → scoring → row assembly → API*, only the
middle "scoring" box changes.

---

## 8. Summary

| Assignment concept | Where it lives in v1 |
|---|---|
| Content-based filtering | `getSimilarContent` + weighted genre profile |
| Collaborative filtering | neighbour overlap + item co-occurrence in `getRecommendations` |
| Hybrid recommendation | blended `recScore` (collaborative + content + quality) |
| User-behaviour analysis | ratings, watchlist, `recentlyViewed`, favourite genres |
| Machine learning / Python / TensorFlow / Spark | deferred to v2 (§7) — clean seam in place |

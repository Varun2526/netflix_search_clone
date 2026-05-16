# User Flow

This document describes the typical journey of a gamer using the **GameMind AI** platform.

## 1. Onboarding
1. **Landing Page**: The user arrives at the platform and sees a showcase of trending games and platform features.
2. **Registration**: The user creates an account by providing an email, username, and password. 
3. **Initial Preferences (Optional)**: The user selects 3-5 favorite game genres or tags (e.g., RPG, FPS, Open World) to cold-start the recommendation engine.

## 2. Discovery & Browsing
1. **Home Dashboard**: Upon logging in, the user sees curated horizontal rows of games:
   * *Trending Now*
   * *Top Rated*
   * *Recommended for You* (Once enough data is gathered)
2. **Search**: The user uses the search bar to find a specific game by title.
3. **Filtering**: The user filters the catalog to only show "Action RPG" games.

## 3. Interaction
1. **Game Details**: The user clicks on a game card to view its detailed page (description, developer, tags, trailer).
2. **Actions**:
   * **Add to Wishlist**: The user saves the game for later.
   * **Rate/Like**: The user rates the game 5 stars.
   * **Mark as Played**: The user adds the game to their gameplay history.

## 4. AI Recommendation Generation (Background)
1. **Data Logging**: The backend records the user's 5-star rating and the "played" action.
2. **Model Trigger**: The Python ML service processes this new interaction.
3. **Update**: The user's *"Recommended for You"* feed dynamically updates to feature games with similar mechanics or games enjoyed by other users with similar tastes.

## 5. Retention
1. **Returning User**: The user returns a week later.
2. **Personalized Feed**: The dashboard now heavily highlights games matching the user's specific established patterns (e.g., pushing more single-player story-driven games to the top based on their history).

# User Flow

This document describes the typical journey of a user on the **Kairo** unified entertainment platform.

## 1. Onboarding
1. **Landing Page**: The user arrives at the platform and sees a showcase of trending movies and games seamlessly blended.
2. **Registration**: The user creates an account by providing an email, username, and password. 
3. **Initial Preferences (Optional)**: The user selects 3-5 favorite genres or tags (e.g., Sci-Fi, RPG, Thriller) to cold-start the basic recommendation logic.

## 2. Discovery & Browsing
1. **Home Dashboard**: Upon logging in, the user sees curated horizontal rows:
   * *Trending Now (Movies & Games)*
   * *Top Rated*
   * *Critic Picks*
   * *Recommended for You*
2. **Search**: The user uses the search bar for "Cyberpunk" and sees results for both the game *Cyberpunk 2077* and the anime series *Cyberpunk: Edgerunners*.
3. **Filtering**: The user filters the catalog to only show "Psychological Thrillers".

## 3. Interaction
1. **Content Details**: The user clicks on a content card to view rich metadata (description, developer/studio, tags, trailer).
2. **Actions**:
   * **Add to Wishlist**: The user saves the content for later.
   * **Rate / Favorite**: The user rates the content 5 stars and marks it as a "Favorite".
   * **Mark as Viewed/Played**: The user adds the content to their history.

## 4. Recommendation Generation (Backend Logic)
1. **Data Logging**: The Node.js backend records the user's 5-star rating and the "favorite" action in the database.
2. **Dynamic Update**: When the user requests their dashboard, the backend recalculates their hybrid recommendation score on the fly using database queries matching tags, genres, and similar user ratings.
3. **Result**: The *"Recommended for You"* feed dynamically updates to feature similar movies and games based on the new data points.

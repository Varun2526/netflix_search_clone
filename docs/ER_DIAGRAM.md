# Entity Relationship (ER) Diagram

The database uses MongoDB. Below is the relational structure of the main entities in the **Kairo** application (Version 1).

```mermaid
erDiagram
    USER ||--o{ RATING : submits
    USER ||--o{ CONTENT_HISTORY : has
    USER ||--o{ WISHLIST_ITEM : adds
    CONTENT ||--o{ RATING : receives
    CONTENT ||--o{ CONTENT_HISTORY : appears_in
    CONTENT ||--o{ WISHLIST_ITEM : included_in

    USER {
        ObjectId _id PK
        String username
        String email
        String passwordHash
        Array preferences "e.g., favorite genres"
        Date createdAt
    }

    CONTENT {
        ObjectId _id PK
        String title
        String type "ENUM: 'movie' | 'game'"
        String description
        String coverImage
        Array genres
        Array tags
        String studioOrDeveloper
        Date releaseDate
        Number averageRating
    }

    RATING {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId contentId FK
        Number score "1-5 stars"
        Boolean isFavorite
        Date createdAt
    }

    CONTENT_HISTORY {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId contentId FK
        Number interactionTime "playtime or viewtime"
        Date lastAccessedAt
    }

    WISHLIST_ITEM {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId contentId FK
        Date addedAt
    }
```

## Core Entities Description

1. **User**: Represents a consumer on the platform. Stores credentials and high-level preferences.
2. **Content**: A unified model representing both movies and games. The `type` field dictates whether it is a movie or a game. Includes metadata, tags, and genres needed for content-based filtering.
3. **Rating**: A user's explicit feedback on a piece of content (score and favorite status).
4. **ContentHistory**: Tracks what the user has viewed or played, acting as implicit feedback for the recommendation engine.
5. **WishlistItem**: Content the user is interested in but hasn't necessarily engaged with yet.

# Technical Architecture

## Unified Entertainment Recommendation Platform (Version 1)

### Using MERN Stack & Logic-Based Recommendations

---

# 1. Introduction

The **GameMind AI** Platform is a full-stack web application designed to provide unified entertainment recommendations (both movies and games) based on user behavior, preferences, ratings, and interaction history.

Version 1 is focused on building a highly scalable, realistic MERN platform that implements recommendation logic via backend algorithms and database queries without introducing unnecessary microservices or machine learning complexity.

---

# 2. High-Level Architecture (Version 1)

```text
                 ┌────────────────────┐
                 │   React Frontend   │
                 │ Modern Unified UI  │
                 └─────────┬──────────┘
                           │
                      REST APIs
                           │
                 ┌─────────▼──────────┐
                 │  Node.js Backend   │
                 │ Express + MVC APIs │
                 └─────────┬──────────┘
                           │
                 ┌─────────▼──────────┐
                 │     MongoDB        │
                 │  (Data Storage)    │
                 └────────────────────┘
```

---

# 3. Frontend Architecture

The frontend is developed using **React.js** and follows a component-based architecture.

## Responsibilities
* User authentication (Login/Register)
* Unified content catalog browsing (movies and games together)
* Displaying logic-based recommendations
* Wishlist and Favorites management
* Tracking content history and user interactions

## Technologies
* **React.js**: UI Development
* **Tailwind CSS**: Modern styling
* **Axios**: API communication
* **React Router**: Client-side routing
* **Framer Motion**: UI animations

---

# 4. Backend Architecture

The backend is built using **Node.js** and **Express.js**. It acts as the central API gateway connecting the frontend and the database, while also housing the core recommendation logic.

## Responsibilities
* Authentication & authorization (JWT)
* REST API endpoints for user and content data
* Database read/write operations
* User activity logging (viewtime, playtime, ratings)
* Processing hybrid recommendation algorithms using database aggregation and logic filtering

## Technologies
* **Node.js & Express.js**: Runtime and REST API framework
* **JWT & bcrypt**: Authentication and password hashing
* **Mongoose**: MongoDB Object Data Modeling (ODM)

---

# 5. Recommendation Logic (Version 1)

Instead of machine learning, Version 1 handles recommendations efficiently within the Node.js backend using database queries and weighting algorithms.

## Algorithms Used
1. **Content-Based Filtering**: Recommends similar content using metadata overlap (genres, tags, categories).
2. **Basic Collaborative Filtering**: Implements simple collaborative logic using ratings overlap and wishlist overlap via MongoDB aggregations.
3. **Hybrid Engine**: Calculates a final ranking score: `finalScore = (0.5 × contentScore) + (0.3 × collaborativeScore) + (0.2 × popularityScore)`.

---

# 6. Future Architecture (Version 2)

Future versions will extract the recommendation logic into an independent Python ML microservice built using FastAPI. It will leverage TF-IDF vectorization and cosine similarity, eventually introducing TensorFlow for Neural Collaborative Filtering.

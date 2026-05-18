# System Component Roles

The **Kario** (Version 1) architecture is strictly modular and focused on strong MERN principles without overengineering.

## 1. Frontend Client (React.js)
**Role**: The Presentation and Interaction Layer.
* **State Management**: Maintains local user state, authentication tokens, and UI state.
* **User Experience**: Provides a smooth, unified SPA (Single Page Application) for discovering both movies and games.
* **Data Fetching**: Communicates exclusively with the Node.js backend REST APIs.
* **Behavior Tracking**: Captures user interactions (favorites, ratings, wishlist additions) and sends them to the backend for logging.

## 2. Web Backend (Node.js / Express.js)
**Role**: The Gateway, Business Logic, and Recommendation Engine Layer.
* **Authentication**: Verifies JWTs and manages user sessions.
* **CRUD Operations**: Handles all Create, Read, Update, and Delete operations for the database.
* **Recommendation Logic**: In Version 1, the backend contains the logic for generating recommendations using database queries, array filtering, and weighted math formulas (Hybrid ranking).
* **Data Sanitization**: Ensures all incoming data from the client is validated before hitting the database.

## 3. Database (MongoDB)
**Role**: The Persistence Layer.
* **Data Storage**: Stores all persistent application data using a unified content model (Users, Content, Ratings, History).
* **Indexing**: Maintains optimized indexes on frequently queried fields (e.g., content titles, tags, user IDs) to ensure fast read times and efficient aggregation pipelines for collaborative filtering.

*(Note: Machine Learning microservices using Python and TensorFlow are reserved for Version 2).*

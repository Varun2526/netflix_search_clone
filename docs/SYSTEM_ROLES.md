# System Component Roles

The **GameMind AI** architecture is strictly modular. Below are the distinct roles and responsibilities of each system component.

## 1. Frontend Client (React.js)
**Role**: The Presentation and Interaction Layer.
* **State Management**: Maintains local user state, authentication tokens, and UI state.
* **User Experience**: Provides a smooth, SPA (Single Page Application) experience with modern styling.
* **Data Fetching**: Communicates exclusively with the Node.js backend (never directly to the database or ML service).
* **Behavior Tracking**: Captures user interactions (clicks, views) and sends them to the backend for logging.

## 2. Web Backend (Node.js / Express.js)
**Role**: The Gateway and Business Logic Layer.
* **Authentication**: Verifies JWTs and manages user sessions.
* **CRUD Operations**: Handles all Create, Read, Update, and Delete operations for the database.
* **Service Orchestration**: When the frontend requests recommendations, the Node.js server makes an internal HTTP request to the Python ML Service, formats the response, and sends it back to the client.
* **Data Sanitization**: Ensures all incoming data from the client is validated before hitting the database.

## 3. Database (MongoDB)
**Role**: The Persistence Layer.
* **Data Storage**: Stores all persistent application data (Users, Games, Ratings, History).
* **Indexing**: Maintains optimized indexes on frequently queried fields (e.g., game titles, tags, user IDs) to ensure fast read times.

## 4. Machine Learning Service (Python / FastAPI)
**Role**: The Analytical and Recommendation Engine.
* **Data Processing**: Fetches user matrices and game metadata from the database (or receives it via the Node.js API).
* **Model Inference**: Runs user data through scikit-learn models (TF-IDF, Cosine Similarity) and TensorFlow models to generate prediction scores.
* **Stateless API**: Exposes endpoints (e.g., `/recommendations/{user_id}`) that return an array of recommended `gameId`s.

# MVC Architectural Pattern

The Node.js backend of **GameMind AI** strictly follows the **Model-View-Controller (MVC)** design pattern, though adapted for a RESTful API architecture where the "View" is handled by the React frontend.

## 1. Models (Data Layer)
Models represent the data structures and business logic rules. They are implemented using **Mongoose** schemas.

**Responsibilities**:
* Define the schema (types, required fields, default values).
* Handle data validation before saving to MongoDB.
* Provide an interface for querying the database.

*Examples*: `UserModel.js`, `GameModel.js`, `RatingModel.js`.

## 2. Controllers (Logic Layer)
Controllers contain the core business logic of the application. They act as the glue between the Routes and the Models.

**Responsibilities**:
* Receive the incoming HTTP request data from the router.
* Process the data (e.g., hash a password, validate input).
* Interact with the Models to fetch or update data.
* Interact with external services (like the Python ML API).
* Format and send the JSON response back to the client.

*Examples*: 
* `AuthController.js` (handles `register`, `login`).
* `GameController.js` (handles `getAllGames`, `getGameById`).
* `RecommendationController.js` (handles `getUserRecommendations`).

## 3. Views (Presentation Layer)
In this REST API architecture, the backend does not render HTML views (like EJS or Pug). Instead, the **React.js Frontend** acts as the decoupled View layer.

**Responsibilities**:
* Fetch JSON data from the backend Controllers via API endpoints.
* Render the UI based on the state.
* Handle user inputs and trigger API calls.

## 4. Routers (Routing Layer)
While not strictly part of the MVC acronym, Routers map HTTP endpoints to specific Controller functions.

*Example*:
```javascript
// gameRoutes.js
const express = require('express');
const router = express.Router();
const { getGames, getGameDetails } = require('../controllers/GameController');

router.get('/', getGames);
router.get('/:id', getGameDetails);

module.exports = router;
```

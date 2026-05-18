# MVC Architectural Pattern

The Node.js backend of **GameMind AI** strictly follows the **Model-View-Controller (MVC)** design pattern, adapted for a RESTful API architecture where the "View" is handled by the React frontend.

## 1. Models (Data Layer)
Models represent the data structures and business logic rules. They are implemented using **Mongoose** schemas.

**Responsibilities**:
* Define the unified content schema (handling both movies and games).
* Handle data validation before saving to MongoDB.
* Provide an interface for querying the database.

*Examples*: `UserModel.js`, `ContentModel.js`, `RatingModel.js`.

## 2. Controllers (Logic Layer)
Controllers contain the core business logic of the application. They act as the glue between the Routes and the Models.

**Responsibilities**:
* Receive incoming HTTP request data from the router.
* Process the data (e.g., hash a password, validate input).
* Interact with the Models to fetch or update data.
* Execute Version 1 recommendation algorithms (Content-Based, Basic Collaborative, Hybrid).
* Format and send the JSON response back to the client.

*Examples*: 
* `AuthController.js` (handles `register`, `login`).
* `ContentController.js` (handles `getAllContent`, `getContentDetails`).
* `RecommendationController.js` (contains the logic for generating unified recommendations).

## 3. Views (Presentation Layer)
In this REST API architecture, the backend does not render HTML views (like EJS or Pug). Instead, the **React.js Frontend** acts as the decoupled View layer.

**Responsibilities**:
* Fetch JSON data from the backend Controllers via API endpoints.
* Render the cinematic UI based on the state.
* Handle user inputs and trigger API calls.

## 4. Routers (Routing Layer)
Routers map HTTP endpoints to specific Controller functions to keep the application organized.

*Example*:
```javascript
// contentRoutes.js
const express = require('express');
const router = express.Router();
const { getTrendingContent, getContentDetails } = require('../controllers/ContentController');

router.get('/trending', getTrendingContent);
router.get('/:id', getContentDetails);

module.exports = router;
```

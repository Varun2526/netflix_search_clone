# Kairo Backend API Documentation

Base URL: `http://localhost:3131/api`

*Note: In the current simplified version, "Private" APIs expect the `userId` to be explicitly passed in the JSON body or query parameters rather than relying entirely on strict JWT middleware extraction, though JWT tokens are issued upon login.*

| Category | Method | API Endpoint | JWT / Auth Required? | Required Payload / Query | Description |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | ❌ No | `{username, email, password}` | Registers a new local user. Issues JWT. |
| **Auth** | `POST` | `/auth/login` | ❌ No | `{email, password}` | Logs in a local user. Issues JWT. |
| **Auth** | `POST` | `/auth/logout` | ❌ No | *None* | Logs out user (clears token cookie). |
| **Auth** | `POST` | `/auth/google` | ❌ No | `{credential}` or `{access_token}` | Registers/Logs in via Google. Issues JWT. |
| **Auth** | `POST` | `/auth/github` | ❌ No | `{code}` | Registers/Logs in via GitHub. Issues JWT. |
| **Discovery** | `GET` | `/content/trending` | ❌ No | `?type=movie&limit=10` | Fetches popular movies/games. |
| **Discovery** | `GET` | `/content/search` | ❌ No | `?query=...&type=...&genre=...` | Text and filter search. |
| **Discovery** | `GET` | `/content/:id` | ❌ No | `req.params.id` | Fetches full details of a movie/game. |
| **Interaction** | `POST` | `/content/history` | 🔒 Yes (via `userId`) | `{userId, contentId}` | Logs a view/play interaction for a user. |
| **Interaction** | `POST` | `/content/wishlist` | 🔒 Yes (via `userId`) | `{userId, contentId}` | Adds content to user's wishlist. |
| **Interaction** | `DELETE`| `/content/wishlist/remove` | 🔒 Yes (via `userId`) | `{userId, contentId}` | Removes content from user's wishlist. |
| **Interaction** | `POST` | `/content/rate` | 🔒 Yes (via `userId`) | `{userId, contentId, score}` | Submits a 1-5 rating & recalculates average. |
| **Engine** | `GET` | `/content/recommendation`| 🔒 Yes (via `userId`) | `?userId=...` | Returns 10 AI-scored personalized items. |
| **User** | `GET` | `/user/profile/:id` | 🔒 Yes (via `userId`) | `req.params.id` | Fetches profile, populated wishlist & history. |
| **User** | `PUT` | `/user/favorite-genres` | 🔒 Yes (via `userId`) | `{userId, genres: []}` | Updates user's manually selected genres. |

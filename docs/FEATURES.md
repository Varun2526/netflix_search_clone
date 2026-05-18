# Application Features

**GameMind AI** combines movies and games into a single intelligent discovery ecosystem. 

## Version 1: MERN Foundation & Logic Recommendations

### 🔐 Authentication System
* User Registration and Login.
* Secure JWT-based authentication.
* Protected routes for authenticated users.

### 🎮🎬 Unified Entertainment Platform UI
* Dark, modern, cinematic theme inspired by Steam and Netflix.
* Responsive layouts featuring hero banners and unified recommendation rows.
* Smooth animations and interactive hover states.

### 🔍 Search & Discovery
* **Unified Catalog**: Search movies and games together.
* **Content Details**: View rich content metadata including descriptions, genres, tags, developer/studio information, and average ratings.
* **Filter & Browse**: Browse by trending content, top-rated content, critic picks, or specific genres.

### 👤 User Profile & Interaction
* **Wishlist**: Save content (movies/games) for later.
* **Ratings & Favorites**: Rate content on a 1-5 scale or mark as "favorite".
* **Content History**: Keep track of recently played or viewed content.

### 🧠 Logic-Based Recommendation System
* **Content-Based Filtering**: Recommend similar content using genres, tags, categories, and metadata overlap (e.g., if a user likes psychological thrillers, recommend similar movies and games).
* **Basic Collaborative Filtering**: Uses backend logic and database aggregations to find ratings overlap (e.g., "Users who liked Interstellar also liked Cyberpunk 2077").
* **Hybrid Ranking**: Combines content similarity, collaborative overlap, and popularity into a single mathematical ranking formula in the Node.js backend.

---

## Future Enhancements (Version 2+)

* **Python ML microservice built using FastAPI.**
* **Advanced Content-Based Filtering**: Uses TF-IDF vectorization and cosine similarity to measure content similarity.
* **Deep Learning Integration**: TensorFlow-based neural collaborative filtering and user/content embeddings.

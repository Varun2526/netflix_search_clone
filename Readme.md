# 🎮🎬 Kairo

### Unified Entertainment Recommendation Platform

*Progressive Full-Stack MERN Learning Project*

---

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

</div>

---

# 📌 Project Overview

**Kairo** is a full-stack entertainment recommendation platform that combines both **movies** and **games** into a single intelligent discovery ecosystem. 

Inspired by recommendation systems used in Netflix, Steam, Xbox Game Pass, and Amazon, the platform provides a unified "content" experience. For example, if a user searches for "Thriller", the platform intelligently displays thriller movies, thriller games, trending content, and critic picks in one combined view.

This project is designed as a progressive learning journey. **Version 1** focuses strictly on strong MERN-stack fundamentals, scalable backend architecture, and logic-based recommendation systems (without advanced AI). Future versions will introduce machine learning and deep learning techniques.

---

# 🎯 Project Goals

This project is being built to learn and understand:

* 🌐 Full-stack MERN development
* 🏗️ Scalable backend architecture & REST APIs
* 🔐 Authentication systems (JWT)
* 🗄️ Database design for unified content (MongoDB)
* 🧩 Recommendation system logic (filtering, ranking, metadata matching)
* 📊 User behavior analysis
* ⚡ Modular software engineering

---

# 🛣️ Development Roadmap

---

# ✅ Version 1 — MERN Foundation (Current Focus)

### Goal
Build a complete entertainment recommendation platform using strong MERN architecture and logic-based recommendation algorithms. *No AI or deep learning is used in Version 1.*

## 🔐 Authentication System
* User Registration and Login
* Secure JWT-based authentication
* Protected routes for authenticated users

## 🎮🎬 Unified Entertainment Platform UI
* Dark, modern, cinematic theme inspired by Steam and Netflix
* Hero banners
* Unified recommendation rows (movies & games together)
* Responsive layout with smooth hover effects

## 🔍 Search & Discovery
* Search movies and games together
* Filter by genre or category
* Browse trending and top-rated content
* Discover critic picks

## 📄 Content Details
* View rich content metadata including descriptions, genres, tags, developer/studio information, and average ratings.

## 👤 User Interaction
* **Wishlist**: Save content for later
* **Ratings & Favorites**: Rate content on a 1-5 scale or mark as favorite
* **Content History**: Track recently viewed or played content

---

# 🧠 Version 1 Recommendation Logic

Recommendations in Version 1 are implemented using backend logic and database queries, focusing on the fundamentals of recommendation algorithms.

## 1️⃣ Content-Based Filtering
Recommend similar content using genres, tags, categories, mechanics, and metadata overlap.
* *Example*: If a user likes psychological thrillers, recommend similar movies and games.

## 2️⃣ Basic Collaborative Filtering
Implement simple collaborative logic using ratings overlap, wishlist overlap, and similar user interactions.
* *Example*: "Users who liked Interstellar also liked Cyberpunk 2077."

## 3️⃣ Hybrid Recommendation System
Combine multiple logic scores into one final ranking system:
`finalScore = (0.5 × contentScore) + (0.3 × collaborativeScore) + (0.2 × popularityScore)`

---

# 🚀 Future Version 2 (Not Currently Building)

Future versions will transform the platform into an intelligent AI-powered recommendation system.

* **Python ML microservice built using FastAPI.**
* **Content-Based Filtering**: Uses TF-IDF vectorization and cosine similarity to measure content similarity.
* **TensorFlow Integration**: Neural collaborative filtering and embeddings.
* **Advanced Personalization**: Deep learning recommendation models.

---

# 🏗️ Version 1 Architecture

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

*(Note: Python services and TensorFlow are planned for future versions, keeping V1 lean and focused on MERN architecture).*

---

# 🛠️ Tech Stack

| Domain | Technologies |
| --- | --- |
| **🎨 Frontend** | React.js, Tailwind CSS, React Router, Axios, Framer Motion |
| **⚙️ Backend** | Node.js, Express.js, JWT Authentication, REST APIs |
| **🗄️ Database** | MongoDB, Mongoose |

---

# 📂 Project Structure

```bash
project/
│
├── frontend/          # React Frontend
├── backend/           # Node.js Backend
├── docs/              # Documentation
└── README.md
```

---

# 💾 Data Management & Version Control Rules

Because this project utilizes massive real-world datasets (e.g., a 400MB+ Steam dataset with over 122,000 games and IMDB datasets), strict version control rules are enforced to keep the GitHub repository clean and prevent size limit errors.

**Strict Git Rules:**
1. **Raw Datasets are Local-Only**: NEVER commit huge raw datasets (like `games.csv` or `imdb.csv`). They must remain locally on your machine forever.
2. **Never blindly run `git add .`**: Always use targeted commands like `git add backend/` or `git add frontend/`.
3. **Always check `git status`**: Before any commit or push, verify that no file larger than ~50MB is staged.
4. **Gitignore is Enforced**: The `backend/data/raw/` directory is permanently added to `.gitignore`. Never override this.

**Production Deployment & Seeding:**
* **Local Development**: We use the full raw datasets to populate a robust local MongoDB for testing algorithms and search functionality.
* **Production (MongoDB Atlas)**: To stay within the free-tier 512MB limit, we use a utility script (`backend/data/create-prod-seed.js`) that filters out only the highest-quality, most popular titles.
* Only curated, lightweight seed files (like `filtered-production-seed.json`) may be committed and pushed to GitHub for deployment.

**How to Setup Data Locally:**
Since raw datasets are not tracked in Git, you must download them manually to run the full local seed:
1. Download the [Steam Games Dataset](https://www.kaggle.com/datasets/fronkongames/steam-games-dataset) from Kaggle.
2. Place the dataset at `backend/data/raw/steam/games.csv`.
3. Ensure the IMDB dataset is at `backend/data/raw/imdb/IMDB-Movie-Data.csv`.
4. Run `node --max-old-space-size=4096 data/seed.js` from the `backend/` directory to populate your local database.

---

# 📊 Database Collections & Data Models

| Collection | Purpose |
| --- | --- |
| `users` | Username, email, passwordHash, preferences |
| `content` | Unified model for movies/games (title, type, description, genres, tags, coverImage, releaseDate, averageRating) |
| `ratings` | User ratings (userId, contentId, score) |
| `wishlist` | Saved content (userId, contentId) |
| `contentHistory` | User interaction history (userId, contentId, interactionTime, viewtime/playtime) |

---

# 🌟 Special Highlights

✅ Unified content discovery (Movies + Games)
✅ Logic-based hybrid recommendation engine
✅ Realistic, scalable backend structure
✅ Modern cinematic UI
✅ Progressive learning roadmap

---

<div align="center">

# ⭐ Final Vision

**GameMind AI** represents the bridge between full-stack web development and recommendation system logic.

The goal is to build a highly scalable, realistic MERN platform that proves strong fundamentals before progressively evolving into an advanced AI ecosystem.

</div>

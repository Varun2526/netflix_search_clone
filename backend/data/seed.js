import { config } from "dotenv";
import mongoose from "mongoose";
import Content from "../models/Content.model.js";
import { transformIMDB } from "./transformers/imdb.transformer.js";
import { transformSteam } from "./transformers/steam.transformer.js";
import { transformTMDB } from "./transformers/tmdb.transformer.js";

config();
const MONGO_URI = process.env.DB_URL;

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Process Movies
    console.log("🎬 Processing Movies (IMDB & TMDB)...");
    const imdbMovies = transformIMDB();
    const tmdbMovies = transformTMDB();
    
    // Combine movies
    const parsedMovies = [...imdbMovies, ...tmdbMovies];

    const existingMovies = await Content.find({ type: "movie" }, { title: 1 }).lean();
    const existingMovieTitles = new Set(existingMovies.map(m => m.title));
    
    const newMovies = parsedMovies.filter(m => !existingMovieTitles.has(m.title));
    if (newMovies.length > 0) {
      // Chunking for safe insert
      const chunkSize = 5000;
      for (let i = 0; i < newMovies.length; i += chunkSize) {
          const chunk = newMovies.slice(i, i + chunkSize);
          await Content.insertMany(chunk, { ordered: false }).catch(() => {});
      }
      console.log(`➕ Added ${newMovies.length} NEW movies.`);
    } else {
      console.log(`⚡ All ${parsedMovies.length} movies already exist. Skipping.`);
    }

    // 2. Process Games (Optional — if games.csv is present)
    console.log("🎮 Processing Games...");
    const parsedGames = transformSteam();
    if (parsedGames.length > 0) {
      const existingGames = await Content.find({ type: "game" }, { title: 1 }).lean();
      const existingGameTitles = new Set(existingGames.map(g => g.title));
      
      const newGames = parsedGames.filter(g => !existingGameTitles.has(g.title));
      if (newGames.length > 0) {
        // Chunking the insert to prevent memory overload on huge datasets
        const chunkSize = 10000;
        for (let i = 0; i < newGames.length; i += chunkSize) {
           const chunk = newGames.slice(i, i + chunkSize);
           await Content.insertMany(chunk, { ordered: false }).catch(() => {});
        }
        console.log(`➕ Added ${newGames.length} NEW games.`);
      } else {
        console.log(`⚡ All ${parsedGames.length} games already exist. Skipping.`);
      }
    }

    const total = await Content.countDocuments();
    console.log(`✅ Seeding Complete! Total documents in DB: ${total}`);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();

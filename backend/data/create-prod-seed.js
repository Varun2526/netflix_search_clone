import { config } from "dotenv";
import mongoose from "mongoose";
import Content from "../models/Content.model.js";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, "../.env") });

const MONGO_URI = process.env.DB_URL;

async function createProdSeed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1. Fetch top 3,000 highly-rated and popular games
    // Criteria: At least 1000 votes to ensure popularity, and a rating of 7.0+
    const topGames = await Content.find({
      type: "game",
      voteCount: { $gte: 1000 },
      averageRating: { $gte: 7.0 }
    })
      .sort({ voteCount: -1 }) // Most popular first
      .limit(3000)
      .lean(); // Fetch as plain JS objects
      
    // Remove Mongoose specific fields for clean JSON export
    topGames.forEach(g => {
        delete g._id;
        delete g.__v;
        delete g.createdAt;
        delete g.updatedAt;
    });

    console.log(`🎮 Found ${topGames.length} premium games for production.`);

    // 2. Fetch all 1,000 movies (IMDB top 1000 is already a curated premium list)
    const topMovies = await Content.find({ type: "movie" }).lean();
    
    topMovies.forEach(m => {
        delete m._id;
        delete m.__v;
        delete m.createdAt;
        delete m.updatedAt;
    });
    console.log(`🎬 Found ${topMovies.length} movies for production.`);

    const allProdContent = [...topMovies, ...topGames];

    // 3. Write to JSON
    const outputPath = resolve(__dirname, "filtered-production-seed.json");
    writeFileSync(outputPath, JSON.stringify(allProdContent, null, 2));

    console.log(`📦 Successfully wrote ${allProdContent.length} premium items to ${outputPath}`);
    
    // Print size info
    const fs = await import("fs");
    const stats = fs.statSync(outputPath);
    const fileSizeInMegabytes = stats.size / (1024 * 1024);
    console.log(`💾 File size: ${fileSizeInMegabytes.toFixed(2)} MB`);
    console.log("💡 This size is perfectly safe for MongoDB Atlas Free Tier (512MB limit)!");

  } catch (err) {
    console.error("❌ Error creating prod seed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

createProdSeed();

import { config } from "dotenv";
import mongoose from "mongoose";
import Content from "../models/Content.model.js";
import { transformIMDB } from "./transformers/imdb.transformer.js";

config();
const MONGO_URI = process.env.DB_URL;

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Transform CSV data 
    const movies = transformIMDB();
    console.log(`Transformed ${movies.length} movies from IMDB CSV`);

    // Clear existing content (optional — only movies) 
    const deleted = await Content.deleteMany({ type: "movie" });
    console.log(`Cleared ${deleted.deletedCount} existing movie documents`);

    // insert data
    const inserted = await Content.insertMany(movies, { ordered: false });
    console.log(`Seeded ${inserted.length} movies into the content collection`);

    // summary count
    const total = await Content.countDocuments();
    console.log(`Total documents in content collection: ${total}`);
  } 
  catch (err) {
    if (err.code === 11000) {
      // Duplicate key errors during insertMany — some rows may have been inserted
      console.warn("Some duplicates were skipped (duplicate key error)");
    } else {
      console.error(" Seed error:", err.message);
    }
  }
  finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seed();

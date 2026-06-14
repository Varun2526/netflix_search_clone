// One-off migration: game `genres` were polluted with Steam feature-categories
// (Single-player, Steam Achievements, Family Sharing...) while the real genres
// often sat in `tags`. This rebuilds game genres as
//   genres = (genres ∪ tags) ∩ realGenreWhitelist
// dropping the feature junk and recovering genres stored in tags.
// Usage: node data/clean-game-genres.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Steam store "genres" that are genuine content genres (not features/categories)
const GAME_GENRES = [
  "Action", "Adventure", "Casual", "Indie", "Massively Multiplayer", "MMO",
  "RPG", "Racing", "Simulation", "Sports", "Strategy", "Free To Play",
  "Early Access", "Design & Illustration", "Game Development", "Utilities",
  "Education", "Software Training", "Web Publishing", "Animation & Modeling",
  "Audio Production", "Video Production", "Photo Editing", "Documentary",
];

const Content = (await import("../models/Content.model.js")).default;
await mongoose.connect(process.env.DB_URL);

const before = await Content.distinct("genres", { type: "game" });

// native driver accepts an aggregation-pipeline update directly
const result = await Content.collection.updateMany(
  { type: "game" },
  [
    {
      $set: {
        genres: {
          $setIntersection: [
            { $setUnion: [{ $ifNull: ["$genres", []] }, { $ifNull: ["$tags", []] }] },
            GAME_GENRES,
          ],
        },
      },
    },
  ]
);

const after = await Content.distinct("genres", { type: "game" });
const emptied = await Content.countDocuments({ type: "game", genres: { $size: 0 } });

console.log(`Updated ${result.modifiedCount} game docs`);
console.log(`Distinct game genres: ${before.length} -> ${after.length}`);
console.log(`Clean game genres now:`, after.sort());
console.log(`Games left with no genre: ${emptied}`);
process.exit(0);

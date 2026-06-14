// Exports a deployment-ready seed: only items with a poster AND description,
// the top N per type by popularityScore. Writes data/production-seed.json.
// Usage: node data/export-clean-seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const CAPS = { movie: 2000, game: 2000 }; // upper bound per type
const QUALITY = {
  posterImage: { $exists: true, $ne: "" },
  description: { $exists: true, $ne: "" },
};

const Content = (await import("../models/Content.model.js")).default;

await mongoose.connect(process.env.DB_URL);

let all = [];
for (const type of Object.keys(CAPS)) {
  const docs = await Content.find({ type, ...QUALITY })
    .sort({ popularityScore: -1, averageRating: -1 })
    .limit(CAPS[type])
    .lean();
  console.log(`${type}: kept ${docs.length} (cap ${CAPS[type]})`);
  all = all.concat(docs);
}

const outPath = path.join(__dirname, "production-seed.json");
fs.writeFileSync(outPath, JSON.stringify(all));
const sizeMB = (fs.statSync(outPath).size / 1048576).toFixed(2);
console.log(`\nWrote ${all.length} docs -> ${outPath} (${sizeMB} MB)`);
console.log("Import to Atlas with:");
console.log(`  mongoimport --uri "<ATLAS_URI>" --collection contents --jsonArray --file ${outPath}`);

process.exit(0);

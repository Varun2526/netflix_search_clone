import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse a CSV line that may contain quoted fields with commas inside.
 */
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  let inBrackets = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '[') {
      inBrackets = true;
      current += char;
    } else if (char === ']') {
      inBrackets = false;
      current += char;
    } else if (char === "," && !inQuotes && !inBrackets) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Transform raw Steam CSV data into Content model objects.
 */
export function transformSteam() {
  const csvPath = resolve(__dirname, "../raw/steam/games.csv");
  
  if (!existsSync(csvPath)) {
    console.warn(`⚠️  Steam data not found at ${csvPath}. Please download it via kagglehub.`);
    return [];
  }

  const raw = readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) return [];

  // Parse headers to dynamically find column indexes
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  
  // Find indexes of important columns (handle variations in naming)
  const idx = {
    name: headers.indexOf("name"),
    description: headers.findIndex(h => h.includes("detailed description") || h.includes("about the game") || h === "short description"),
    genres: headers.findIndex(h => h === "genres" || h === "genre"),
    tags: headers.findIndex(h => h === "tags"),
    developers: headers.findIndex(h => h === "developers" || h === "developer"),
    publishers: headers.findIndex(h => h === "publishers" || h === "publisher"),
    releaseDate: headers.findIndex(h => h === "release date"),
    metacritic: headers.findIndex(h => h === "metacritic score" || h === "metacritic"),
    positive: headers.findIndex(h => h === "positive"),
    negative: headers.findIndex(h => h === "negative"),
    price: headers.findIndex(h => h === "price")
  };

  if (idx.name === -1) {
    console.error("❌ Could not find 'Name' column in Steam dataset.");
    return [];
  }

  const dataLines = lines.slice(1);
  const contents = [];

  for (const line of dataLines) {
    const fields = parseCSVLine(line);
    const title = fields[idx.name];
    
    if (!title) continue;

    // Parse genres & tags (they might be comma separated inside quotes, or single items)
    const rawGenres = idx.genres !== -1 ? fields[idx.genres] : "";
    const genres = rawGenres ? rawGenres.replace(/[\[\]']/g, "").split(",").map(g => g.trim()) : [];
    
    const rawTags = idx.tags !== -1 ? fields[idx.tags] : "";
    const tags = rawTags ? rawTags.replace(/[\[\]']/g, "").split(",").map(t => t.trim()) : [];

    // Parse developers as cast equivalent (so we can search by studio)
    const rawDevs = idx.developers !== -1 ? fields[idx.developers] : "";
    const developers = rawDevs ? rawDevs.replace(/[\[\]']/g, "").split(",").map(d => d.trim()) : [];
    
    // Calculate a mock 1-10 rating from positive/negative votes
    let averageRating = 0;
    let voteCount = 0;
    if (idx.positive !== -1 && idx.negative !== -1) {
      const pos = parseInt(fields[idx.positive]) || 0;
      const neg = parseInt(fields[idx.negative]) || 0;
      voteCount = pos + neg;
      if (voteCount > 0) {
        averageRating = (pos / voteCount) * 10;
      }
    }

    // Release year
    let releaseYear = null;
    if (idx.releaseDate !== -1) {
      const dateStr = fields[idx.releaseDate];
      const match = dateStr.match(/\b(19|20)\d{2}\b/);
      if (match) releaseYear = parseInt(match[0]);
    }

    contents.push({
      title: title || "",
      type: "game",
      genres: genres,
      description: idx.description !== -1 ? fields[idx.description] : "",
      director: rawDevs || "", // Use developer as director
      cast: developers,        // Store developers/studios in cast for searchability
      releaseDate: releaseYear,
      runtime: null, // N/A for games
      averageRating: parseFloat(averageRating.toFixed(1)),
      voteCount: voteCount,
      revenue: idx.price !== -1 ? parseFloat(fields[idx.price]) || 0 : 0, // Using price instead of revenue
      criticScore: idx.metacritic !== -1 ? parseInt(fields[idx.metacritic]) || 0 : 0,
      popularityScore: voteCount, // proxy for popularity
      posterImage: "",
      bannerImage: "",
      tags: tags,
    });
  }

  return contents;
}

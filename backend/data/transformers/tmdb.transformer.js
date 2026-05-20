import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

function parseJSONField(field) {
  if (!field || field === '[]' || field === '') return [];
  try {
    // Replace double-double quotes with single-double quotes for valid JSON
    const cleanJson = field.replace(/""/g, '"');
    return JSON.parse(cleanJson);
  } catch (e) {
    return [];
  }
}

export function transformTMDB() {
  const moviesPath = resolve(__dirname, "../raw/tmdb/tmdb_5000_movies.csv");
  const creditsPath = resolve(__dirname, "../raw/tmdb/tmdb_5000_credits.csv");

  if (!existsSync(moviesPath)) {
    console.warn(`⚠️  TMDB movies data not found at ${moviesPath}.`);
    return [];
  }

  // --- Load Credits (Cast & Crew) ---
  const creditsMap = new Map();
  if (existsSync(creditsPath)) {
    const rawCredits = readFileSync(creditsPath, "utf-8");
    const creditLines = rawCredits.split("\n").filter(line => line.trim() !== "");
    
    // Skip header
    for (let i = 1; i < creditLines.length; i++) {
      const fields = parseCSVLine(creditLines[i]);
      if (fields.length < 4) continue;
      
      const id = fields[0];
      const castArray = parseJSONField(fields[2]);
      const crewArray = parseJSONField(fields[3]);
      
      // Get top 5 cast members
      const castNames = castArray.slice(0, 5).map(c => c.name);
      
      // Get director
      const directorObj = crewArray.find(c => c.job === "Director");
      const directorName = directorObj ? directorObj.name : "";

      creditsMap.set(id, { cast: castNames, director: directorName });
    }
  }

  // --- Load Movies ---
  const rawMovies = readFileSync(moviesPath, "utf-8");
  const movieLines = rawMovies.split("\n").filter(line => line.trim() !== "");
  
  if (movieLines.length === 0) return [];
  
  const headers = parseCSVLine(movieLines[0]).map(h => h.toLowerCase());
  
  const idx = {
    id: headers.indexOf("id"),
    title: headers.indexOf("title"),
    overview: headers.indexOf("overview"),
    genres: headers.indexOf("genres"),
    keywords: headers.indexOf("keywords"),
    release_date: headers.indexOf("release_date"),
    revenue: headers.indexOf("revenue"),
    runtime: headers.indexOf("runtime"),
    vote_average: headers.indexOf("vote_average"),
    vote_count: headers.indexOf("vote_count"),
  };

  if (idx.title === -1) {
    console.error("❌ Could not find 'title' column in TMDB dataset.");
    return [];
  }

  const contents = [];
  
  for (let i = 1; i < movieLines.length; i++) {
    const fields = parseCSVLine(movieLines[i]);
    const title = fields[idx.title];
    const id = fields[idx.id];
    
    if (!title || !id) continue;

    const genres = parseJSONField(fields[idx.genres]).map(g => g.name);
    const tags = parseJSONField(fields[idx.keywords]).map(k => k.name);
    
    // Merge with credits
    const credits = creditsMap.get(id) || { cast: [], director: "" };

    let releaseYear = null;
    if (idx.release_date !== -1 && fields[idx.release_date]) {
      const year = fields[idx.release_date].split("-")[0];
      if (year) releaseYear = parseInt(year);
    }

    contents.push({
      title: title || "",
      type: "movie",
      genres: genres,
      description: idx.overview !== -1 ? fields[idx.overview] : "",
      director: credits.director,
      cast: credits.cast,
      releaseDate: releaseYear,
      runtime: idx.runtime !== -1 ? parseInt(fields[idx.runtime]) || null : null,
      averageRating: idx.vote_average !== -1 ? parseFloat(fields[idx.vote_average]) || 0 : 0,
      voteCount: idx.vote_count !== -1 ? parseInt(fields[idx.vote_count]) || 0 : 0,
      revenue: idx.revenue !== -1 ? parseInt(fields[idx.revenue]) || 0 : 0,
      criticScore: 0, 
      popularityScore: idx.vote_count !== -1 ? parseInt(fields[idx.vote_count]) || 0 : 0,
      posterImage: "",
      bannerImage: "",
      tags: tags,
    });
  }

  return contents;
}

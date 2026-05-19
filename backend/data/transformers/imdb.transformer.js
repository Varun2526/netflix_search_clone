import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse a CSV line that may contain quoted fields with commas inside.
 * Handles: "Action,Adventure,Sci-Fi" as a single field.
 */
function parseCSVLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      fields.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Push the last field
  fields.push(current.trim());
  return fields;
}

/**
 * Transform raw IMDB CSV data into Content model objects.
 *
 * CSV Columns:
 * Rank, Title, Genre, Description, Director, Actors, Year,
 * Runtime (Minutes), Rating, Votes, Revenue (Millions), Metascore
 *
 * @returns {Array} Array of plain objects ready for Content.insertMany()
 */
export function transformIMDB() {
  const csvPath = resolve(__dirname, "../raw/imdb/IMDB-Movie-Data.csv");
  const raw = readFileSync(csvPath, "utf-8");

  const lines = raw.split("\n").filter((line) => line.trim() !== "");

  // Skip header row
  const dataLines = lines.slice(1);

  const contents = dataLines.map((line) => {
    const fields = parseCSVLine(line);

    // fields: [Rank, Title, Genre, Description, Director, Actors, Year, Runtime, Rating, Votes, Revenue, Metascore]
    const [
      _rank,
      title,
      genre,
      description,
      director,
      actors,
      year,
      runtime,
      rating,
      votes,
      revenue,
      metascore,
    ] = fields;

    return {
      title: title || "",
      type: "movie",
      genres: genre ? genre.split(",").map((g) => g.trim()) : [],
      description: description || "",
      director: director || "",
      cast: actors ? actors.split(",").map((a) => a.trim()) : [],
      releaseDate: year ? parseInt(year) : null,
      runtime: runtime ? parseInt(runtime) : null,
      averageRating: rating ? parseFloat(rating) : 0,
      voteCount: votes ? parseInt(votes) : 0,
      revenue: revenue ? parseFloat(revenue) : 0,
      criticScore: metascore ? parseInt(metascore) : 0,
      popularityScore: 0,
      posterImage: "",
      bannerImage: "",
      tags: [],
    };
  });

  // Filter out any entries with no title (malformed rows)
  return contents.filter((c) => c.title);
}

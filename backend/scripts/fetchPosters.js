import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Simple model since we only need to update posterImage
const contentSchema = new mongoose.Schema({
  title: String,
  type: String,
  releaseYear: Number,
  releaseDate: Number,
  posterImage: String,
  tmdbAttempted: Boolean,
}, { strict: false });

const Content = mongoose.model('Content', contentSchema, 'contents');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchPosters() {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
    console.error('Missing or invalid TMDB_API_KEY in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB:', process.env.DB_URL);

    const contents = await Content.find({ 
      type: 'movie',
      $or: [
        { posterImage: { $exists: false } },
        { posterImage: "" }
      ],
      tmdbAttempted: { $ne: true }
    });

    console.log(`Found ${contents.length} items without posters. Starting update...`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      const year = item.releaseYear || item.releaseDate;
      const endpoint = item.type === 'game' ? '/search/tv' : '/search/movie'; 
      
      try {
        const url = new URL(`${TMDB_BASE_URL}/search/multi`);
        url.searchParams.append('api_key', TMDB_API_KEY);
        url.searchParams.append('query', item.title);
        if (year) url.searchParams.append('year', year);

        const res = await fetch(url.toString());
        const data = await res.json();

        const results = data.results;
        if (results && results.length > 0) {
          // Find the first result with a poster
          const bestMatch = results.find(r => r.poster_path);
          if (bestMatch) {
            item.posterImage = `${IMAGE_BASE_URL}${bestMatch.poster_path}`;
            item.tmdbAttempted = true;
            await item.save();
            updatedCount++;
            console.log(`[${i+1}/${contents.length}] Updated: ${item.title}`);
          } else {
            item.tmdbAttempted = true;
            await item.save();
            notFoundCount++;
            console.log(`[${i+1}/${contents.length}] No poster image for: ${item.title}`);
          }
        } else {
          item.tmdbAttempted = true;
          await item.save();
          notFoundCount++;
          console.log(`[${i+1}/${contents.length}] No TMDB results for: ${item.title}`);
        }
      } catch (err) {
        console.error(`[${i+1}/${contents.length}] Error fetching TMDB for ${item.title}:`, err.message);
      }

      // Respect TMDB rate limits (approx 40-50 requests per second is allowed now, but play it safe)
      await delay(100);
    }

    console.log(`\nDone! Updated ${updatedCount} posters. ${notFoundCount} not found.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fetchPosters();

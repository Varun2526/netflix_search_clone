import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const contentSchema = new mongoose.Schema({
  title: String,
  type: String,
  releaseYear: Number,
  releaseDate: Number,
  posterImage: String,
  bannerImage: String,
  description: String,
  director: String,
  cast: [String],
  criticScore: Number,
  averageRating: Number,
  steamAttempted: Boolean,
}, { strict: false });

const Content = mongoose.model('Content', contentSchema, 'contents');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchGamePosters() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB:', process.env.DB_URL);

    // Find the top 500 games that might be missing proper descriptions or have that weird "135" placeholder
    const contents = await Content.find({ 
      type: 'game',
      $or: [
        { description: { $exists: false } },
        { description: "" },
        { director: "135" },
        { description: { $regex: /^135$/ } },
        { description: { $regex: /^[0-9]$/ } }
      ]
    }).sort({ popularityScore: -1 }).limit(500);

    console.log(`Found ${contents.length} popular games needing full details. Starting update using Steam API...`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (let i = 0; i < contents.length; i++) {
      const item = contents[i];
      
      try {
        // Step 1: Search for the game to get its App ID
        const searchUrl = new URL(`https://store.steampowered.com/api/storesearch/`);
        searchUrl.searchParams.append('term', item.title);
        searchUrl.searchParams.append('l', 'english');
        searchUrl.searchParams.append('cc', 'US');

        const searchRes = await fetch(searchUrl.toString());
        const searchData = await searchRes.json();

        if (searchData && searchData.items && searchData.items.length > 0) {
          const appId = searchData.items[0].id;
          
          // Step 2: Fetch full app details using the App ID
          const detailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json();
          
          if (detailsData && detailsData[appId] && detailsData[appId].success) {
            const gameInfo = detailsData[appId].data;

            // Map Steam data to our MongoDB model
            item.posterImage = `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_600x900.jpg`;
            if (gameInfo.background) item.bannerImage = gameInfo.background;
            
            // Clean up description (remove HTML tags Steam sometimes includes)
            if (gameInfo.short_description) {
              item.description = gameInfo.short_description.replace(/<[^>]*>?/gm, ''); 
            }
            
            if (gameInfo.developers && gameInfo.developers.length > 0) {
              item.director = gameInfo.developers[0]; // Map developer to director
            }
            
            if (gameInfo.publishers && gameInfo.publishers.length > 0) {
              item.cast = gameInfo.publishers; // Map publishers to cast
            }
            
            if (gameInfo.metacritic && gameInfo.metacritic.score) {
              item.criticScore = gameInfo.metacritic.score;
              item.averageRating = gameInfo.metacritic.score / 10;
            }
            
            await item.save();
            updatedCount++;
            console.log(`[${i+1}/${contents.length}] Fully Updated: ${item.title}`);
          } else {
            notFoundCount++;
            console.log(`[${i+1}/${contents.length}] Details not found for: ${item.title} (${appId})`);
          }
        } else {
          notFoundCount++;
          console.log(`[${i+1}/${contents.length}] No Steam search results for: ${item.title}`);
        }
      } catch (err) {
        console.error(`[${i+1}/${contents.length}] Error fetching Steam for ${item.title}:`, err.message);
      }

      // Steam rate limit is quite generous but let's do 2 requests per loop -> 500ms delay to be perfectly safe
      await delay(500);
    }

    console.log(`\nDone! Updated ${updatedCount} game posters. ${notFoundCount} not found.`);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

fetchGamePosters();

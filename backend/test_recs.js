import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

import Content from "./models/Content.model.js";
import User from "./models/User.model.js";
import History from "./models/History.model.js";
import Rating from "./models/Rating.model.js";

async function test() {
  try {
    await mongoose.connect(process.env.DB_URL);
    const user = await User.findOne();
    const userId = user._id;
    console.log("Testing for user:", userId);

    const interactedContentIds = new Set();
    (user.recentlyViewed || []).forEach(id => interactedContentIds.add(id.toString()));
    (user.wishlist || []).forEach(id => interactedContentIds.add(id.toString()));

    const userRatings = await Rating.find({ userId });
    userRatings.forEach(r => interactedContentIds.add(r.contentId.toString()));

    console.log("Interacted IDs:", interactedContentIds.size);

    const favoriteGenresSet = new Set();
    if (user.favoriteGenres && user.favoriteGenres.length > 0) {
      user.favoriteGenres.forEach(genre => favoriteGenresSet.add(genre));
    }

    const interactedContent = await Content.find({_id: { $in: Array.from(interactedContentIds) }});
    interactedContent.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => favoriteGenresSet.add(genre));
      }
    });

    const favoriteGenres = Array.from(favoriteGenresSet);
    console.log("Favorite genres:", favoriteGenres.length);

    const similarUsers = await User.find({
      _id: { $ne: userId },
      $or: [
        { recentlyViewed: { $in: Array.from(interactedContentIds) } },
        { wishlist: { $in: Array.from(interactedContentIds) } }
      ]
    }).limit(50);

    console.log("Similar users:", similarUsers.length);

    const collabContentScores = {};
    similarUsers.forEach(simUser => {
      const simUserItems = [...(simUser.recentlyViewed || []), ...(simUser.wishlist || [])];
      simUserItems.forEach(itemId => {
        const idStr = itemId.toString();
        if (!interactedContentIds.has(idStr)) {
          collabContentScores[idStr] = (collabContentScores[idStr] || 0) + 1;
        }
      });
    });

    if (favoriteGenres.length === 0 && Object.keys(collabContentScores).length === 0) {
      console.log("Fallback hit!");
      const fallbackContent = await Content.find({_id: { $nin: Array.from(interactedContentIds) }})
                                          .sort({ popularityScore: -1 })
                                          .limit(10);
      console.log("Fallback content count:", fallbackContent.length);
      process.exit(0);
    }

    const candidateIds = Object.keys(collabContentScores);
    const candidates = await Content.find({
      _id: { $nin: Array.from(interactedContentIds) },
      $or: [
        { _id: { $in: candidateIds } },
        { genres: { $in: favoriteGenres } }
      ]
    }).limit(100);

    console.log("Candidates:", candidates.length);

  } catch (e) {
    console.error("ERROR:", e);
  }
  process.exit(0);
}
test();

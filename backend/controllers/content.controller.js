import Content from "../models/Content.model.js";
import User from "../models/User.model.js";
import History from "../models/History.model.js";
import Rating from "../models/Rating.model.js";

// Search movies and games
export const search = async (req, res) => {
  try {
    // get data from url
    // get data from url
    const { query, type, genre, limit = 20, page = 1, hasImage } = req.query;
    // create empty object
    const filters = {};

    // search by title OR genre
    if (query) {
      filters.$or = [
        { title: { $regex: query, $options: "i" } },
        { genres: { $regex: query, $options: "i" } }
      ];
    }
    // filter by movie or game
    if (type) {
      filters.type = type;
    }
    // filter by genre
    if (genre) {
      filters.genres = genre;
    }
    // only items with poster images
    if (hasImage === 'true') {
      filters.posterImage = { $exists: true, $ne: "" };
    }

    // find data from database with pagination
    const parsedLimit = parseInt(limit);
    const parsedPage = Math.max(1, parseInt(page));
    const skip = (parsedPage - 1) * parsedLimit;

    const totalCount = await Content.countDocuments(filters);
    const queryBuilder = Content.find(filters).sort({ popularityScore: -1 }).skip(skip);
    const data = await (parsedLimit === 0 ? queryBuilder : queryBuilder.limit(Math.min(parsedLimit, 200)));
    // send response
    res.status(200).json({ success: true, count: data.length, totalCount, page: parsedPage, data: data, });
  }
  catch (error) {
    console.log("Error in search:", error);
    res.status(500).json({ error: "Failed to search content" });
  }
};

//get trending movies and games

export const getTrending = async (req, res) => {
  try {
    //get data from url
    const { type, limit = 10 } = req.query;
    // create empty object
    const filters = {};
    // filter by movie or game
    if (type) {
      filters.type = type;
    }
    // find data from database
    const data = await Content.find(filters).sort({ popularityScore: -1 }).limit(parseInt(limit));
    //send response
    res.status(200).json({ success: true, count: data.length, data: data, });
  }
  catch (error) {
    console.log("Error in getTrending:", error);
    res.status(500).json({ error: "Failed to get trending content" });
  }
};


export const getContentDetails = async (req, res) => {
  try {
    // get uid from url 
    const { id } = req.params;
    //find data/content from the database
    const data = await Content.findById(id);
    // send response
    if (!data) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }
    res.status(200).json({ success: true, data: data });
  }
  catch (error) {
    console.log("Error in getContentDetails:", error);
    res.status(500).json({ error: "Failed to get content details" });
  }
};

export const addToHistory = async (req, res) => {
  try {
    // get data from body
    const { contentId } = req.body;
    const userId = req.user._id;
    // check content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({success: false,message: "Content not found",});
    }
    // create or update history
    await History.findOneAndUpdate({ userId, contentId }, {lastAccessedAt: new Date(),},{upsert: true,new: true,});

    // also track on the user's recentlyViewed list so the recommender and
    // profile have a behavior signal. Keep it deduped, most-recent-first, capped at 20.
    await User.findByIdAndUpdate(userId, {
      $pull: { recentlyViewed: contentId },
    });
    await User.findByIdAndUpdate(userId, {
      $push: { recentlyViewed: { $each: [contentId], $position: 0, $slice: 20 } },
    });

    // response
    res.status(200).json({success: true,message: "History updated successfully",});
  } 
  catch (error) {
    console.log("Error in addToHistory:", error);
    res.status(500).json({error: "Failed to add history",});
  }
};


export const addToWishlist = async(req,res)=>{

  try{
      //find user id and content ifd from req body
      const {contentId} = req.body;
      const userId = req.user._id;
      // user 
      const user = await User.findById(userId)
      //find user
      if(!user){
        return res.status(404).json({success:false,message:"User not found"})
      }
      //check content exists 
      const content = await Content.findById(contentId);
      if(!content){
        return res.status(404).json({success:false,message:"content not found "})
      }
      //avoid duplicates
      if(!user.wishlist.includes(contentId)){
        user.wishlist.push(contentId);
        await user.save();
      }
      res.status(200).json({success:true,message:"Content added to wishlist successfully"})
}
  catch(error){
    console.log("Error in add to wishlist:", error);
    res.status(500).json({ error: "Failed to add content to wishlist" });
}
};

export const removeFromWishlist = async (req, res) => {
  try {
    //get user id and content id from req body
    const { contentId } = req.body;
    const userId = req.user._id;
    //find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    //check if content is in user's wishlist
    if (user.wishlist.includes(contentId)) {
      //remove the content from user's wishlist
      user.wishlist = user.wishlist.filter(id => id.toString() !== contentId);
      await user.save();
    }
    res.status(200).json({ success: true, message: "Content removed from wishlist successfully" });
  } catch (error) {
    console.log("Error in remove from wishlist:", error);
    res.status(500).json({ error: "Failed to remove content from wishlist" });
  }
};

export const rateContent = async (req, res) => {
  try {
    // get user id, content id, and rating score from body
    const { contentId, score } = req.body;
    const userId = req.user._id;

    // validate rating score (must be between 1 and 5)
    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ success: false, message: "Rating score must be between 1 and 5" });
    }

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // find content
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    // check if user already rated this content
    const existingRating = await Rating.findOne({ userId, contentId });

    if (existingRating) {
      // get the old score
      const oldScore = existingRating.score;
      // update the score
      existingRating.score = score;
      await existingRating.save();

      // update content average rating (score * 2 scales 1-5 to 1-10)
      if (content.voteCount > 0) {
        const totalScore = (content.averageRating * content.voteCount) - (oldScore * 2) + (score * 2);
        content.averageRating = Math.round((totalScore / content.voteCount) * 10) / 10;
        await content.save();
      }
    } else {
      // create new rating
      const newRating = new Rating({ userId, contentId, score });
      await newRating.save();

      // calculate new average and increase vote count
      const totalScore = (content.averageRating * content.voteCount) + (score * 2);
      content.voteCount += 1;
      content.averageRating = Math.round((totalScore / content.voteCount) * 10) / 10;
      await content.save();
    }
    res.status(200).json({ success: true, message: "Rating submitted successfully", averageRating: content.averageRating });
  } 
  catch (error) {
    console.log("Error in rateContent:", error);
    res.status(500).json({ error: "Failed to submit rating" });
  }
};


export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Gather every content id the user has already engaged with so we never
    //    recommend something they have seen, wishlisted, or rated.
    const interactedContentIds = new Set();
    (user.recentlyViewed || []).forEach(id => interactedContentIds.add(id.toString()));
    (user.wishlist || []).forEach(id => interactedContentIds.add(id.toString()));

    const userRatings = await Rating.find({ userId });
    const ratingByContent = {}; // contentId -> score (1..5)
    userRatings.forEach(r => {
      interactedContentIds.add(r.contentId.toString());
      ratingByContent[r.contentId.toString()] = r.score;
    });

    // 2. Build a WEIGHTED genre-taste profile (content-based signal).
    //    Each genre accumulates a weight: explicit favorites and wishlist/views add
    //    positive weight; ratings add (score - 3) so a 5★ pushes a genre up (+2)
    //    and a 1★ pushes it down (-2). This makes ratings actually steer the recs.
    const genreWeights = {}; // genre -> number
    const bump = (genres, amount) => {
      (genres || []).forEach(g => { genreWeights[g] = (genreWeights[g] || 0) + amount; });
    };

    (user.favoriteGenres || []).forEach(g => { genreWeights[g] = (genreWeights[g] || 0) + 3; });

    const interactedContent = await Content.find({ _id: { $in: Array.from(interactedContentIds) } });
    interactedContent.forEach(item => {
      const rated = ratingByContent[item._id.toString()];
      if (rated !== undefined) {
        bump(item.genres, rated - 3); // -2 .. +2 based on the rating
      } else {
        bump(item.genres, 1); // viewed/wishlisted but not rated => mild positive
      }
    });

    // Only genres with net-positive weight count as "liked"
    const likedGenres = Object.entries(genreWeights)
      .filter(([, w]) => w > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g);

    // 3. Collaborative filtering: find users who overlap with this user's items,
    //    then count how often THEY engaged with items this user hasn't.
    const similarUsers = await User.find({
      _id: { $ne: userId },
      $or: [
        { recentlyViewed: { $in: Array.from(interactedContentIds) } },
        { wishlist: { $in: Array.from(interactedContentIds) } }
      ]
    }).limit(50);

    const collabContentScores = {}; // contentId -> co-occurrence count
    similarUsers.forEach(simUser => {
      const simUserItems = [...(simUser.recentlyViewed || []), ...(simUser.wishlist || [])];
      simUserItems.forEach(itemId => {
        const idStr = itemId.toString();
        if (!interactedContentIds.has(idStr)) {
          collabContentScores[idStr] = (collabContentScores[idStr] || 0) + 1;
        }
      });
    });

    // 4. Cold-start fallback: nothing to learn from yet -> show several popular
    //    rows (overall, movies, games) so the page still feels full.
    if (likedGenres.length === 0 && Object.keys(collabContentScores).length === 0) {
      const exclude = Array.from(interactedContentIds);
      const [popular, popularMovies, popularGames] = await Promise.all([
        Content.find({ _id: { $nin: exclude } }).sort({ popularityScore: -1 }).limit(16).lean(),
        Content.find({ _id: { $nin: exclude }, type: "movie" }).sort({ popularityScore: -1 }).limit(16).lean(),
        Content.find({ _id: { $nin: exclude }, type: "game" }).sort({ popularityScore: -1 }).limit(16).lean(),
      ]);

      // dedupe across the cold-start rows too
      const used = new Set();
      const dedupe = (items, n) => {
        const out = [];
        for (const it of items) {
          const id = it._id.toString();
          if (!used.has(id)) { out.push(it); used.add(id); }
          if (out.length >= n) break;
        }
        return out;
      };

      const coldSections = [];
      const top = dedupe(popular, 12);
      if (top.length) coldSections.push({ title: "Popular Right Now", reason: "Trending across all users", items: top });
      const m = dedupe(popularMovies, 12);
      if (m.length >= 4) coldSections.push({ title: "Popular Movies", reason: "Most-watched films", items: m });
      const g = dedupe(popularGames, 12);
      if (g.length >= 4) coldSections.push({ title: "Popular Games", reason: "Most-played games", items: g });

      return res.status(200).json({
        success: true,
        message: "Rate titles and add to your watchlist to unlock personalized picks.",
        data: top,
        sections: coldSections,
      });
    }

    // 5. Build the candidate pool from collaborative hits AND liked genres.
    const candidateIds = Object.keys(collabContentScores);
    const candidates = await Content.find({
      _id: { $nin: Array.from(interactedContentIds) },
      $or: [
        { _id: { $in: candidateIds } },
        { genres: { $in: likedGenres } }
      ]
    }).limit(250).lean();

    // 6. Hybrid score = collaborative co-occurrence + weighted genre match + quality.
    const scored = candidates.map(item => {
      const idStr = item._id.toString();
      const collab = collabContentScores[idStr] || 0;
      const collabScore = collab * 3;

      // sum the taste-weights of the genres this candidate shares with the user
      const matchedGenres = (item.genres || []).filter(g => likedGenres.includes(g));
      const genreScore = matchedGenres.reduce((s, g) => s + (genreWeights[g] || 0), 0);

      const score = collabScore + genreScore * 1.5 + (item.averageRating || 0);

      // pick the single best human-readable reason for this pick
      let reason;
      const topMatch = matchedGenres.sort((a, b) => (genreWeights[b] || 0) - (genreWeights[a] || 0))[0];
      if (collab > 0 && collabScore >= genreScore) {
        reason = "Popular with viewers like you";
      } else if (topMatch) {
        reason = `Because you like ${topMatch}`;
      } else {
        reason = "Recommended for you";
      }

      return { ...item, recScore: score, collab, matchedGenres, reason };
    });

    scored.sort((a, b) => b.recScore - a.recScore);

    // 7. Assemble explainable sections. CRITICAL: an item appears in only ONE
    //    section. `take` pulls the best not-yet-used items from a pool so every
    //    row shows distinct titles (Netflix/Amazon style), never repeats.
    const used = new Set();
    const take = (pool, n) => {
      const out = [];
      for (const it of pool) {
        const id = it._id.toString();
        if (!used.has(id)) { out.push(it); used.add(id); }
        if (out.length >= n) break;
      }
      return out;
    };

    const sections = [];

    // Top Picks: the overall best of the hybrid ranking
    const topPicks = take(scored, 12);
    if (topPicks.length) {
      sections.push({ title: "Top Picks For You", reason: "Your best matches right now", items: topPicks });
    }

    // Per-genre content-based rows for the user's top liked genres (deep cuts,
    // since the very best already went to Top Picks)
    likedGenres.slice(0, 4).forEach(genre => {
      const pool = scored.filter(i => (i.matchedGenres || []).includes(genre));
      const items = take(pool, 12);
      if (items.length >= 3) {
        sections.push({ title: `Because You Like ${genre}`, reason: `More ${genre} you might enjoy`, items });
      }
    });

    // Collaborative section: items surfaced by similar users
    const collabPool = scored.filter(i => i.collab > 0).sort((a, b) => b.collab - a.collab);
    const collabItems = take(collabPool, 12);
    if (collabItems.length >= 3) {
      sections.push({ title: "Popular With Viewers Like You", reason: "Loved by users with similar taste", items: collabItems });
    }

    // Per-type rows guarantee variety even when the user likes few genres
    const movieItems = take(scored.filter(i => i.type === "movie"), 12);
    if (movieItems.length >= 3) {
      sections.push({ title: "Movies Picked For You", reason: "Films matched to your taste", items: movieItems });
    }
    const gameItems = take(scored.filter(i => i.type === "game"), 12);
    if (gameItems.length >= 3) {
      sections.push({ title: "Games Picked For You", reason: "Games matched to your taste", items: gameItems });
    }

    // Catch-all: any remaining high-scored items the rows above didn't cover
    const more = take(scored, 12);
    if (more.length >= 4) {
      sections.push({ title: "More To Explore", reason: "Fresh picks based on your taste", items: more });
    }

    // Flat list kept for backward compatibility (Home carousel still uses `data`).
    res.status(200).json({
      success: true,
      count: topPicks.length,
      data: topPicks,
      sections,
      taste: { likedGenres: likedGenres.slice(0, 5), ratedCount: userRatings.length },
    });
  }
  catch (error) {
    console.log("Error in getRecommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
};

// Content-based filtering for a single item: "More Like This".
// Scores other content by how much it overlaps with the given item's
// genres, cast, director, type and release year.
export const getSimilarContent = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 12;

    const base = await Content.findById(id);
    if (!base) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    const baseGenres = base.genres || [];
    const baseCast = base.cast || [];

    // Pull a candidate pool that shares at least one attribute with the base item.
    // We over-fetch then score in memory so we can rank by a weighted similarity.
    const candidates = await Content.find({
      _id: { $ne: base._id },
      $or: [
        { genres: { $in: baseGenres } },
        { cast: { $in: baseCast } },
        ...(base.director ? [{ director: base.director }] : []),
      ],
    })
      .limit(200)
      .lean();

    const scored = candidates.map((item) => {
      let score = 0;
      const reasons = [];

      // genre overlap is the strongest content signal
      const sharedGenres = (item.genres || []).filter((g) => baseGenres.includes(g));
      score += sharedGenres.length * 3;
      if (sharedGenres.length) reasons.push(`${sharedGenres.slice(0, 2).join(", ")}`);

      // shared cast members
      const sharedCast = (item.cast || []).filter((c) => baseCast.includes(c));
      score += sharedCast.length * 2;
      if (sharedCast.length) reasons.push(`stars ${sharedCast[0]}`);

      // same director is a strong "if you liked this creator" signal
      if (base.director && item.director === base.director) {
        score += 4;
        reasons.push(`by ${base.director}`);
      }

      // same medium (movie vs game) keeps results coherent
      if (item.type === base.type) score += 1;

      // released around the same era
      if (base.releaseYear && item.releaseYear && Math.abs(base.releaseYear - item.releaseYear) <= 5) {
        score += 1;
      }

      // small nudge by quality so ties resolve toward better-rated titles
      score += (item.averageRating || 0) / 10;

      return { ...item, similarityScore: score, similarityReason: reasons[0] || "Similar title" };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    const data = scored.slice(0, limit);

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.log("Error in getSimilarContent:", error);
    res.status(500).json({ error: "Failed to get similar content" });
  }
};

export const getContentProviders = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);
    
    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    // Return cached providers if already fetched
    if (content.providersFetched) {
      return res.status(200).json({ success: true, data: content.providers });
    }

    let providers = [];

    if (content.type === 'movie') {
      const TMDB_API_KEY = process.env.TMDB_API_KEY;
      if (TMDB_API_KEY) {
        // 1. Search for movie/tv ID
        const searchUrl = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(content.title)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        const bestMatch = searchData.results?.find(r => r.media_type === 'movie' || r.media_type === 'tv');
        
        if (bestMatch) {
          // 2. Fetch watch providers
          const providerUrl = `https://api.themoviedb.org/3/${bestMatch.media_type}/${bestMatch.id}/watch/providers?api_key=${TMDB_API_KEY}`;
          const providerRes = await fetch(providerUrl);
          const providerData = await providerRes.json();
          
          const usProviders = providerData.results?.US;
          if (usProviders) {
            const flatrate = usProviders.flatrate || [];
            const rent = usProviders.rent || [];
            const buy = usProviders.buy || [];
            
            // Combine and deduplicate
            const allProviders = [...flatrate, ...rent, ...buy];
            const uniqueMap = new Map();
            allProviders.forEach(p => {
              if (!uniqueMap.has(p.provider_id)) {
                uniqueMap.set(p.provider_id, {
                  name: p.provider_name,
                  logoPath: p.logo_path ? `https://image.tmdb.org/t/p/original${p.logo_path}` : ''
                });
              }
            });
            providers = Array.from(uniqueMap.values());
          }
        }
      }
    } else if (content.type === 'game') {
      // Use public Steam API (no API key required)
      const searchUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(content.title)}&l=english&cc=US`;
      try {
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        if (searchData && searchData.items && searchData.items.length > 0) {
          // Found on Steam
          providers.push({
            name: 'Steam',
            logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/512px-Steam_icon_logo.svg.png'
          });
        }
        
        // Since we can't easily search PS/Xbox without auth, we'll append them 
        // statically as fallbacks for AAA games, or just always show them for portfolio purposes.
        providers.push({
          name: 'PlayStation Store',
          logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PlayStation_logo.svg/512px-PlayStation_logo.svg.png'
        });
        providers.push({
          name: 'Xbox Store',
          logoPath: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Xbox_logo_%282019%29.svg/512px-Xbox_logo_%282019%29.svg.png'
        });

      } catch (err) {
        console.error("Steam API Error:", err);
        // Fallback
        providers = [
          { name: 'Steam', logoPath: '' },
          { name: 'PlayStation Store', logoPath: '' },
          { name: 'Xbox Store', logoPath: '' }
        ];
      }
    }

    // Save and return
    content.providers = providers;
    content.providersFetched = true;
    await content.save();

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    console.log("Error in getContentProviders:", error);
    res.status(500).json({ error: "Failed to get providers" });
  }
};

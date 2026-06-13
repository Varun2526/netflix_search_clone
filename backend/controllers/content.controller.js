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

    // search by title
    if (query) {
      filters.title = { $regex: query, $options: "i" };
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
    // get user id from query parameters
    const userId = req.user._id;

    // check if user id is provided
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Gather all content IDs the user has interacted with
    const interactedContentIds = new Set();
    user.recentlyViewed.forEach(id => interactedContentIds.add(id.toString()));
    user.wishlist.forEach(id => interactedContentIds.add(id.toString()));

    // fetch user ratings to find rated content
    const userRatings = await Rating.find({ userId });
    userRatings.forEach(r => interactedContentIds.add(r.contentId.toString()));

    // 2. Determine user's favorite genres based on interactions
    const favoriteGenresSet = new Set();
    
    // add explicitly favorited genres from user profile
    if (user.favoriteGenres && user.favoriteGenres.length > 0) {
      user.favoriteGenres.forEach(genre => favoriteGenresSet.add(genre));
    }

    // fetch actual content objects of recently viewed and wishlist to extract genres
    const interactedContent = await Content.find({_id: { $in: Array.from(interactedContentIds) }});
    
    interactedContent.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => favoriteGenresSet.add(genre));
      }
    });

    const favoriteGenres = Array.from(favoriteGenresSet);

    // 3. Collaborative Filtering: Find similar users
    // Users who have interacted with the same content
    const similarUsers = await User.find({
      _id: { $ne: userId },
      $or: [
        { recentlyViewed: { $in: Array.from(interactedContentIds) } },
        { wishlist: { $in: Array.from(interactedContentIds) } }
      ]
    }).limit(50); // limit to top 50 similar users for performance

    const collabContentScores = {}; // contentId -> score

    similarUsers.forEach(simUser => {
      // items similar user liked
      const simUserItems = [...simUser.recentlyViewed, ...simUser.wishlist];
      simUserItems.forEach(itemId => {
        const idStr = itemId.toString();
        // if current user hasn't interacted with it
        if (!interactedContentIds.has(idStr)) {
          collabContentScores[idStr] = (collabContentScores[idStr] || 0) + 1;
        }
      });
    });

    // 4. Fallback: if no interactions or favorite genres, return top trending items
    if (favoriteGenres.length === 0 && Object.keys(collabContentScores).length === 0) {
      const fallbackContent = await Content.find({_id: { $nin: Array.from(interactedContentIds) }})
                                          .sort({ popularityScore: -1 })
                                          .limit(10);

      return res.status(200).json({success: true,message: "No user preferences found. Showing popular content.",data: fallbackContent});
    }

    // 5. Recommendation Engine: fetch candidates
    // We fetch candidates from collaborative filtering AND genre matching
    const candidateIds = Object.keys(collabContentScores);
    
    // Fetch content for candidate IDs and genre matches
    const candidates = await Content.find({
      _id: { $nin: Array.from(interactedContentIds) },
      $or: [
        { _id: { $in: candidateIds } },
        { genres: { $in: favoriteGenres } }
      ]
    }).limit(100); // limit candidate pool size for speed

    // 6. Score candidates based on collaborative frequency, genre overlap, and rating
    const scoredRecommendations = candidates.map(item => {
      const idStr = item._id.toString();
      
      // Collaborative score (frequency from similar users)
      const collabScore = (collabContentScores[idStr] || 0) * 3;

      // count how many genres match user's favorites
      const matchingGenresCount = item.genres ? item.genres.filter(genre => favoriteGenres.includes(genre)).length : 0;
      
      // simple recommendation score formula:
      // score = CollabScore + (number of matching genres * 2) + averageRating
      const recommendationScore = collabScore + (matchingGenresCount * 2) + (item.averageRating || 0);

      return {content: item,score: recommendationScore};
    });

    // sort candidates by score in descending order
    scoredRecommendations.sort((a, b) => b.score - a.score);

    // select top 10 recommended items
    const recommendations = scoredRecommendations.slice(0, 10).map(r => r.content);

    // send response
    res.status(200).json({success: true,count: recommendations.length,data: recommendations});
  } 
  catch (error) {
    console.log("Error in getRecommendations:", error);
    res.status(500).json({ error: "Failed to get recommendations" });
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

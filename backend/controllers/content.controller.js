import Content from "../models/Content.model.js";
import User from "../models/User.model.js";

// Search movies and games
export const search = async (req, res) => {
  try {
    // get data from url
    const { query, type, genre } = req.query;
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

    // find data from database
    const data = await Content.find(filters).limit(20);
    // send response
    res.status(200).json({ success: true, count: data.length, data: data, });
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

export const addToHistroy = async (req,res) =>{
  try {
    //get the userdata and content data from req 
    const {userId , contentId} = req.body;
    //find the user
    const user = await User.findById(userId);
    if(!user){
      return res.status(404).json({success:false,message:"User not found"})
    }
    //find the content
    const content = await Content.findById(contentId);
    if(!content){
      return res.status(404).json({success:false,message:"Content not found"})
    }
    //check if content is already in recentlyViewed to avoid duplicates
    if (!user.recentlyViewed.includes(contentId)) {
      //add the content to the user's recentlyViewed
      user.recentlyViewed.push(contentId);
      await user.save();
    }
    //send response
    res.status(200).json({success:true,message:"Content added to history successfully"})
  }
  catch(error){
    console.log("Error in addToHistroy:", error);
    res.status(500).json({ error: "Failed to add content to history" });
  }
};



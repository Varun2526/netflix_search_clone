import User from "../models/User.model.js";

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure the user is only fetching their own profile
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to view this profile" });
    }

    // find user by id, exclude the password, and populate wishlist and recentlyViewed content
    const user = await User.findById(id)
      .select("-password")
      .populate("wishlist")
      .populate("recentlyViewed");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // send response
    res.status(200).json({ success: true, data: user });
  } 
  catch (error) {
    console.log("Error in getUserProfile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

// update user favorite genres
export const updateFavoriteGenres = async (req, res) => {
  try {
    const { genres } = req.body;
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    if (!Array.isArray(genres)) {
      return res.status(400).json({ success: false, message: "Genres must be an array" });
    }

    const user = await User.findByIdAndUpdate(userId, { favoriteGenres: genres }, { new: true }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Favorite genres updated successfully", favoriteGenres: user.favoriteGenres });
  } 
  catch (error) {
    console.log("Error in updateFavoriteGenres:", error);
    res.status(500).json({ error: "Failed to update favorite genres" });
  }
};

// ── GET WISHLIST ──
export const getWishlist = async (req, res) => {
  try {
    const user = req.user;
    await user.populate('wishlist').execPopulate();
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

// ── GET HISTORY ──
export const getHistory = async (req, res) => {
  try {
    const user = req.user;
    await user.populate('recentlyViewed').execPopulate();
    res.status(200).json({ success: true, history: user.recentlyViewed });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

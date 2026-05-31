import User from "../models/User.model.js";

// get user profile details
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

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
  } catch (error) {
    console.log("Error in getUserProfile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

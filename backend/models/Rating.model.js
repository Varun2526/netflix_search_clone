import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate ratings — one rating per user per content
ratingSchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Lookup indexes for recommendation queries
ratingSchema.index({ userId: 1 });
ratingSchema.index({ contentId: 1 });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;

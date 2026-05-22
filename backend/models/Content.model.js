import mongoose from "mongoose";
const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["movie", "game"],
      required: true,
    },

    genres: {
      type: [String],
      default: [],
    },

    description: {
      type: String,
      trim: true,
    },

    director: {
      type: String,
      trim: true,
    },

    cast: {
      type: [String],
      default: [],
    },

    releaseYear: {
      type: Number,
    },

    runtime: {
      type: Number,
    },

    averageRating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    voteCount: {
      type: Number,
      default: 0,
    },

    revenue: {
      type: Number,
      default: 0,
    },

    criticScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    popularityScore: {
      type: Number,
      default: 0,
    },

    posterImage: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// SEARCH INDEXES
contentSchema.index({title: "text",description: "text",});
contentSchema.index({ genres: 1 });
contentSchema.index({ type: 1 });
// SORTING INDEXES
contentSchema.index({ averageRating: -1 });
contentSchema.index({ popularityScore: -1 });
contentSchema.index({ releaseDate: -1 });

const Content = mongoose.model("Content", contentSchema);
export default Content;
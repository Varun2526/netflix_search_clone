import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
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

    interactionTime: {
      type: Number,
      default: 0, // playtime or viewtime in minutes
    },

    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// One history entry per user per content — upsert on re-access
historySchema.index({ userId: 1, contentId: 1 }, { unique: true });

// Lookup index for fetching a user's full history
historySchema.index({ userId: 1, lastAccessedAt: -1 });

const History = mongoose.model("History", historySchema);

export default History;

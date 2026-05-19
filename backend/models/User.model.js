import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    avatar: {
      type: String,
      default: "",
    },

    favoriteGenres: {
      type: [String],
      default: [],
    },

    recentlyViewed: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Content",
      default: [],
    },

    wishlist: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Content",
      default: [],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

// INDEXES
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

const User = mongoose.model("User", userSchema);
export default User;
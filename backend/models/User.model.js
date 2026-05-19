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
      minlength: 6,
      // NOT required — OAuth users (Google/GitHub) won't have a password
    },

    avatar: {
      type: String,
      default: "",
    },

    providers: [
      {
        name: {
          type: String,
          enum: ["local", "google", "github"],
          required: true,
        },
        providerId: {
          type: String,
        },
      },
    ],

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

const User = mongoose.model("User", userSchema);
export default User;
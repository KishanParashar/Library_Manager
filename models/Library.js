import mongoose from "mongoose";

const LibrarySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,

    },
    ownerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },

    totalSeats: {
      type: Number,
      default: 0,
    },

    plan: {
      type: String,
      default: "starter",
    },

    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "expired"],
      default: "trial",
    },

    trialEndsAt: {
      type: Date,
    },

    subscriptionEndsAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Library ||
  mongoose.model("Library", LibrarySchema);
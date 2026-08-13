import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true, // Example: "08:00"
    },

    endTime: {
      type: String,
      required: true, // Example: "14:00"
    },

    monthlyFee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan ||
  mongoose.model("Plan", PlanSchema);
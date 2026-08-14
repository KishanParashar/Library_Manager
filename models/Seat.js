import mongoose from "mongoose";

const SeatSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "blocked"],
      default: "available",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
  },
  { timestamps: true }
);

SeatSchema.index({ libraryId: 1, seatNumber: 1 }, { unique: true });

export default mongoose.models.Seat || mongoose.model("Seat", SeatSchema);
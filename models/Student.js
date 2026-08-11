import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    seatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    joinDate: {
      type: Date,
      default: Date.now,
    },

    monthlyFee: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Student ||
  mongoose.model("Student", StudentSchema);
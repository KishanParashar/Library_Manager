import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
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

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    monthlyFee: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid"],
      default: "unpaid",
    },

    lastPaidMonth: {
      type: String,
      default: null,
    },
    reminderHistory: {
      type: [String],
      default: [],
    },

    lastPaidDate: {
      type: Date,
      default: null,
    },


    joinDate: {
      type: Date,
      default: Date.now,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Same seat + same plan par duplicate booking nahi honi chahiye
BookingSchema.index(
  {
    seatId: 1,
    planId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.Booking ||
  mongoose.model("Booking", BookingSchema);
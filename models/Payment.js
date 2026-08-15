import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    month: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paidDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Same booking + same month duplicate payment nahi hona chahiye
PaymentSchema.index(
  {
    bookingId: 1,
    month: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
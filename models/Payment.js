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

    // Month in which actual payment was received
    month: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    // monthly or offer
    paymentType: {
      type: String,
      enum: ["monthly", "offer"],
      default: "monthly",
    },

    // Only for offer payments
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      default: null,
    },

    // Months covered by an offer
    startMonth: {
      type: String,
      default: null,
    },

    endMonth: {
      type: String,
      default: null,
    },

    paidDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Same booking + same payment month cannot be duplicated
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
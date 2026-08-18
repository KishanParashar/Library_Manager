import mongoose from "mongoose";

const RegistrationCounterSchema =
  new mongoose.Schema(
    {
      libraryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Library",
        required: true,
        unique: true,
      },

      sequence: {
        type: Number,
        default: 1000,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.models.RegistrationCounter ||
  mongoose.model(
    "RegistrationCounter",
    RegistrationCounterSchema
  );
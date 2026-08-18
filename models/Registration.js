import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    libraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Library",
      required: true,
    },

    registrationNo: {
      type: Number,
      required: true,
    },

    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    fatherName: {
      type: String,
      required: true,
      trim: true,
    },

    aadhaarNo: {
      type: String,
      required: true,
      trim: true,
    },

    mobileNo: {
      type: String,
      required: true,
      trim: true,
    },

    joiningHistory: [
      {
        date: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Same Aadhaar cannot be registered twice
// inside the same library.
RegistrationSchema.index(
  {
    libraryId: 1,
    aadhaarNo: 1,
  },
  {
    unique: true,
  }
);

// Registration number should also be unique
// inside one library.
RegistrationSchema.index(
  {
    libraryId: 1,
    registrationNo: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);
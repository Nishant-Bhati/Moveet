import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    aadhaarNumber: {
      type: String,
      // TODO: encrypt in production
    },
    dlNumber: {
      type: String,
      // TODO: encrypt in production
    },
    aadhaarFrontUrl: {
      type: String,
      default: null,
    },
    aadhaarBackUrl: {
      type: String,
      default: null,
    },
    dlFrontUrl: {
      type: String,
      default: null,
    },
    dlBackUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_STARTED',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Kyc = mongoose.model('Kyc', kycSchema);

export default Kyc;

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    publicUserId: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    kycStatus: {
      type: String,
      enum: ['NOT_STARTED', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'NOT_STARTED',
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    activePlanId: {
      type: String,
    },
    planExpiryDate: {
      type: Date,
    },
    autoRenew: {
      type: Boolean,
      default: false,
    },
    language: {
      type: String,
      default: 'en',
    },
    locationSharing: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ publicUserId: 1 }, { unique: true });

// Pre-save hook to generate publicUserId if not present
userSchema.pre('save', function (next) {
  if (!this.publicUserId) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000); // Generates a random 4-digit number (1000-9999)
    this.publicUserId = `MOVEET-${randomDigits}`;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    scooterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scooter',
      required: [true, 'Scooter ID is required'],
    },
    iotScooterId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
      default: 'ACTIVE',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
    },
    durationSeconds: {
      type: Number,
      default: null,
    },
    distanceKm: {
      type: Number,
      default: null,
    },
    cost: {
      type: Number,
      default: 0,
    },
    fromLabel: {
      type: String,
      default: null,
    },
    toLabel: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
rideSchema.index({ userId: 1, status: 1 });
rideSchema.index({ scooterId: 1, status: 1 });
rideSchema.index({ userId: 1, createdAt: -1 });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;

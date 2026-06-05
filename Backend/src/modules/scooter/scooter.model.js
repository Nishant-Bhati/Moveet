import mongoose from 'mongoose';

const scooterSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Scooter code is required'],
      unique: true,
      trim: true,
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    battery: {
      type: Number,
      min: 0,
      max: 100,
    },
    rangeKm: {
      type: Number,
      min: 0,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'LOW_BATTERY'],
      default: 'AVAILABLE',
    },
    iotId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    speed: {
      type: Number,
      default: 0,
      min: 0,
    },
    signalStrength: {
      type: Number,
      default: 0,
    },
    odometer: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastHeartbeat: {
      type: Date,
    },
    assignedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    pricing: {
      minutely: {
        type: Number,
        default: 0,
      },
      daily: {
        type: Number,
        default: 0,
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for geo-spatial queries
scooterSchema.index({ location: '2dsphere' });

// Pre-validate hook to keep GeoJSON location in sync with flat latitude/longitude
scooterSchema.pre('validate', function () {
  if (this.isModified('latitude') || this.isModified('longitude') || !this.location || !this.location.coordinates) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
});

const Scooter = mongoose.model('Scooter', scooterSchema);

export default Scooter;

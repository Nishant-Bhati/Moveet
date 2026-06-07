import mongoose from 'mongoose';

const paymentPlanSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    priceLabel: {
      type: String,
    },
    type: {
      type: String,
      enum: ['fixed', 'topup'],
      default: 'fixed',
    },
    duration: {
      type: String,
    },
    durationHours: {
      type: Number,
    },
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentPlan = mongoose.model('PaymentPlan', paymentPlanSchema);

export default PaymentPlan;

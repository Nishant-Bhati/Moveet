import mongoose from 'mongoose';

const supportContactSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: 'Moveet Support',
    },
    supportHours: {
      type: String,
      default: 'Mon–Sat, 9am–6pm',
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

const SupportContact = mongoose.model('SupportContact', supportContactSchema);

export default SupportContact;

import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: 'light',
    },
  },
  {
    timestamps: true,
    strict: false, // Allows flexible preference schemas depending on front-end needs
  }
);

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;

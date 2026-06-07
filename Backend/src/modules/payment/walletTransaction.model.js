import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    direction: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['TOPUP', 'SUBSCRIPTION', 'RIDE_COST', 'REFUND'],
    },
    referenceId: {
      type: String,
    },
    description: {
      type: String,
    },
    balanceAfter: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index
walletTransactionSchema.index({ userId: 1, createdAt: -1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

export default WalletTransaction;

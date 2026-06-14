import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },

    deposits: {
      type: Number,
      default: 0,
    },

    withdrawals: {
      type: Number,
      default: 0,
    },

    profits: {
      type: Number,
      default: 0,
    },

    losses: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Account ||
  mongoose.model("Account", AccountSchema);

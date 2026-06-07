import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
  },
  direction: {
    type: String,
    required: true,
  },
  entry: {
    type: Number,
    required: true,
  },
  sl: {
    type: Number,
    required: true,
  },
  tp: {
    type: Number,
    required: true,
  },
  result: {
    type: String,
    default: "RUNNING",
  },
  rr: {
    type: Number,
    required: true,
  },
  session: {
    type: String,
    required: true,
  },
  setup: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  psychology: {
    type: String,
    default: "",
  },
}, {
  timestamps: true,
});

const Trade =
  mongoose.models?.Trade || mongoose.model("Trade", tradeSchema);

export default Trade;
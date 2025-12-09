const mongoose = require("mongoose");

const { Schema } = mongoose;

const proposalSchema = new Schema(
  {
    rfp: {
      type: Schema.Types.ObjectId,
      ref: "Rfp",
      required: true,
      index: true,
    },
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      index: true,
    },

    rawEmail: {
      type: String,
      required: true,
    },

    parsedJson: {
      type: Schema.Types.Mixed,
    },
    totalPrice: {
      type: Number,
    },
    deliveryDays: {
      type: Number,
    },
    paymentTerms: {
      type: String,
      trim: true,
    },
    warranty: {
      type: String,
      trim: true,
    },

    scoreOverall: {
      type: Number, 
    },
    scoreBreakdown: {
      type: Schema.Types.Mixed,
    },
    aiSummary: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index({ rfp: 1, vendor: 1 }, { unique: true });
const Proposal = mongoose.model("Proposal", proposalSchema);

module.exports = Proposal;

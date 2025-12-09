const mongoose = require("mongoose");
const { Schema } = mongoose;

const rfpLineItemSchema = new Schema(
  {
    name: {
      type: String,          // e.g. "Laptop"
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,          // e.g. 20
      required: true,
      min: 1,
    },
    spec: {
      type: String,          // e.g. "16GB RAM, 512GB SSD"
      required: true,
      trim: true,
    },
  },
  { _id: false } 
);

const rfpInvitedVendorSchema = new Schema(
  {
    vendor: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "RESPONDED"],
      default: "DRAFT",
    },
    sentAt: {
      type: Date,
    },
  },
  { _id: false }
);

const rfpSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    descriptionNlp: {
      type: String,
      required: true,
      trim: true,
    },

    budget: Number,
    deliveryDays: Number,
    paymentTerms: String,
    warranty: String,

    lineItems: {
      type: [rfpLineItemSchema], 
      default: [],
    },

    invitedVendors: {
      type: [rfpInvitedVendorSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Rfp = mongoose.model("Rfp", rfpSchema);

module.exports = Rfp;

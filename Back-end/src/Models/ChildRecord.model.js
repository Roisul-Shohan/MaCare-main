import mongoose from "mongoose";

const ChildRecordSchema = new mongoose.Schema({
  motherID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  child: {
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true }
  },

  growth: [{
    date: { type: Date, required: true },
    weightKg: Number,
    heightCm: Number,
    muacCm: Number, // mid-upper arm circumference
    zScores: {
      weightForAge: Number,
      heightForAge: Number,
      weightForHeight: Number
    },
    alerts: [{ type: String }] // e.g., "stunting-risk", "wasting-risk"
  }],

  vaccines: [{
    code: { type: String }, // e.g., "BCG", "OPV1"
    dueDate: Date,
    status: { type: String, enum: ["due", "given", "missed"], default: "due" },
    givenDate: Date,
    providerID: { type: mongoose.Types.ObjectId, ref: "User" }
  }]
}, { timestamps: true });

export const ChildRecord = mongoose.model("ChildRecord", ChildRecordSchema);

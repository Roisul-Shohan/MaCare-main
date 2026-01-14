import mongoose from "mongoose";

/**
 * VaccineRecord Model
 * Tracks pregnancy vaccines for mothers
 * Includes vaccine schedule, status, and uploaded PDF confirmations
 */
const VaccineRecordSchema = new mongoose.Schema({
  motherID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true,
    index: true
  },

  vaccineName: {
    type: String,
    required: true
  },

  // Scheduled date for the vaccine
  scheduledDate: {
    type: Date,
    required: true
  },

  // Status of vaccine
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending"
  },

  // Actual date when vaccine was taken
  takenDate: {
    type: Date
  },

  // Cloudinary URL for uploaded vaccine confirmation PDF
  pdfUrl: {
    type: String
  },

  // Cloudinary public ID for PDF deletion
  pdfPublicId: {
    type: String
  },

  // Additional notes
  notes: {
    type: String
  }

}, { timestamps: true });

// Index for efficient queries
VaccineRecordSchema.index({ motherID: 1, scheduledDate: 1 });

export const VaccineRecord = mongoose.model("VaccineRecord", VaccineRecordSchema);

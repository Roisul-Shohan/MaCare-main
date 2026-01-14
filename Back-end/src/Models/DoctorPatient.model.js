import mongoose from "mongoose";

// Doctor-Patient Assignment Schema
const DoctorPatientSchema = new mongoose.Schema({
  doctorID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  patientID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  assignedDate: {
    type: Date,
    default: Date.now
  },

  isActive: {
    type: Boolean,
    default: true
  },

  specialNotes: {
    type: String
  }

}, { timestamps: true });

export const DoctorPatient = mongoose.model("DoctorPatient", DoctorPatientSchema);

import mongoose from "mongoose";

// Appointment Schema
const AppointmentSchema = new mongoose.Schema({
  motherID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  doctorID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  appointmentDate: {
    type: Date,
    required: true
  },

  appointmentTime: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["নিয়মিত চেকআপ", "আল্ট্রাসাউন্ড", "ফলোআপ", "জরুরি কনসালটেশন", "টিকা"],
    required: true
  },

  status: {
    type: String,
    enum: ["confirmed", "pending", "completed", "cancelled"],
    default: "pending"
  },

  notes: {
    type: String
  },

  location: {
    type: String
  }

}, { timestamps: true });

export const Appointment = mongoose.model("Appointment", AppointmentSchema);

import mongoose from "mongoose";

// Message Schema for Doctor-Patient Communication
const MessageSchema = new mongoose.Schema({
  senderID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  receiverID: { 
    type: mongoose.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  message: {
    type: String,
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  messageType: {
    type: String,
    enum: ["text", "alert", "reminder", "advice"],
    default: "text"
  }

}, { timestamps: true });

export const Message = mongoose.model("Message", MessageSchema);

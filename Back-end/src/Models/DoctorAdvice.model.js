import mongoose from "mongoose";

const DoctorAdviceSchema = new mongoose.Schema({
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    motherID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    adviceType: {
        type: String,
        enum: ["general", "medication", "diet", "exercise", "emergency", "followup"],
        default: "general"
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    
    // Reference to health record if this advice is related to a specific checkup
    relatedHealthRecordID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "HealthRecordUpdate"
    },
    
    // For follow-up tracking
    requiresFollowup: {
        type: Boolean,
        default: false
    },
    followupDate: Date,
    followupCompleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const DoctorAdvice = mongoose.model("DoctorAdvice", DoctorAdviceSchema);

import mongoose from "mongoose";

const CheckupNotificationSchema = new mongoose.Schema({
    motherID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    midwifeID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    doctorID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    checkupType: {
        type: String,
        enum: ["routine", "followup", "emergency", "antenatal", "postnatal"],
        default: "routine"
    },
    status: {
        type: String,
        enum: ["pending", "completed", "missed", "rescheduled"],
        default: "pending"
    },
    completedDate: Date,
    notes: String,
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: Date
}, { timestamps: true });

// Index for efficient querying of pending notifications
CheckupNotificationSchema.index({ scheduledDate: 1, status: 1 });

export const CheckupNotification = mongoose.model("CheckupNotification", CheckupNotificationSchema);

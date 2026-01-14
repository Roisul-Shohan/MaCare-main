import mongoose from "mongoose";

const HealthRecordUpdateSchema = new mongoose.Schema({
    motherID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updaterRole: {
        type: String,
        enum: ["midWife", "doctor"],
        required: true
    },
    checkupDate: {
        type: Date,
        default: Date.now
    },
    vitalSigns: {
        bloodPressure: {
            systolic: Number,
            diastolic: Number
        },
        weight: Number,
        height: Number,
        temperature: Number,
        pulseRate: Number
    },
    symptoms: [String],
    complaints: String,
    findings: String,
    recommendations: String,
    nextCheckupDate: Date,
    
    // For pregnancy tracking
    pregnancyWeek: Number,
    fetalHeartRate: Number,
    fundalHeight: Number,
    
    attachments: [{
        url: String,
        type: String,
        description: String
    }]
}, { timestamps: true });

export const HealthRecordUpdate = mongoose.model("HealthRecordUpdate", HealthRecordUpdateSchema);

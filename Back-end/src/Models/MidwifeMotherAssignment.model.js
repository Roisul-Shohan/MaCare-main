import mongoose from "mongoose";

const MidwifeMotherAssignmentSchema = new mongoose.Schema({
    midwifeID: {
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
    assignedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["active", "completed", "transferred"],
        default: "active"
    },
    notes: String
}, { timestamps: true });

// Ensure one midwife-mother pair is unique
MidwifeMotherAssignmentSchema.index({ midwifeID: 1, motherID: 1 }, { unique: true });

// Method to check if midwife has reached max capacity (20 mothers)
MidwifeMotherAssignmentSchema.statics.checkMidwifeCapacity = async function(midwifeID) {
    const count = await this.countDocuments({ 
        midwifeID, 
        status: "active" 
    });
    return count < 20;
};

export const MidwifeMotherAssignment = mongoose.model("MidwifeMotherAssignment", MidwifeMotherAssignmentSchema);

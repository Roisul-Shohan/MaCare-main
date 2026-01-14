import mongoose, { Schema } from "mongoose";

const weeklyCheckupSchema = new Schema(
  {
    motherID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    midwifeID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    checkupDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    weekNumber: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    // Health measurements
    bloodPressure: {
      systolic: {
        type: Number,
        required: true,
        min: 70,
        max: 250
      },
      diastolic: {
        type: Number,
        required: true,
        min: 40,
        max: 180
      }
    },
    weight: {
      type: Number,
      required: true,
      min: 30,
      max: 200
    },
    height: {
      type: Number,
      required: false,
      min: 100,
      max: 250
    },
    // Pregnancy week at time of checkup
    pregnancyWeek: {
      type: Number,
      min: 0,
      max: 42
    },
    // Additional observations
    notes: {
      type: String,
      maxlength: 1000
    },
    // Locking mechanism
    isLocked: {
      type: Boolean,
      default: true
    },
    lockedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one checkup per mother per week
weeklyCheckupSchema.index({ motherID: 1, year: 1, weekNumber: 1 }, { unique: true });

// Index for efficient queries
weeklyCheckupSchema.index({ midwifeID: 1, checkupDate: -1 });
weeklyCheckupSchema.index({ motherID: 1, checkupDate: -1 });

// Static method to get current week number
weeklyCheckupSchema.statics.getCurrentWeekInfo = function() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDaysOfYear = (now - startOfYear) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  return {
    weekNumber,
    year: now.getFullYear()
  };
};

// Static method to check if checkup already exists for this week
weeklyCheckupSchema.statics.hasCheckupThisWeek = async function(motherID) {
  const { weekNumber, year } = this.getCurrentWeekInfo();
  const existingCheckup = await this.findOne({
    motherID,
    weekNumber,
    year
  });
  return !!existingCheckup;
};

// Method to get BP status
weeklyCheckupSchema.methods.getBPStatus = function() {
  const { systolic, diastolic } = this.bloodPressure;
  if (systolic >= 180 || diastolic >= 120) {
    return 'crisis';
  } else if (systolic >= 140 || diastolic >= 90) {
    return 'high';
  } else if (systolic >= 130 || diastolic >= 80) {
    return 'elevated';
  } else if (systolic < 90 || diastolic < 60) {
    return 'low';
  } else {
    return 'normal';
  }
};

// Method to calculate BMI
weeklyCheckupSchema.methods.calculateBMI = function() {
  if (!this.height) return null;
  const heightInMeters = this.height / 100;
  return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
};

export const WeeklyCheckup = mongoose.model("WeeklyCheckup", weeklyCheckupSchema);

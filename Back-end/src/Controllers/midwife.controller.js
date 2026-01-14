import { AsynHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/User.Model.js";
import { MidwifeMotherAssignment } from "../Models/MidwifeMotherAssignment.model.js";
import { HealthRecordUpdate } from "../Models/HealthRecordUpdate.model.js";
import { CheckupNotification } from "../Models/CheckupNotification.model.js";
import { MaternalRecord } from "../Models/Maternal.model.js";
import { DoctorAdvice } from "../Models/DoctorAdvice.model.js";

// Get Midwife Dashboard
const getMidwifeDashboard = AsynHandler(async (req, res) => {
    const midwifeID = req.user._id;
    
    // Get assigned mothers count
    const assignedMothersCount = await MidwifeMotherAssignment.countDocuments({
        midwifeID,
        status: "active"
    });
    
    // Get pending checkups today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCheckups = await CheckupNotification.find({
        midwifeID,
        status: "pending",
        scheduledDate: { $gte: today, $lt: tomorrow }
    }).populate("motherID", "FullName PhoneNumber");
    
    // Get recent health updates
    const recentUpdates = await HealthRecordUpdate.find({
        updatedBy: midwifeID,
        updaterRole: "midWife"
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("motherID", "FullName");
    
    // Get high priority mothers (upcoming checkups in next 3 days)
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);
    
    const upcomingCheckups = await CheckupNotification.find({
        midwifeID,
        status: "pending",
        scheduledDate: { $gte: today, $lt: threeDaysLater }
    }).populate("motherID", "FullName PhoneNumber");
    
    return res.status(200).json(new ApiResponse(200, {
        assignedMothersCount,
        capacityRemaining: 20 - assignedMothersCount,
        todayCheckups,
        upcomingCheckups,
        recentUpdates
    }, "Midwife dashboard data fetched successfully"));
});

// Get Assigned Mothers List
const getAssignedMothers = AsynHandler(async (req, res) => {
    const midwifeID = req.user._id;
    
    const assignments = await MidwifeMotherAssignment.find({
        midwifeID,
        status: "active"
    }).populate({
        path: "motherID",
        select: "FullName Email PhoneNumber DateOfBirth address ProfileImage"
    });
    
    // Get maternal records and latest health updates for each mother
    const mothersData = await Promise.all(assignments.map(async (assignment) => {
        const maternalRecord = await MaternalRecord.findOne({ motherID: assignment.motherID._id });
        const latestHealthUpdate = await HealthRecordUpdate.findOne({
            motherID: assignment.motherID._id
        }).sort({ createdAt: -1 });
        
        // Calculate pregnancy week if LMP exists
        let pregnancyWeek = null;
        if (maternalRecord?.LMP) {
            const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.LMP)) / (1000 * 60 * 60 * 24));
            pregnancyWeek = Math.floor(daysSinceLMP / 7);
        }
        
        return {
            assignment,
            mother: assignment.motherID,
            maternalRecord,
            pregnancyWeek,
            latestHealthUpdate,
            lastCheckup: latestHealthUpdate?.checkupDate
        };
    }));
    
    return res.status(200).json(new ApiResponse(200, mothersData, "Assigned mothers fetched successfully"));
});

// Get Mother Details by ID
const getMotherDetailsByID = AsynHandler(async (req, res) => {
    const { motherID } = req.params;
    const midwifeID = req.user._id;
    
    // Verify assignment
    const assignment = await MidwifeMotherAssignment.findOne({
        midwifeID,
        motherID,
        status: "active"
    });
    
    if (!assignment) {
        throw new ApiError(403, "You are not assigned to this mother");
    }
    
    // Get mother details
    const mother = await User.findById(motherID).select("-Password -RefreshToken");
    if (!mother) {
        throw new ApiError(404, "Mother not found");
    }
    
    // Get maternal record
    const maternalRecord = await MaternalRecord.findOne({ motherID });
    
    // Get all health updates
    const healthUpdates = await HealthRecordUpdate.find({ motherID })
        .sort({ createdAt: -1 })
        .populate("updatedBy", "FullName Role");
    
    // Get doctor's advice
    const doctorAdvices = await DoctorAdvice.find({ motherID })
        .sort({ createdAt: -1 })
        .populate("doctorID", "FullName");
    
    // Get checkup schedule
    const checkupSchedule = await CheckupNotification.find({ 
        motherID,
        midwifeID 
    }).sort({ scheduledDate: 1 });
    
    // Calculate pregnancy week
    let pregnancyWeek = null;
    if (maternalRecord?.LMP) {
        const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.LMP)) / (1000 * 60 * 60 * 24));
        pregnancyWeek = Math.floor(daysSinceLMP / 7);
    }
    
    return res.status(200).json(new ApiResponse(200, {
        mother,
        maternalRecord,
        pregnancyWeek,
        healthUpdates,
        doctorAdvices,
        checkupSchedule
    }, "Mother details fetched successfully"));
});

// Add Health Record Update
const addHealthRecordUpdate = AsynHandler(async (req, res) => {
    const { motherID } = req.params;
    const midwifeID = req.user._id;
    
    // Verify assignment
    const assignment = await MidwifeMotherAssignment.findOne({
        midwifeID,
        motherID,
        status: "active"
    });
    
    if (!assignment) {
        throw new ApiError(403, "You are not assigned to this mother");
    }
    
    const {
        bloodPressure,
        weight,
        height,
        temperature,
        pulseRate,
        symptoms,
        complaints,
        findings,
        recommendations,
        nextCheckupDate,
        pregnancyWeek,
        fetalHeartRate,
        fundalHeight
    } = req.body;
    
    const healthUpdate = await HealthRecordUpdate.create({
        motherID,
        updatedBy: midwifeID,
        updaterRole: "midWife",
        vitalSigns: {
            bloodPressure,
            weight,
            height,
            temperature,
            pulseRate
        },
        symptoms,
        complaints,
        findings,
        recommendations,
        nextCheckupDate,
        pregnancyWeek,
        fetalHeartRate,
        fundalHeight
    });
    
    // Create next checkup notification if date is provided
    if (nextCheckupDate) {
        await CheckupNotification.create({
            motherID,
            midwifeID,
            scheduledDate: nextCheckupDate,
            checkupType: "followup"
        });
    }
    
    return res.status(201).json(new ApiResponse(201, healthUpdate, "Health record updated successfully"));
});

// Schedule Checkup
const scheduleCheckup = AsynHandler(async (req, res) => {
    const { motherID } = req.params;
    const midwifeID = req.user._id;
    const { scheduledDate, checkupType, notes } = req.body;
    
    // Verify assignment
    const assignment = await MidwifeMotherAssignment.findOne({
        midwifeID,
        motherID,
        status: "active"
    });
    
    if (!assignment) {
        throw new ApiError(403, "You are not assigned to this mother");
    }
    
    const notification = await CheckupNotification.create({
        motherID,
        midwifeID,
        scheduledDate,
        checkupType,
        notes
    });
    
    return res.status(201).json(new ApiResponse(201, notification, "Checkup scheduled successfully"));
});

// Get Pending Checkup Notifications
const getPendingCheckups = AsynHandler(async (req, res) => {
    const midwifeID = req.user._id;
    
    const pendingCheckups = await CheckupNotification.find({
        midwifeID,
        status: "pending",
        scheduledDate: { $gte: new Date() }
    })
    .sort({ scheduledDate: 1 })
    .populate("motherID", "FullName PhoneNumber address");
    
    return res.status(200).json(new ApiResponse(200, pendingCheckups, "Pending checkups fetched successfully"));
});

// Mark Checkup as Completed
const completeCheckup = AsynHandler(async (req, res) => {
    const { checkupID } = req.params;
    const { notes } = req.body;
    
    const checkup = await CheckupNotification.findByIdAndUpdate(
        checkupID,
        {
            status: "completed",
            completedDate: new Date(),
            notes
        },
        { new: true }
    );
    
    if (!checkup) {
        throw new ApiError(404, "Checkup notification not found");
    }
    
    return res.status(200).json(new ApiResponse(200, checkup, "Checkup marked as completed"));
});

// Assign Mother to Midwife (Admin function, but including for completeness)
const assignMotherToMidwife = AsynHandler(async (req, res) => {
    const { midwifeID, motherID, notes } = req.body;
    
    // Check midwife capacity
    const hasCapacity = await MidwifeMotherAssignment.checkMidwifeCapacity(midwifeID);
    if (!hasCapacity) {
        throw new ApiError(400, "Midwife has reached maximum capacity of 20 mothers");
    }
    
    // Check if assignment already exists
    const existingAssignment = await MidwifeMotherAssignment.findOne({
        midwifeID,
        motherID,
        status: "active"
    });
    
    if (existingAssignment) {
        throw new ApiError(400, "This mother is already assigned to this midwife");
    }
    
    const assignment = await MidwifeMotherAssignment.create({
        midwifeID,
        motherID,
        notes
    });
    
    return res.status(201).json(new ApiResponse(201, assignment, "Mother assigned to midwife successfully"));
});

export {
    getMidwifeDashboard,
    getAssignedMothers,
    getMotherDetailsByID,
    addHealthRecordUpdate,
    scheduleCheckup,
    getPendingCheckups,
    completeCheckup,
    assignMotherToMidwife
};

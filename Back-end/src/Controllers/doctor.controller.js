import { User } from "../Models/User.Model.js";
import { MaternalRecord } from "../Models/Maternal.model.js";
import { ChildRecord } from "../Models/ChildRecord.model.js";
import { Appointment } from "../Models/Appointment.model.js";
import { Message } from "../Models/Message.model.js";
import { DoctorPatient } from "../Models/DoctorPatient.model.js";
import { DoctorAdvice } from "../Models/DoctorAdvice.model.js";
import { HealthRecordUpdate } from "../Models/HealthRecordUpdate.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";

// 1. Get doctor dashboard data
const getDoctorDashboard = AsynHandler(async (req, res) => {
  const doctorID = req.user._id;

  // Get all assigned patients
  const assignments = await DoctorPatient.find({ 
    doctorID, 
    isActive: true 
  }).populate('patientID', 'FullName ProfileImage PhoneNumber DateOfBirth');

  const patientIDs = assignments.map(a => a.patientID._id);

  // Get maternal records for risk assessment
  const maternalRecords = await MaternalRecord.find({ 
    motherID: { $in: patientIDs } 
  });

  // Calculate pregnancy weeks and identify high-risk patients
  const patientsWithDetails = await Promise.all(
    assignments.map(async (assignment) => {
      const patient = assignment.patientID;
      const maternalRecord = maternalRecords.find(
        m => m.motherID.toString() === patient._id.toString()
      );

      let pregnancyWeek = 0;
      let riskLevel = 'normal';

      if (maternalRecord && maternalRecord.pregnancy.lmpDate) {
        const lmpDate = new Date(maternalRecord.pregnancy.lmpDate);
        const today = new Date();
        const diffTime = Math.abs(today - lmpDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        pregnancyWeek = Math.floor(diffDays / 7);

        // Check for high-risk factors
        if (maternalRecord.pregnancy.riskFlags && maternalRecord.pregnancy.riskFlags.length > 0) {
          riskLevel = 'high';
        }
      }

      // Get last visit date
      const lastVisit = maternalRecord?.visits?.length > 0 
        ? maternalRecord.visits[maternalRecord.visits.length - 1].date 
        : null;

      // Get next appointment
      const nextAppointment = await Appointment.findOne({
        motherID: patient._id,
        doctorID,
        appointmentDate: { $gte: new Date() },
        status: { $ne: 'cancelled' }
      }).sort({ appointmentDate: 1 });

      return {
        _id: patient._id,
        name: patient.FullName,
        age: new Date().getFullYear() - new Date(patient.DateOfBirth).getFullYear(),
        pregnancyWeek,
        riskLevel,
        lastVisit,
        nextVisit: nextAppointment?.appointmentDate || null,
        phone: patient.PhoneNumber,
        profileImage: patient.ProfileImage
      };
    })
  );

  // Get today's appointments
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await Appointment.find({
    doctorID,
    appointmentDate: { $gte: today, $lt: tomorrow }
  }).populate('motherID', 'FullName ProfileImage PhoneNumber');

  // Calculate stats
  const totalPatients = patientsWithDetails.length;
  const highRiskPatients = patientsWithDetails.filter(p => p.riskLevel === 'high').length;
  const todayAppointmentsCount = todayAppointments.length;

  const dashboardData = {
    stats: {
      totalPatients,
      highRiskPatients,
      todayAppointments: todayAppointmentsCount
    },
    patients: patientsWithDetails,
    todaySchedule: todayAppointments
  };

  return res.status(200).json(
    new ApiResponse(200, dashboardData, "Doctor dashboard data fetched successfully")
  );
});

// 2. Get all patients assigned to doctor
const getDoctorPatients = AsynHandler(async (req, res) => {
  const doctorID = req.user._id;

  const assignments = await DoctorPatient.find({ 
    doctorID, 
    isActive: true 
  }).populate('patientID', 'FullName ProfileImage PhoneNumber DateOfBirth Email');

  const patientIDs = assignments.map(a => a.patientID._id);
  const maternalRecords = await MaternalRecord.find({ 
    motherID: { $in: patientIDs } 
  });

  const patientsWithDetails = assignments.map(assignment => {
    const patient = assignment.patientID;
    const maternalRecord = maternalRecords.find(
      m => m.motherID.toString() === patient._id.toString()
    );

    let pregnancyWeek = 0;
    if (maternalRecord && maternalRecord.pregnancy.lmpDate) {
      const lmpDate = new Date(maternalRecord.pregnancy.lmpDate);
      const today = new Date();
      const diffDays = Math.ceil((today - lmpDate) / (1000 * 60 * 60 * 24));
      pregnancyWeek = Math.floor(diffDays / 7);
    }

    return {
      ...patient.toObject(),
      pregnancyWeek,
      riskFlags: maternalRecord?.pregnancy.riskFlags || [],
      lastVisit: maternalRecord?.visits?.length > 0 
        ? maternalRecord.visits[maternalRecord.visits.length - 1].date 
        : null
    };
  });

  return res.status(200).json(
    new ApiResponse(200, patientsWithDetails, "Patients fetched successfully")
  );
});

// 3. Get detailed patient profile
const getPatientDetails = AsynHandler(async (req, res) => {
  const { patientId } = req.params;
  const doctorID = req.user._id;

  // Verify doctor has access to this patient
  const assignment = await DoctorPatient.findOne({
    doctorID,
    patientID: patientId,
    isActive: true
  });

  if (!assignment) throw new ApiError(403, "Access denied to this patient");

  // Get patient info
  const patient = await User.findById(patientId).select('-Password -RefreshToken');
  
  // Get maternal record
  const maternalRecord = await MaternalRecord.findOne({ motherID: patientId });
  
  // Get child records
  const children = await ChildRecord.find({ motherID: patientId });
  
  // Get appointments history
  const appointments = await Appointment.find({ 
    motherID: patientId,
    doctorID 
  }).sort({ appointmentDate: -1 }).limit(10);

  const patientDetails = {
    patient,
    maternalRecord,
    children,
    appointments
  };

  return res.status(200).json(
    new ApiResponse(200, patientDetails, "Patient details fetched successfully")
  );
});

// 4. Create appointment
const createAppointment = AsynHandler(async (req, res) => {
  const { motherID, appointmentDate, appointmentTime, type, notes, location } = req.body;
  const doctorID = req.user._id;

  // Verify doctor has access to this patient
  const assignment = await DoctorPatient.findOne({
    doctorID,
    patientID: motherID,
    isActive: true
  });

  if (!assignment) throw new ApiError(403, "Access denied to this patient");

  const appointment = await Appointment.create({
    motherID,
    doctorID,
    appointmentDate,
    appointmentTime,
    type,
    status: 'confirmed',
    notes,
    location
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('motherID', 'FullName PhoneNumber')
    .populate('doctorID', 'FullName Role');

  return res.status(201).json(
    new ApiResponse(201, populatedAppointment, "Appointment created successfully")
  );
});

// 5. Send message to patient
const sendMessage = AsynHandler(async (req, res) => {
  const { receiverID, message, messageType } = req.body;
  const senderID = req.user._id;

  // Verify doctor has access to this patient
  const assignment = await DoctorPatient.findOne({
    doctorID: senderID,
    patientID: receiverID,
    isActive: true
  });

  if (!assignment) throw new ApiError(403, "Access denied to this patient");

  const newMessage = await Message.create({
    senderID,
    receiverID,
    message,
    messageType: messageType || 'text',
    isRead: false
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('senderID', 'FullName Role')
    .populate('receiverID', 'FullName');

  return res.status(201).json(
    new ApiResponse(201, populatedMessage, "Message sent successfully")
  );
});

// 6. Get doctor's appointments
const getDoctorAppointments = AsynHandler(async (req, res) => {
  const doctorID = req.user._id;
  const { date } = req.query;

  let query = { doctorID, status: { $ne: 'cancelled' } };

  if (date) {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    query.appointmentDate = { $gte: targetDate, $lt: nextDay };
  } else {
    // Get upcoming appointments
    query.appointmentDate = { $gte: new Date() };
  }

  const appointments = await Appointment.find(query)
    .populate('motherID', 'FullName PhoneNumber ProfileImage')
    .sort({ appointmentDate: 1, appointmentTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully")
  );
});

// 7. Update appointment status
const updateAppointmentStatus = AsynHandler(async (req, res) => {
  const { appointmentId } = req.params;
  const { status, notes } = req.body;

  const appointment = await Appointment.findOneAndUpdate(
    { _id: appointmentId, doctorID: req.user._id },
    { status, $push: { notes } },
    { new: true }
  ).populate('motherID', 'FullName PhoneNumber');

  if (!appointment) throw new ApiError(404, "Appointment not found");

  return res.status(200).json(
    new ApiResponse(200, appointment, "Appointment updated successfully")
  );
});

// 8. Add visit record for patient
const addPatientVisit = AsynHandler(async (req, res) => {
  const { patientId } = req.params;
  const { date, gestationalWeek, bp, weightKg, notes } = req.body;
  const doctorID = req.user._id;

  // Verify access
  const assignment = await DoctorPatient.findOne({
    doctorID,
    patientID: patientId,
    isActive: true
  });

  if (!assignment) throw new ApiError(403, "Access denied");

  const maternalRecord = await MaternalRecord.findOne({ motherID: patientId });
  if (!maternalRecord) throw new ApiError(404, "Maternal record not found");

  maternalRecord.visits.push({
    date: date || new Date(),
    gestationalWeek,
    bp,
    weightKg,
    notes,
    providerID: doctorID
  });

  await maternalRecord.save();

  return res.status(201).json(
    new ApiResponse(201, maternalRecord.visits[maternalRecord.visits.length - 1], "Visit added successfully")
  );
});

// 9. Update patient risk flags
const updateRiskFlags = AsynHandler(async (req, res) => {
  const { patientId } = req.params;
  const { riskFlags } = req.body;
  const doctorID = req.user._id;

  // Verify access
  const assignment = await DoctorPatient.findOne({
    doctorID,
    patientID: patientId,
    isActive: true
  });

  if (!assignment) throw new ApiError(403, "Access denied");

  const maternalRecord = await MaternalRecord.findOneAndUpdate(
    { motherID: patientId },
    { 'pregnancy.riskFlags': riskFlags },
    { new: true }
  );

  if (!maternalRecord) throw new ApiError(404, "Maternal record not found");

  return res.status(200).json(
    new ApiResponse(200, maternalRecord, "Risk flags updated successfully")
  );
});

// 10. Assign patient to doctor
const assignPatient = AsynHandler(async (req, res) => {
  const { patientId } = req.body;
  const doctorID = req.user._id;

  // Check if already assigned
  const existing = await DoctorPatient.findOne({
    doctorID,
    patientID: patientId,
    isActive: true
  });

  if (existing) throw new ApiError(400, "Patient already assigned");

  const assignment = await DoctorPatient.create({
    doctorID,
    patientID: patientId,
    assignedDate: new Date(),
    isActive: true
  });

  return res.status(201).json(
    new ApiResponse(201, assignment, "Patient assigned successfully")
  );
});

// Get Mother Profile by Email
const getMotherByEmail = AsynHandler(async (req, res) => {
  const { email } = req.params;
  const doctorID = req.user._id;
  
  // Find mother by email
  const mother = await User.findOne({ 
    Email: email.toLowerCase(), 
    Role: "mother" 
  }).select("-Password -RefreshToken");
  
  if (!mother) {
    throw new ApiError(404, "Mother not found with this email");
  }
  
  // Get complete mother information
  const maternalRecord = await MaternalRecord.findOne({ motherID: mother._id });
  const childRecords = await ChildRecord.find({ motherID: mother._id });
  const appointments = await Appointment.find({ motherID: mother._id }).sort({ appointmentDate: -1 });
  
  // Get all health updates (from midwife and previous doctors)
  const healthUpdates = await HealthRecordUpdate.find({ motherID: mother._id })
    .sort({ createdAt: -1 })
    .populate("updatedBy", "FullName Role");
  
  // Get all advice given by this and other doctors
  const allAdvices = await DoctorAdvice.find({ motherID: mother._id })
    .sort({ createdAt: -1 })
    .populate("doctorID", "FullName");
  
  // Calculate pregnancy week if LMP exists
  let pregnancyInfo = null;
  if (maternalRecord?.LMP) {
    const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.LMP)) / (1000 * 60 * 60 * 24));
    const pregnancyWeek = Math.floor(daysSinceLMP / 7);
    const pregnancyDay = daysSinceLMP % 7;
    
    // Calculate EDD (280 days from LMP)
    const eddDate = new Date(maternalRecord.LMP);
    eddDate.setDate(eddDate.getDate() + 280);
    
    pregnancyInfo = {
      week: pregnancyWeek,
      day: pregnancyDay,
      EDD: eddDate,
      trimester: pregnancyWeek <= 13 ? 1 : pregnancyWeek <= 26 ? 2 : 3
    };
  }
  
  return res.status(200).json(new ApiResponse(200, {
    mother,
    maternalRecord,
    childRecords,
    appointments,
    healthUpdates,
    allAdvices,
    pregnancyInfo
  }, "Mother profile fetched successfully"));
});

// Send Advice to Mother
const sendAdviceToMother = AsynHandler(async (req, res) => {
  const doctorID = req.user._id;
  const { motherID, adviceType, subject, message, priority, requiresFollowup, followupDate, relatedHealthRecordID } = req.body;
  
  // Verify mother exists
  const mother = await User.findById(motherID);
  if (!mother || mother.Role !== "mother") {
    throw new ApiError(404, "Mother not found");
  }
  
  const advice = await DoctorAdvice.create({
    doctorID,
    motherID,
    adviceType,
    subject,
    message,
    priority,
    requiresFollowup,
    followupDate,
    relatedHealthRecordID
  });
  
  const populatedAdvice = await DoctorAdvice.findById(advice._id)
    .populate("doctorID", "FullName")
    .populate("motherID", "FullName Email");
  
  return res.status(201).json(new ApiResponse(201, populatedAdvice, "Advice sent successfully"));
});

// Get All Advice Given by Doctor
const getDoctorAdviceHistory = AsynHandler(async (req, res) => {
  const doctorID = req.user._id;
  
  const advices = await DoctorAdvice.find({ doctorID })
    .sort({ createdAt: -1 })
    .populate("motherID", "FullName Email PhoneNumber ProfileImage")
    .populate("relatedHealthRecordID");
  
  return res.status(200).json(new ApiResponse(200, advices, "Advice history fetched successfully"));
});

// Search Mothers (by name, email, phone)
const searchMothers = AsynHandler(async (req, res) => {
  const { query } = req.query;
  
  if (!query || query.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }
  
  const mothers = await User.find({
    Role: "mother",
    $or: [
      { FullName: { $regex: query, $options: 'i' } },
      { Email: { $regex: query, $options: 'i' } },
      { PhoneNumber: { $regex: query, $options: 'i' } }
    ]
  })
  .select("-Password -RefreshToken")
  .limit(20);
  
  // Get basic pregnancy info for each
  const mothersWithInfo = await Promise.all(mothers.map(async (mother) => {
    const maternalRecord = await MaternalRecord.findOne({ motherID: mother._id });
    
    let pregnancyWeek = null;
    if (maternalRecord?.LMP) {
      const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.LMP)) / (1000 * 60 * 60 * 24));
      pregnancyWeek = Math.floor(daysSinceLMP / 7);
    }
    
    return {
      ...mother.toObject(),
      pregnancyWeek,
      hasMaternaleRecord: !!maternalRecord
    };
  }));
  
  return res.status(200).json(new ApiResponse(200, mothersWithInfo, "Mothers found"));
});

export {
  getDoctorDashboard,
  getDoctorPatients,
  getPatientDetails,
  createAppointment,
  sendMessage,
  getDoctorAppointments,
  updateAppointmentStatus,
  addPatientVisit,
  updateRiskFlags,
  assignPatient,
  getMotherByEmail,
  sendAdviceToMother,
  getDoctorAdviceHistory,
  searchMothers
};

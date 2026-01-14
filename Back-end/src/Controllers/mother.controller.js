import { User } from "../Models/User.Model.js";
import { MaternalRecord } from "../Models/Maternal.model.js";
import { ChildRecord } from "../Models/ChildRecord.model.js";
import { Appointment } from "../Models/Appointment.model.js";
import { Message } from "../Models/Message.model.js";
import { DoctorPatient } from "../Models/DoctorPatient.model.js";
import { DoctorAdvice } from "../Models/DoctorAdvice.model.js";
import { HealthRecordUpdate } from "../Models/HealthRecordUpdate.model.js";
import { CheckupNotification } from "../Models/CheckupNotification.model.js";
import { MidwifeMotherAssignment } from "../Models/MidwifeMotherAssignment.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";

// 1. Get mother profile
const getMotherProfile = AsynHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-Password -RefreshToken");

  if (!user || user.Role !== "mother")
     throw new ApiError(403, "Access denied");
   
   console.log("mother profile fetched");
  return res.status(200).json(new ApiResponse(200, user, "Mother profile fetched"));
});

// 2. Get maternal record
const getMaternalRecord = AsynHandler(async (req, res) => {

  const record = await MaternalRecord.findOne({ motherID: req.user._id });
  if (!record) throw new ApiError(404, "Maternal record not found");
  
  console.log("Maternal record fetched");
  return res.status(200).json(new ApiResponse(200, record, "Maternal record fetched"));
});

// 3. Add self-reported visit
const addSelfVisit = AsynHandler(async (req, res) => {
  const { date, weightKg, bp, notes } = req.body;

  if(date==="" || weightKg==="" || bp===""){
     throw new ApiError("all feilds are required! ");
  }

  const record = await MaternalRecord.findOne({ motherID: req.user._id });
  if (!record) throw new ApiError(404, "Maternal record not found");

  record.visits.push({ date, weightKg, bp, notes, providerID: req.user._id });
  await record.save();
   
  console.log("visit added");
  return res.status(201).json(new ApiResponse(201, record.visits.slice(-1)[0], "Visit added"));
});

// 4. Register child
const registerChild = AsynHandler(async (req, res) => {
  const { name, dob, sex } = req.body;
  const child = await ChildRecord.create({
    motherID: req.user._id,
    child: { name, dob, sex }
  });
  return res.status(201).json(new ApiResponse(201, child, "Child registered"));
});

// 5. View vaccine schedule
const getVaccineSchedule = AsynHandler(async (req, res) => {
  const child = await ChildRecord.findById(req.params.childId);

  if (!child || child.motherID.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  return res.status(200).json(new ApiResponse(200, child.vaccines, "Vaccine schedule fetched"));
});




// 6. Get mother dashboard data (pregnancy info, appointments, messages)
const getMotherDashboard = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  // Get maternal record for pregnancy tracking
  const maternalRecord = await MaternalRecord.findOne({ motherID });
  
  // Calculate pregnancy week from LMP date
  let pregnancyWeek = 0;
  let edd = null;
  if (maternalRecord && maternalRecord.pregnancy.lmpDate) {
    const lmpDate = new Date(maternalRecord.pregnancy.lmpDate);
    const today = new Date();
    const diffTime = Math.abs(today - lmpDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    pregnancyWeek = Math.floor(diffDays / 7);
    edd = maternalRecord.pregnancy.edd;
  }

  // Get upcoming appointments
  const appointments = await Appointment.find({
    motherID,
    appointmentDate: { $gte: new Date() },
    status: { $ne: 'cancelled' }
  })
  .populate('doctorID', 'FullName Role')
  .sort({ appointmentDate: 1 })
  .limit(5);

  // Get recent messages
  const messages = await Message.find({
    receiverID: motherID
  })
  .populate('senderID', 'FullName Role')
  .sort({ createdAt: -1 })
  .limit(5);

  // Get assigned doctor/midwife
  const assignment = await DoctorPatient.findOne({ 
    patientID: motherID, 
    isActive: true 
  }).populate('doctorID', 'FullName Role PhoneNumber');

  // Get child records for vaccine info
  const children = await ChildRecord.find({ motherID });
  let vaccinesDue = 0;
  children.forEach(child => {
    vaccinesDue += child.vaccines.filter(v => v.status === 'due').length;
  });

  // Get doctor advice (recent 5)
  const doctorAdvice = await DoctorAdvice.find({ motherID })
    .populate('doctorID', 'FullName ProfileImage')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get health record updates from midwife (recent 5)
  const healthUpdates = await HealthRecordUpdate.find({ motherID })
    .populate('updatedBy', 'FullName Role ProfileImage')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get upcoming checkup notifications
  const upcomingCheckups = await CheckupNotification.find({
    motherID,
    status: 'pending',
    scheduledDate: { $gte: new Date() }
  })
    .populate('midwifeID', 'FullName PhoneNumber')
    .sort({ scheduledDate: 1 })
    .limit(5);

  // Get assigned midwife
  const midwifeAssignment = await MidwifeMotherAssignment.findOne({
    motherID,
    status: 'active'
  }).populate('midwifeID', 'FullName PhoneNumber ProfileImage');

  const dashboardData = {
    pregnancyWeek,
    edd,
    riskFlags: maternalRecord?.pregnancy.riskFlags || [],
    appointments,
    messages,
    assignedDoctor: assignment?.doctorID || null,
    assignedMidwife: midwifeAssignment?.midwifeID || null,
    vaccinesDue,
    children,
    doctorAdvice,
    healthUpdates,
    upcomingCheckups
  };

  return res.status(200).json(
    new ApiResponse(200, dashboardData, "Dashboard data fetched successfully")
  );
});

// 7. Get all appointments for mother
const getMotherAppointments = AsynHandler(async (req, res) => {
  const appointments = await Appointment.find({ motherID: req.user._id })
    .populate('doctorID', 'FullName Role PhoneNumber ProfileImage')
    .sort({ appointmentDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, appointments, "Appointments fetched successfully")
  );
});

// 8. Get messages for mother
const getMotherMessages = AsynHandler(async (req, res) => {
  const messages = await Message.find({ receiverID: req.user._id })
    .populate('senderID', 'FullName Role ProfileImage')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, messages, "Messages fetched successfully")
  );
});

// 9. Mark message as read
const markMessageRead = AsynHandler(async (req, res) => {
  const { messageId } = req.params;
  
  const message = await Message.findOneAndUpdate(
    { _id: messageId, receiverID: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!message) throw new ApiError(404, "Message not found");

  return res.status(200).json(
    new ApiResponse(200, message, "Message marked as read")
  );
});

// 10. Create maternal record for new mother
const createMaternalRecord = AsynHandler(async (req, res) => {
  const { lmpDate, parity } = req.body;

  // Check if record already exists
  const existing = await MaternalRecord.findOne({ motherID: req.user._id });
  if (existing) throw new ApiError(400, "Maternal record already exists");

  // Calculate EDD (280 days from LMP)
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280);

  const record = await MaternalRecord.create({
    motherID: req.user._id,
    pregnancy: {
      lmpDate: lmp,
      edd: edd,
      parity: parity || 0,
      riskFlags: []
    },
    visits: [],
    postpartum: []
  });

  return res.status(201).json(
    new ApiResponse(201, record, "Maternal record created successfully")
  );
});

// 11. Get all doctor advice for mother
const getAllDoctorAdvice = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const advice = await DoctorAdvice.find({ motherID })
    .populate('doctorID', 'FullName Email PhoneNumber ProfileImage')
    .populate('relatedHealthUpdate')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, advice, "Doctor advice fetched successfully")
  );
});

// 12. Get all health updates for mother
const getAllHealthUpdates = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const healthUpdates = await HealthRecordUpdate.find({ motherID })
    .populate('updatedBy', 'FullName Role Email PhoneNumber ProfileImage')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, healthUpdates, "Health updates fetched successfully")
  );
});

// 13. Mark doctor advice as read
const markAdviceAsRead = AsynHandler(async (req, res) => {
  const { adviceId } = req.params;
  const motherID = req.user._id;

  const advice = await DoctorAdvice.findOneAndUpdate(
    { _id: adviceId, motherID },
    { isRead: true, readAt: new Date() },
    { new: true }
  ).populate('doctorID', 'FullName Email PhoneNumber ProfileImage');

  if (!advice) throw new ApiError(404, "Advice not found");

  return res.status(200).json(
    new ApiResponse(200, advice, "Advice marked as read")
  );
});

// 14. Get all scheduled checkups for mother
const getMyCheckups = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const checkups = await CheckupNotification.find({ motherID })
    .populate('midwifeID', 'FullName PhoneNumber ProfileImage')
    .populate('doctorID', 'FullName PhoneNumber ProfileImage')
    .sort({ scheduledDate: -1 });

  return res.status(200).json(
    new ApiResponse(200, checkups, "Checkups fetched successfully")
  );
});

export {
    getMotherProfile,
    getMaternalRecord,
    addSelfVisit,
    registerChild,
    getVaccineSchedule,
    getMotherDashboard,
    getMotherAppointments,
    getMotherMessages,
    markMessageRead,
    createMaternalRecord,
    getAllDoctorAdvice,
    getAllHealthUpdates,
    markAdviceAsRead,
    getMyCheckups
}
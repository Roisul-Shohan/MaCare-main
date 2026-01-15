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
import { KickCounter } from "../Models/KickCounter.model.js";
import { WeightTracking } from "../Models/WeightTracking.model.js";
import { BPTracking } from "../Models/BPTracking.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { AsynHandler } from "../Utils/AsyncHandler.js";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (!record) {
    // Return null/empty response instead of throwing error - record may not exist yet
    return res.status(200).json(new ApiResponse(200, null, "No maternal record found"));
  }
  
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
  const { name, dob, gender, weight, deliveryType, bloodGroup } = req.body;
  const child = await ChildRecord.create({
    motherID: req.user._id,
    child: { name, dob, gender, weight, deliveryType, bloodGroup }
  });
  return res.status(201).json(new ApiResponse(201, child, "Child registered"));
});

// 4b. Delete child record
const deleteChild = AsynHandler(async (req, res) => {
  const { childId } = req.params;
  
  const child = await ChildRecord.findById(childId);
  
  if (!child || child.motherID.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Access denied");
  }
  
  await ChildRecord.findByIdAndDelete(childId);
  
  return res.status(200).json(new ApiResponse(200, {}, "Child record deleted successfully"));
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

// 11. Delete maternal record
const deleteMaternalRecord = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const deleted = await MaternalRecord.findOneAndDelete({ motherID });
  
  if (!deleted) {
    throw new ApiError(404, "Maternal record not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Maternal record deleted successfully")
  );
});

// 12. Get all doctor advice for mother
const getAllDoctorAdvice = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  const advice = await DoctorAdvice.find({ motherID })
    .populate('doctorID', 'FullName Email PhoneNumber ProfileImage')
    .populate('relatedHealthRecordID')
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

// 15. Get pregnancy weeks data from JSON files
const getPregnancyWeeks = AsynHandler(async (req, res) => {
  const normalized = path.join(__dirname, '../Utils/pregnancy_weeks');
  
  try {
    const files = fs.readdirSync(normalized).filter(f => f.endsWith('.json'));
    const weeks = [];
    
    for (const file of files) {
      const filePath = path.join(normalized, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const weekData = JSON.parse(content);
      weeks.push(weekData);
    }
    
    // Sort by week number
    weeks.sort((a, b) => a.week - b.week);
    
    return res.status(200).json(
      new ApiResponse(200, weeks, "Pregnancy weeks data fetched successfully")
    );
  } catch (error) {
    console.error('Error reading pregnancy weeks:', error);
    throw new ApiError(500, "Failed to fetch pregnancy weeks data");
  }
});

// 16. Get nutrition weeks data from JSON files
const getNutritionWeeks = AsynHandler(async (req, res) => {
  const normalized = path.join(__dirname, '../Utils/pusti_weeks');
  
  try {
    const files = fs.readdirSync(normalized).filter(f => f.endsWith('.json'));
    const weeks = [];
    
    for (const file of files) {
      try {
        const filePath = path.join(normalized, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Skip empty files
        if (!content || content.trim().length === 0) {
          console.warn(`Skipping empty file: ${file}`);
          continue;
        }
        
        const weekData = JSON.parse(content);
        weeks.push(weekData);
      } catch (fileError) {
        console.error(`Error parsing file ${file}:`, fileError.message);
        // Continue to next file instead of failing completely
        continue;
      }
    }
    
    // Sort by week number
    weeks.sort((a, b) => a.week - b.week);
    
    return res.status(200).json(
      new ApiResponse(200, weeks, "Nutrition weeks data fetched successfully")
    );
  } catch (error) {
    console.error('Error reading nutrition weeks:', error);
    throw new ApiError(500, "Failed to fetch nutrition weeks data");
  }
});

// 17. Get health articles list
const getHealthArticles = AsynHandler(async (req, res) => {
  const normalized = path.join(__dirname, '../Utils/health_article');

  try {
    const files = fs.readdirSync(normalized).filter(f => f.endsWith('.json'));
    const articles = [];

    for (const file of files) {
      try {
        const filePath = path.join(normalized, file);
        const content = fs.readFileSync(filePath, 'utf8');
        if (!content || content.trim().length === 0) continue;
        const json = JSON.parse(content);
        articles.push({
          slug: file.replace(/\.json$/i, ''),
          title: json.title || '',
          overview: json.overview || json.intro || '',
          language: json.language || 'bn',
          lastUpdated: json.lastUpdated || null
        });
      } catch (err) {
        console.warn(`Skipping invalid article file ${file}:`, err.message);
        continue;
      }
    }

    // sort alphabetically by title
    articles.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    return res.status(200).json(new ApiResponse(200, articles, 'Health articles fetched successfully'));
  } catch (error) {
    console.error('Error reading health articles:', error);
    throw new ApiError(500, 'Failed to fetch health articles');
  }
});

// 18. Get single health article by slug
const getHealthArticleBySlug = AsynHandler(async (req, res) => {
  const { slug } = req.params;
  if (!slug) throw new ApiError(400, 'Article slug is required');

  const normalized = path.join(__dirname, '../Utils/health_article');
  const filePath = path.join(normalized, `${slug}.json`);

  try {
    if (!fs.existsSync(filePath)) throw new ApiError(404, 'Article not found');
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content) throw new ApiError(404, 'Article content empty');
    const json = JSON.parse(content);
    return res.status(200).json(new ApiResponse(200, json, 'Health article fetched successfully'));
  } catch (error) {
    console.error('Error reading article', slug, error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to fetch article');
  }
});

// ==================== KICK COUNTER FUNCTIONALITY ====================

// 1. Save a new kick counter session
const saveKickSession = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { firstKickTime, lastKickTime, kickCount, pregnancyWeek, notes } = req.body;

  // Validate required fields
  if (!firstKickTime || !lastKickTime || kickCount === undefined) {
    throw new ApiError(400, "First kick time, last kick time, and kick count are required");
  }

  // Calculate duration in seconds
  const first = new Date(firstKickTime);
  const last = new Date(lastKickTime);
  const duration = Math.floor((last - first) / 1000);

  if (duration < 0) {
    throw new ApiError(400, "Last kick time must be after first kick time");
  }

  // Get pregnancy week if not provided
  let week = pregnancyWeek;
  if (!week) {
    const maternalRecord = await MaternalRecord.findOne({ motherID });
    if (maternalRecord?.pregnancy?.lmpDate) {
      const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.pregnancy.lmpDate)) / (1000 * 60 * 60 * 24));
      week = Math.floor(daysSinceLMP / 7);
    }
  }

  const session = await KickCounter.create({
    motherID,
    date: new Date(),
    firstKickTime: first,
    lastKickTime: last,
    duration,
    kickCount: parseInt(kickCount),
    pregnancyWeek: week,
    notes: notes || "",
    sessionCompleted: true
  });

  return res.status(201).json(
    new ApiResponse(201, session, "Kick counter session saved successfully")
  );
});

// 2. Get all kick counter sessions for a mother
const getKickSessions = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { limit = 50, page = 1, pregnancyWeek } = req.query;

  const filter = { motherID };
  if (pregnancyWeek) {
    filter.pregnancyWeek = parseInt(pregnancyWeek);
  }

  const sessions = await KickCounter.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await KickCounter.countDocuments(filter);

  // Group sessions by pregnancy week
  const groupedSessions = sessions.reduce((acc, session) => {
    const week = session.pregnancyWeek || 0;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(session);
    return acc;
  }, {});

  return res.status(200).json(
    new ApiResponse(200, {
      sessions,
      groupedSessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }, "Kick counter sessions fetched successfully")
  );
});

// 3. Delete a kick counter session
const deleteKickSession = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { sessionId } = req.params;

  const session = await KickCounter.findOneAndDelete({
    _id: sessionId,
    motherID
  });

  if (!session) {
    throw new ApiError(404, "Session not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Kick counter session deleted successfully")
  );
});

// ==================== WEIGHT & HEIGHT TRACKING ====================

// 1. Save weight entry
const saveWeightEntry = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { weight, height, date, pregnancyWeek, notes } = req.body;

  if (!weight) {
    throw new ApiError(400, "Weight is required");
  }

  // Get pregnancy week if not provided
  let week = pregnancyWeek;
  if (!week) {
    const maternalRecord = await MaternalRecord.findOne({ motherID });
    if (maternalRecord?.pregnancy?.lmpDate) {
      const daysSinceLMP = Math.floor((Date.now() - new Date(maternalRecord.pregnancy.lmpDate)) / (1000 * 60 * 60 * 24));
      week = Math.floor(daysSinceLMP / 7);
    }
  }

  const entry = await WeightTracking.create({
    motherID,
    date: date ? new Date(date) : new Date(),
    pregnancyWeek: week,
    weight: parseFloat(weight),
    height: height ? parseFloat(height) : undefined,
    notes: notes || "",
    recordedBy: 'mother'
  });

  // Calculate weight change
  const weightChange = await entry.getWeightChange();

  return res.status(201).json(
    new ApiResponse(201, { ...entry.toObject(), weightChange }, "Weight entry saved successfully")
  );
});

// 2. Get weight history
const getWeightHistory = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { limit = 50, page = 1 } = req.query;

  const entries = await WeightTracking.find({ motherID })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

  const total = await WeightTracking.countDocuments({ motherID });

  // Calculate weight changes
  const entriesWithChanges = await Promise.all(
    entries.map(async (entry) => {
      const weightChange = await entry.getWeightChange();
      return { ...entry.toObject(), weightChange };
    })
  );

  // Get statistics
  const allEntries = await WeightTracking.find({ motherID }).sort({ date: 1 });
  const startingWeight = allEntries.length > 0 ? allEntries[0].weight : null;
  const currentWeight = allEntries.length > 0 ? allEntries[allEntries.length - 1].weight : null;
  const totalGain = startingWeight && currentWeight ? currentWeight - startingWeight : 0;
  const latestHeight = allEntries.find(e => e.height)?.height || null;

  // Expected weight gain (typical: 11-16 kg for healthy BMI)
  const expectedFinalWeight = startingWeight ? startingWeight + 13 : null;

  return res.status(200).json(
    new ApiResponse(200, {
      entries: entriesWithChanges,
      statistics: {
        startingWeight,
        currentWeight,
        expectedFinalWeight,
        totalGain,
        height: latestHeight
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    }, "Weight history fetched successfully")
  );
});

// 3. Delete weight entry
const deleteWeightEntry = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { entryId } = req.params;

  const entry = await WeightTracking.findOneAndDelete({
    _id: entryId,
    motherID
  });

  if (!entry) {
    throw new ApiError(404, "Weight entry not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Weight entry deleted successfully")
  );
});

// BP Tracking Controllers

// 1. Save BP entry
const saveBPEntry = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { systolic, diastolic, date, time, notes } = req.body;

  // Validate required fields
  if (!systolic || !diastolic) {
    throw new ApiError(400, "Systolic and diastolic readings are required");
  }

  // Validate BP ranges
  if (systolic < 70 || systolic > 250) {
    throw new ApiError(400, "Systolic BP must be between 70 and 250 mmHg");
  }

  if (diastolic < 40 || diastolic > 180) {
    throw new ApiError(400, "Diastolic BP must be between 40 and 180 mmHg");
  }

  // Get BP status
  const status = BPTracking.getBPStatus(systolic, diastolic);

  // Get pregnancy week if maternal record exists
  let pregnancyWeek = null;
  const maternalRecord = await MaternalRecord.findOne({ motherID });
  if (maternalRecord && maternalRecord.pregnancy && maternalRecord.pregnancy.lmpDate) {
    const lmpDate = new Date(maternalRecord.pregnancy.lmpDate);
    const today = new Date();
    const diffTime = Math.abs(today - lmpDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    pregnancyWeek = Math.floor(diffDays / 7);
  }

  // Create BP entry
  const bpEntry = await BPTracking.create({
    motherID,
    systolic: Number(systolic),
    diastolic: Number(diastolic),
    date: date ? new Date(date) : new Date(),
    time: time || new Date().toLocaleTimeString('en-US', { hour12: false }),
    status,
    pregnancyWeek,
    notes
  });

  return res.status(201).json(
    new ApiResponse(201, bpEntry, "BP entry saved successfully")
  );
});

// 2. Get BP history with statistics
const getBPHistory = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  // Get all BP entries sorted by date (newest first)
  const entries = await BPTracking.find({ motherID })
    .sort({ date: -1, createdAt: -1 })
    .lean();

  // Calculate statistics
  let statistics = {
    latestReading: null,
    averageSystolic: 0,
    averageDiastolic: 0,
    totalReadings: entries.length,
    normalCount: 0,
    elevatedCount: 0,
    highCount: 0,
    crisisCount: 0
  };

  if (entries.length > 0) {
    statistics.latestReading = entries[0];

    // Calculate averages
    const totalSystolic = entries.reduce((sum, entry) => sum + entry.systolic, 0);
    const totalDiastolic = entries.reduce((sum, entry) => sum + entry.diastolic, 0);
    statistics.averageSystolic = Math.round(totalSystolic / entries.length);
    statistics.averageDiastolic = Math.round(totalDiastolic / entries.length);

    // Count status types
    entries.forEach(entry => {
      if (entry.status === 'normal') statistics.normalCount++;
      else if (entry.status === 'elevated') statistics.elevatedCount++;
      else if (entry.status === 'crisis') statistics.crisisCount++;
      else statistics.highCount++;
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        entries,
        statistics
      },
      "BP history fetched successfully"
    )
  );
});

// 3. Delete BP entry
const deleteBPEntry = AsynHandler(async (req, res) => {
  const motherID = req.user._id;
  const { entryId } = req.params;

  const entry = await BPTracking.findOneAndDelete({
    _id: entryId,
    motherID
  });

  if (!entry) {
    throw new ApiError(404, "BP entry not found or unauthorized");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "BP entry deleted successfully")
  );
});

// Get personalized health tips based on BP and BMI
const getHealthTips = AsynHandler(async (req, res) => {
  const motherID = req.user._id;

  try {
    // Get latest BP entry
    const latestBP = await BPTracking.findOne({ motherID })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    // Get latest weight entry (for BMI)
    const latestWeight = await WeightTracking.findOne({ motherID })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const tips = {
      bpTips: null,
      bmiTips: null,
      hasCriticalAlert: false
    };

    // Analyze BP and provide tips
    if (latestBP) {
      const { systolic, diastolic, status } = latestBP;
      
      // High BP (≥140/90)
      if (systolic >= 140 || diastolic >= 90) {
        const highBPData = JSON.parse(
          fs.readFileSync(path.join(__dirname, '../Utils/health_tips/high_bp.json'), 'utf-8')
        );
        tips.bpTips = {
          ...highBPData,
          currentReading: { systolic, diastolic },
          status,
          recordedDate: latestBP.date
        };
        if (status === 'crisis') {
          tips.hasCriticalAlert = true;
        }
      }
      // Low BP (<90/60)
      else if (systolic < 90 || diastolic < 60) {
        const lowBPData = JSON.parse(
          fs.readFileSync(path.join(__dirname, '../Utils/health_tips/low_bp.json'), 'utf-8')
        );
        tips.bpTips = {
          ...lowBPData,
          currentReading: { systolic, diastolic },
          status,
          recordedDate: latestBP.date
        };
      }
    }

    // Analyze BMI and provide tips
    if (latestWeight && latestWeight.height) {
      const { weight, height, bmi } = latestWeight;
      
      const bmiAssessmentData = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../Utils/health_tips/bmi_assessment.json'), 'utf-8')
      );

      // Find matching BMI category
      let matchedCategory = null;
      
      for (const category of bmiAssessmentData.categories) {
        const range = category.range;
        
        if (range.includes('< 16.0') && bmi < 16.0) {
          matchedCategory = category;
          tips.hasCriticalAlert = true;
          break;
        } else if (range.includes('16.0 – 18.4') && bmi >= 16.0 && bmi <= 18.4) {
          matchedCategory = category;
          break;
        } else if (range.includes('18.5 – 24.9') && bmi >= 18.5 && bmi <= 24.9) {
          matchedCategory = category;
          break;
        } else if (range.includes('25.0 – 29.9') && bmi >= 25.0 && bmi <= 29.9) {
          matchedCategory = category;
          break;
        } else if (range.includes('≥ 30.0') && bmi >= 30.0) {
          matchedCategory = category;
          if (bmi >= 35.0) {
            tips.hasCriticalAlert = true;
          }
          break;
        }
      }

      if (matchedCategory) {
        tips.bmiTips = {
          label: bmiAssessmentData.label,
          currentBMI: bmi,
          currentWeight: weight,
          height: height,
          category: matchedCategory.category,
          range: matchedCategory.range,
          riskLevel: matchedCategory.riskLevel,
          healthRisks: matchedCategory.healthRisks,
          healthTips: matchedCategory.healthTips,
          recommendedFollowUp: matchedCategory.recommendedFollowUp,
          action: matchedCategory.action,
          recordedDate: latestWeight.date
        };
      }
    }

    return res.status(200).json(
      new ApiResponse(200, tips, "Health tips fetched successfully")
    );

  } catch (error) {
    console.error('Error reading health tips:', error);
    throw new ApiError(500, "Failed to fetch health tips");
  }
});

export {
    getMotherProfile,
    getMaternalRecord,
    addSelfVisit,
    registerChild,
    deleteChild,
    getVaccineSchedule,
    getMotherDashboard,
    getMotherAppointments,
    getMotherMessages,
    markMessageRead,
    createMaternalRecord,
    deleteMaternalRecord,
    getAllDoctorAdvice,
    getAllHealthUpdates,
    markAdviceAsRead,
    getMyCheckups,
    getPregnancyWeeks,
    getNutritionWeeks,
    getHealthArticles,
    getHealthArticleBySlug,
    saveKickSession,
    getKickSessions,
    deleteKickSession,
    saveWeightEntry,
    getWeightHistory,
    deleteWeightEntry,
    saveBPEntry,
    getBPHistory,
    deleteBPEntry,
    getHealthTips
}
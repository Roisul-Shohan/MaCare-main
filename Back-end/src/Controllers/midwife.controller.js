import { AsynHandler } from "../Utils/AsyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Models/User.Model.js";
import { MaternalRecord } from "../Models/Maternal.model.js";
import { DoctorAdvice } from "../Models/DoctorAdvice.model.js";
import { WeeklyCheckup } from "../Models/WeeklyCheckup.model.js";

// Get Midwife Dashboard Statistics
const getMidwifeDashboard = AsynHandler(async (req, res) => {
  const midwifeID = req.user._id;
  
  // Get current week info
  const { weekNumber, year } = WeeklyCheckup.getCurrentWeekInfo();
  
  // Get total mothers in the system
  const totalMothers = await User.countDocuments({ Role: "mother" });
  
  // Get checkups done this week by this midwife
  const checkupsThisWeek = await WeeklyCheckup.countDocuments({
    midwifeID,
    weekNumber,
    year
  });
  
  // Get checkups done today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const checkupsToday = await WeeklyCheckup.countDocuments({
    midwifeID,
    checkupDate: { $gte: today, $lt: tomorrow }
  });
  
  // Get all mothers who had checkups this week
  const mothersWithCheckup = await WeeklyCheckup.find({
    weekNumber,
    year
  }).distinct('motherID');
  
  // Count mothers who missed this week's checkup
  const mothersMissedCheckup = totalMothers - mothersWithCheckup.length;
  
  // Get recent checkups done by this midwife
  const recentCheckups = await WeeklyCheckup.find({ midwifeID })
    .sort({ checkupDate: -1 })
    .limit(5)
    .populate('motherID', 'FullName PhoneNumber address')
    .lean();
  
  return res.status(200).json(
    new ApiResponse(200, {
      statistics: {
        totalMothers,
        checkupsThisWeek,
        checkupsToday,
        mothersMissedCheckup,
        currentWeek: weekNumber,
        currentYear: year
      },
      recentCheckups
    }, "Dashboard data fetched successfully")
  );
});

// Search Mothers by Village Name
const searchMothersByVillage = AsynHandler(async (req, res) => {
  const { villageName } = req.query;
  
  if (!villageName) {
    throw new ApiError(400, "Village name is required");
  }
  
  // Search for mothers whose address.village contains the search term
  const mothers = await User.find({
    Role: "mother",
    "address.village": { $regex: villageName, $options: 'i' }
  })
  .select('FullName PhoneNumber Email address DateOfBirth BloodGroup')
  .lean();
  
  // Get current week info
  const { weekNumber, year} = WeeklyCheckup.getCurrentWeekInfo();
  
  // For each mother, check if they had a checkup this week
  const mothersWithCheckupStatus = await Promise.all(
    mothers.map(async (mother) => {
      const hasCheckup = await WeeklyCheckup.findOne({
        motherID: mother._id,
        weekNumber,
        year
      });
      
      // Get maternal record for pregnancy info
      const maternalRecord = await MaternalRecord.findOne({ 
        motherID: mother._id 
      }).select('pregnancy');
      
      return {
        ...mother,
        hasCheckupThisWeek: !!hasCheckup,
        checkupBy: hasCheckup ? hasCheckup.midwifeID : null,
        pregnancyInfo: maternalRecord?.pregnancy || null
      };
    })
  );
  
  return res.status(200).json(
    new ApiResponse(200, {
      mothers: mothersWithCheckupStatus,
      count: mothersWithCheckupStatus.length,
      searchTerm: villageName
    }, "Mothers fetched successfully")
  );
});

// Get Mothers Who Missed Weekly Checkup
const getMissedCheckups = AsynHandler(async (req, res) => {
  const { weekNumber, year } = WeeklyCheckup.getCurrentWeekInfo();
  
  // Get all mother IDs
  const allMothers = await User.find({ Role: "mother" })
    .select('FullName PhoneNumber Email address DateOfBirth')
    .lean();
  
  // Get all mothers who had checkups this week
  const mothersWithCheckup = await WeeklyCheckup.find({
    weekNumber,
    year
  }).distinct('motherID');
  
  // Filter mothers who missed checkup
  const mothersMissed = allMothers.filter(
    mother => !mothersWithCheckup.some(id => id.equals(mother._id))
  );
  
  // Get maternal records for pregnancy info
  const mothersWithPregnancyInfo = await Promise.all(
    mothersMissed.map(async (mother) => {
      const maternalRecord = await MaternalRecord.findOne({ 
        motherID: mother._id 
      }).select('pregnancy');
      
      // Get last checkup date
      const lastCheckup = await WeeklyCheckup.findOne({
        motherID: mother._id
      }).sort({ checkupDate: -1 });
      
      return {
        ...mother,
        pregnancyInfo: maternalRecord?.pregnancy || null,
        lastCheckupDate: lastCheckup?.checkupDate || null,
        weeksSinceLastCheckup: lastCheckup 
          ? Math.floor((Date.now() - lastCheckup.checkupDate) / (7 * 24 * 60 * 60 * 1000))
          : null
      };
    })
  );
  
  return res.status(200).json(
    new ApiResponse(200, {
      mothersMissed: mothersWithPregnancyInfo,
      count: mothersWithPregnancyInfo.length,
      currentWeek: weekNumber,
      currentYear: year
    }, "Missed checkups fetched successfully")
  );
});

// Get Mother Details with Checkup History and Doctor's Advice
const getMotherDetails = AsynHandler(async (req, res) => {
  const { motherID } = req.params;
  
  if (!motherID) {
    throw new ApiError(400, "Mother ID is required");
  }
  
  // Get mother info
  const mother = await User.findById(motherID)
    .select('-Password -RefreshToken')
    .lean();
  
  if (!mother || mother.Role !== 'mother') {
    throw new ApiError(404, "Mother not found");
  }
  
  // Get maternal record
  const maternalRecord = await MaternalRecord.findOne({ motherID }).lean();
  
  // Get checkup history
  const checkupHistory = await WeeklyCheckup.find({ motherID })
    .sort({ checkupDate: -1 })
    .populate('midwifeID', 'FullName')
    .lean();
  
  // Get doctor's advice
  const doctorAdvice = await DoctorAdvice.find({ motherID })
    .sort({ createdAt: -1 })
    .populate('doctorID', 'FullName')
    .lean();
  
  // Check if checkup already done this week
  const { weekNumber, year } = WeeklyCheckup.getCurrentWeekInfo();
  const hasCheckupThisWeek = await WeeklyCheckup.findOne({
    motherID,
    weekNumber,
    year
  });
  
  return res.status(200).json(
    new ApiResponse(200, {
      mother,
      maternalRecord,
      checkupHistory,
      doctorAdvice,
      hasCheckupThisWeek: !!hasCheckupThisWeek,
      checkupThisWeekBy: hasCheckupThisWeek ? hasCheckupThisWeek.midwifeID : null
    }, "Mother details fetched successfully")
  );
});

// Create Weekly Checkup
const createWeeklyCheckup = AsynHandler(async (req, res) => {
  const midwifeID = req.user._id;
  const { motherID, systolic, diastolic, weight, height, notes } = req.body;
  
  // Validation
  if (!motherID) {
    throw new ApiError(400, "Mother ID is required");
  }
  
  if (!systolic || !diastolic || !weight) {
    throw new ApiError(400, "Blood pressure and weight are required");
  }
  
  // Validate mother exists
  const mother = await User.findById(motherID);
  if (!mother || mother.Role !== 'mother') {
    throw new ApiError(404, "Mother not found");
  }
  
  // Get current week info
  const { weekNumber, year } = WeeklyCheckup.getCurrentWeekInfo();
  
  // Check if checkup already exists for this week
  const existingCheckup = await WeeklyCheckup.findOne({
    motherID,
    weekNumber,
    year
  });
  
  if (existingCheckup) {
    throw new ApiError(409, "এই মায়ের এই সপ্তাহের চেকআপ ইতিমধ্যে সম্পন্ন হয়েছে");
  }
  
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
  
  // Create checkup
  const checkup = await WeeklyCheckup.create({
    motherID,
    midwifeID,
    checkupDate: new Date(),
    weekNumber,
    year,
    bloodPressure: {
      systolic: Number(systolic),
      diastolic: Number(diastolic)
    },
    weight: Number(weight),
    height: height ? Number(height) : null,
    pregnancyWeek,
    notes,
    isLocked: true,
    lockedAt: new Date()
  });
  
  // Populate checkup with mother and midwife info
  const populatedCheckup = await WeeklyCheckup.findById(checkup._id)
    .populate('motherID', 'FullName PhoneNumber address')
    .populate('midwifeID', 'FullName')
    .lean();
  
  return res.status(201).json(
    new ApiResponse(201, populatedCheckup, "সাপ্তাহিক চেকআপ সফলভাবে সম্পন্ন হয়েছে")
  );
});

// Get Midwife's Checkup History
const getMyCheckups = AsynHandler(async (req, res) => {
  const midwifeID = req.user._id;
  const { page = 1, limit = 20 } = req.query;
  
  const skip = (page - 1) * limit;
  
  const checkups = await WeeklyCheckup.find({ midwifeID })
    .sort({ checkupDate: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('motherID', 'FullName PhoneNumber address')
    .lean();
  
  const total = await WeeklyCheckup.countDocuments({ midwifeID });
  
  return res.status(200).json(
    new ApiResponse(200, {
      checkups,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, "Checkups fetched successfully")
  );
});

export {
  getMidwifeDashboard,
  searchMothersByVillage,
  getMissedCheckups,
  getMotherDetails,
  createWeeklyCheckup,
  getMyCheckups
};

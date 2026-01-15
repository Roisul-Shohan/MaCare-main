import { Router } from "express";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";
import { upload } from "../Middleware/Multer.Middleware.js";
import { 
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
} from "../Controllers/mother.controller.js";

import { getHealthArticles, getHealthArticleBySlug } from "../Controllers/mother.controller.js";

import {
  getVaccineSchedule as getPregnancyVaccineSchedule,
  markVaccineCompleted,
  uploadVaccinePDF,
  deleteVaccinePDF,
  deleteVaccine,
  resetVaccineStatus,
  createVaccine
} from "../Controllers/Vaccine/vaccine.controller.js";

const router = Router();

// Mother routes
router.route('/dashboard').get(jwtVerification, getMotherDashboard);
router.route('/profile').get(jwtVerification, getMotherProfile);
router.route('/maternal-record').get(jwtVerification, getMaternalRecord);
router.route('/maternal-record').post(jwtVerification, createMaternalRecord);
router.route('/maternal-record').delete(jwtVerification, deleteMaternalRecord);
router.route('/visit').post(jwtVerification, addSelfVisit);
router.route('/child/register').post(jwtVerification, registerChild);
router.route('/child/:childId').delete(jwtVerification, deleteChild);
router.route('/child/:childId/vaccines').get(jwtVerification, getVaccineSchedule);
router.route('/appointments').get(jwtVerification, getMotherAppointments);
router.route('/messages').get(jwtVerification, getMotherMessages);
router.route('/messages/:messageId/read').patch(jwtVerification, markMessageRead);

// New routes for doctor advice and health updates
router.route('/doctor-advice').get(jwtVerification, getAllDoctorAdvice);
router.route('/doctor-advice/:adviceId/read').patch(jwtVerification, markAdviceAsRead);
router.route('/health-updates').get(jwtVerification, getAllHealthUpdates);
router.route('/checkups').get(jwtVerification, getMyCheckups);
// Pregnancy weeks data (static or seeded)
router.route('/pregnancy/weeks').get(jwtVerification, getPregnancyWeeks);

// Health articles
router.route('/health-articles').get(jwtVerification, getHealthArticles);
router.route('/health-articles/:slug').get(jwtVerification, getHealthArticleBySlug);

// Nutrition weeks data (static or seeded)
router.route('/nutrition/weeks').get(jwtVerification, getNutritionWeeks);

// Kick Counter routes
router.route('/kick-counter').post(jwtVerification, saveKickSession);
router.route('/kick-counter').get(jwtVerification, getKickSessions);
router.route('/kick-counter/:sessionId').delete(jwtVerification, deleteKickSession);

// Weight & Height Tracking routes
router.route('/weight-tracking').post(jwtVerification, saveWeightEntry);
router.route('/weight-tracking').get(jwtVerification, getWeightHistory);
router.route('/weight-tracking/:entryId').delete(jwtVerification, deleteWeightEntry);

// BP Tracking routes
router.route('/bp-tracking').post(jwtVerification, saveBPEntry);
router.route('/bp-tracking').get(jwtVerification, getBPHistory);
router.route('/bp-tracking/:entryId').delete(jwtVerification, deleteBPEntry);

// Health Tips based on BP and BMI
router.route('/health-tips').get(jwtVerification, getHealthTips);

// Pregnancy Vaccine Tracker routes
router.route('/vaccines').post(jwtVerification, createVaccine);
router.route('/vaccines').get(jwtVerification, getPregnancyVaccineSchedule);
router.route('/vaccines/:vaccineId').delete(jwtVerification, deleteVaccine);
router.route('/vaccines/:vaccineId/complete').patch(jwtVerification, markVaccineCompleted);
router.route('/vaccines/:vaccineId/reset').patch(jwtVerification, resetVaccineStatus);
router.route('/vaccines/:vaccineId/upload-pdf').post(jwtVerification, upload.single('pdf'), uploadVaccinePDF);
router.route('/vaccines/:vaccineId/delete-pdf').delete(jwtVerification, deleteVaccinePDF);

export default router;
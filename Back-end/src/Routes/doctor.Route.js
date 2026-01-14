import { Router } from "express";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";
import { 
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
} from "../Controllers/doctor.controller.js";

const router = Router();

// Doctor routes
router.route('/dashboard').get(jwtVerification, getDoctorDashboard);
router.route('/patients').get(jwtVerification, getDoctorPatients);
router.route('/patients/:patientId').get(jwtVerification, getPatientDetails);
router.route('/patients/assign').post(jwtVerification, assignPatient);
router.route('/patients/:patientId/visit').post(jwtVerification, addPatientVisit);
router.route('/patients/:patientId/risk-flags').patch(jwtVerification, updateRiskFlags);

// Search and view mothers
router.route('/search-mothers').get(jwtVerification, searchMothers);
router.route('/mother/email/:email').get(jwtVerification, getMotherByEmail);

// Advice system
router.route('/advice/send').post(jwtVerification, sendAdviceToMother);
router.route('/advice/history').get(jwtVerification, getDoctorAdviceHistory);

// Appointments
router.route('/appointments').get(jwtVerification, getDoctorAppointments);
router.route('/appointments/create').post(jwtVerification, createAppointment);
router.route('/appointments/:appointmentId/status').patch(jwtVerification, updateAppointmentStatus);

// Messages
router.route('/messages/send').post(jwtVerification, sendMessage);

export default router;

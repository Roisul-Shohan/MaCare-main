import { Router } from "express";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";
import {
    getMidwifeDashboard,
    getAssignedMothers,
    getMotherDetailsByID,
    addHealthRecordUpdate,
    scheduleCheckup,
    getPendingCheckups,
    completeCheckup,
    assignMotherToMidwife
} from "../Controllers/midwife.controller.js";

const router = Router();

// All routes require authentication
router.use(jwtVerification);

// Dashboard
router.route("/dashboard").get(getMidwifeDashboard);

// Assigned Mothers
router.route("/mothers").get(getAssignedMothers);
router.route("/mothers/:motherID").get(getMotherDetailsByID);

// Health Record Updates
router.route("/mothers/:motherID/health-update").post(addHealthRecordUpdate);

// Checkup Management
router.route("/checkups/pending").get(getPendingCheckups);
router.route("/mothers/:motherID/schedule-checkup").post(scheduleCheckup);
router.route("/checkups/:checkupID/complete").patch(completeCheckup);

// Assignment (typically admin function)
router.route("/assign-mother").post(assignMotherToMidwife);

export default router;

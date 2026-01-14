import { Router } from "express";
import { jwtVerification } from "../Middleware/Authentication.Middleware.js";
import {
    getMidwifeDashboard,
    searchMothersByVillage,
    getMissedCheckups,
    getMotherDetails,
    createWeeklyCheckup,
    getMyCheckups
} from "../Controllers/midwife.controller.js";

const router = Router();

// All routes require authentication
router.use(jwtVerification);

// Dashboard
router.route("/dashboard").get(getMidwifeDashboard);

// Search mothers by village
router.route("/search-mothers").get(searchMothersByVillage);

// Get mothers who missed this week's checkup
router.route("/missed-checkups").get(getMissedCheckups);

// Get specific mother details
router.route("/mother/:motherID").get(getMotherDetails);

// Create weekly checkup for a mother
router.route("/mother/:motherID/checkup").post(createWeeklyCheckup);

// Get midwife's own checkup history
router.route("/my-checkups").get(getMyCheckups);

export default router;

const express = require("express");
const {
    loginController,
    registerController,
    workoutController,
    getUserDashboard,
    getWorkoutByDate,
} = require("../controllers/userController.js");

const verifyToken = require("../middleware/verifyToken.js");

// //router object
const router = express.Router();


//routers
// POST || LOGIN
router.post("/login", loginController);

// POST || REGISTER USER
router.post("/register", registerController);

router.get("/dashboard", verifyToken, getUserDashboard);
router.get("/workout", verifyToken, getWorkoutByDate);
router.post("/workout", verifyToken, workoutController);


module.exports = router;


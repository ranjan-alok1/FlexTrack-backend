const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const createError = require("../error");
const userModel = require("../models/userModel");
const workoutModel = require("../models/workoutModel");

dotenv.config();

//login callback
const loginController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });

        // Check if user exists
        if (!user) {
            return next(createError(404, "User not found"));
        }

        console.log(user);

        // Check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return next(createError(403, "Invalid password"));
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT, {
            expiresIn: "99 years",
        });

        // Return user object without sensitive information
        const { password: _, ...userWithoutPassword } = user.toObject();

        return res.status(200).json({ token, user: userWithoutPassword });
    } catch (error) {
        return next(error);
    }
};

//register callbackconst 
const registerController = async (req, res, next) => {
    try {
        const { email, password, name, img } = req.body;

        // Check if email is already registered
        const existingUser = await userModel.findOne({ email }).exec();

        if (existingUser) {
            return next(createError(409, "Email is already in use."));
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        // Create new user
        const createdUser = await userModel.create({
            email,
            password: hashedPassword, // Use hashed password
            name,
            img,
        });

        // Generate token
        const token = jwt.sign({ id: createdUser._id }, process.env.JWT, {
            expiresIn: "99 years",
        });

        return res.status(201).json({
            token,
            user: createdUser // Return the created user object
        });

    } catch (error) {
        console.error(error); // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: error.message,
            data: "error found"
        });
    }
};

const workoutController = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { workoutString } = req.body;

        if (!workoutString) {
            return next(createError(400, "Workout string is missing"));
        }

        // Split workoutString into lines
        const eachWorkout = workoutString.split("\n").map((line) => line.trim());
        const parsedWorkouts = [];
        let currentCategory = "";

        // Loop through each line to parse workout details
        for (let i = 0; i < eachWorkout.length; i++) {
            const line = eachWorkout[i];
            if (line.startsWith("#")) {
                // Line is a category (e.g., #Legs)
                currentCategory = line.substring(1).trim();
            } else if (line.startsWith("-")) {
                // Line contains workout details
                const workoutDetails = eachWorkout.slice(i, i + 4); // Get next four lines for workout details

                if (workoutDetails.length < 4) {
                    return next(createError(400, `Incomplete workout details for category "${currentCategory}"`));
                }

                const workoutName = workoutDetails[0].substring(1).trim(); // Remove leading "-"
                const setsReps = workoutDetails[1].trim();
                const weight = workoutDetails[2].trim();
                const duration = workoutDetails[3].trim();

                const sets = parseInt(setsReps.split("setsX")[0].trim());
                const reps = parseInt(setsReps.split("setsX")[1]?.split("reps")[0].trim());
                const parsedWeight = parseFloat(weight.split("kg")[0].trim());
                const parsedDuration = parseFloat(duration.split("min")[0].trim());

                parsedWorkouts.push({
                    user: userId,
                    category: currentCategory,
                    workoutName,
                    sets: isNaN(sets) ? 0 : sets,
                    reps: isNaN(reps) ? 0 : reps,
                    weight: isNaN(parsedWeight) ? 0 : parsedWeight,
                    duration: isNaN(parsedDuration) ? 0 : parsedDuration,
                    caloriesBurned: calculateCaloriesBurnt({ duration: parsedDuration, weight: parsedWeight })
                });

                i += 3; // Skip the next three lines since we already processed them
            } else {
                return next(createError(400, `Unexpected line format: "${line}"`));
            }
        }

        if (parsedWorkouts.length === 0) {
            return next(createError(400, "No valid workouts found"));
        }

        // Save each parsed workout to the database, allowing duplicates
        const savedWorkouts = await workoutModel.insertMany(parsedWorkouts, { ordered: false });

        return res.status(201).json({
            message: "Workouts added successfully",
            workouts: savedWorkouts
        });
    } catch (error) {
        console.error(error);
        return next(createError(500, error.message));
    }
};

const getUserDashboard = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return next(createError(400, "User ID is missing from the request."));
        }

        const user = await userModel.findById(userId);  // Corrected to userModel
        if (!user) {
            return next(createError(404, "User not found"));
        }

        const currentDate = new Date();
        const startToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

        // Calculate total calories burnt for today
        const totalCaloriesBurnt = await workoutModel.aggregate([
            { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
            { $group: { _id: null, totalCaloriesBurnt: { $sum: "$caloriesBurned" } } },
        ]);

        const totalWorkouts = await workoutModel.countDocuments({
            user: userId,
            date: { $gte: startToday, $lt: endToday },
        });

        const avgCaloriesBurntPerWorkout = totalWorkouts > 0
            ? (totalCaloriesBurnt[0]?.totalCaloriesBurnt || 0) / totalWorkouts
            : 0;

        const categoryCalories = await workoutModel.aggregate([
            { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
            { $group: { _id: "$category", totalCaloriesBurnt: { $sum: "$caloriesBurned" } } },
        ]);

        const pieChartData = categoryCalories.map((category, index) => ({
            id: index,
            value: category.totalCaloriesBurnt,
            label: category._id,
        }));

        const weeks = [];
        const caloriesBurnt = [];
        const daysData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
            weeks.push(`${date.getDate()}th`);

            const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

            daysData.push(
                workoutModel.aggregate([
                    { $match: { user: user._id, date: { $gte: startOfDay, $lt: endOfDay } } },
                    { $group: { _id: null, totalCaloriesBurnt: { $sum: "$caloriesBurned" } } },
                ])
            );
        }

        const weekData = await Promise.all(daysData);

        weekData.forEach((data, index) => {
            caloriesBurnt.push(data.length > 0 ? data[0].totalCaloriesBurnt : 0);
        });

        // Send the final JSON response
        return res.status(200).json({
            totalCaloriesBurnt: totalCaloriesBurnt.length > 0 ? totalCaloriesBurnt[0].totalCaloriesBurnt : 0,
            totalWorkouts,
            avgCaloriesBurntPerWorkout,
            totalWeeksCaloriesBurnt: {
                weeks,
                caloriesBurned: caloriesBurnt,
            },
            pieChartData,
        });
    } catch (err) {
        next(err);
    }
};


const getWorkoutByDate = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await userModel.findById(userId);  // Corrected to userModel
        if (!user) {
            return next(createError(404, "User not found"));
        }

        // Check if the query has a specific date or use the current date
        let date = req.query.date ? new Date(req.query.date) : new Date();

        // Define the start and end of the day for the date
        const startOfDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );
        const endOfDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate() + 1
        );

        // Query the database for workouts on that day for the current user
        const todaysWorkouts = await workoutModel.find({
            user: userId, // Corrected to match user field
            date: { $gte: startOfDay, $lt: endOfDay }, // Date range for the day
        });

        // Calculate the total calories burnt for the workouts of that day
        const totalCaloriesBurnt = todaysWorkouts.reduce(
            (total, workout) => total + workout.caloriesBurned,
            0
        );

        // Respond with the workouts of the day and total calories burnt
        return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
    } catch (err) {
        next(err); // Pass any errors to the error-handling middleware
    }
};

// Function to parse workout details from a line
const parseWorkoutLine = (parts) => {
    const details = {};
    console.log(parts);

    if (parts.length >= 5) {
        // Trim and extract workout details safely
        details.workoutName = parts[1].trim(); // No need for substring(1) as parts[1] already holds the workout name
        details.sets = parseInt(parts[2].split("sets")[0].trim()) || 0; // Added fallback for NaN
        details.reps = parseInt(parts[2].split("sets")[1]?.split("reps")[0].trim()) || 0; // Handling missing reps case
        details.weight = parseFloat(parts[3].split("kg")[0].trim()) || 0; // Added fallback for NaN
        details.duration = parseFloat(parts[4].split("min")[0].trim()) || 0; // Added fallback for NaN

        console.log(details);
        return details;
    }
    // If the line doesn't contain enough information, return null
    return null;
};


// Ensure calories are calculated correctly
const calculateCaloriesBurnt = (workoutDetails) => {
    const durationInMinutes = workoutDetails.duration || 0;
    const weightInKg = workoutDetails.weight || 0;
    const caloriesBurntPerMinute = 5;
    return (durationInMinutes * caloriesBurntPerMinute * (weightInKg / 10)).toFixed(2);
};



module.exports = {
    registerController,
    loginController,
    workoutController,
    getWorkoutByDate,
    getUserDashboard,
};
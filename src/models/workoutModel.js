const mongoose = require("mongoose");

//schema design
const WorkoutSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        workoutName: {
            type: String,
            required: true,
            unique: true,
        },
        sets: {
            type: Number,
        },
        reps: {
            type: Number,
        },
        weight: {
            type: Number,
        },
        duration: {
            type: Number,
        },
        caloriesBurned: {
            type: Number,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

//export
const workoutModel = mongoose.model("workout", WorkoutSchema);
module.exports = workoutModel;

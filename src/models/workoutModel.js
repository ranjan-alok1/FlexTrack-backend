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

// Add a compound unique index
WorkoutSchema.index({ user: 1, category: 1, workoutName: 1 }, { unique: true });

// Export the model
const workoutModel = mongoose.model("Workout", WorkoutSchema);
module.exports = workoutModel;

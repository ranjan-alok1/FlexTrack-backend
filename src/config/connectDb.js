const mongoose = require("mongoose");
const colors = require("colors");
//function to db connection
const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log(`Server Running On ${mongoose.connection.host} `.bgCyan.white);
    } catch (error) {
        console.log(`${error}`.bgRed);
    }
};

// export function to db connection
module.exports = connectDb;

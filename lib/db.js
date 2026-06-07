import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("*********mongo**************");
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("*********mongo**************");
    console.log(process.env.MONGO_URI);
    console.log(`Successfully connected to mongoDB 🥂`);
  } catch (error) {
    console.log("*********mongo error**************");

    console.error(`Error: ${error.message}`);
    console.log("*********mongo**************");

    process.exit(1);
  }
};

export default connectDB;
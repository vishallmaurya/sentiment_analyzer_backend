import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`\nMongoDb connected!! DB HOST : ${connectionInstance.connection}`);
    } catch (error) {
        console.log("MongoDB connection error: ", error);        
        process.exit(1);
    }
}


export default connectDB;
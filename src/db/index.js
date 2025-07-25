import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log("MongoDb connected",connectionInstance)
    }
    catch(error){
        console.log("Mongo only error");
        process.exit(1);
    }
}

export default connectDB ;
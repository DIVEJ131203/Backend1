import mongoose from "mongoose";

// DB Connection

const ConnectDB=async()=>{
    mongoose.connection.on('connected',()=>console.log("Database Connected"))
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
}

export default ConnectDB;
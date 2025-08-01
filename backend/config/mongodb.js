import mongoose from "mongoose";

//connectDB function to connect to the MongoDB database
//It uses the mongoose library to establish a connection to the database using the URI from the environment
const connectDB=  async ()=>{
   mongoose.connection.on('connected',()=>{
    console.log('DB connected')
   })
    await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)// Connect to the MongoDB database using the URI from the environment variable
}

export default connectDB;
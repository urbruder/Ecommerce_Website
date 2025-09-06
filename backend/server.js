import express from 'express' //express is a web framework for Node.js, it allows us to create a server and handle requests and responses easily
import cors from 'cors' //cors is used to allow cross-origin requests, which means it allows the frontend to access the backend from a different domain or port
import 'dotenv/config' //dotenv is used to access the environment variables from .env file like api keys, port numbers, etc.
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';



// App config
const app= express() //with this we can use express in our app
const port =process.env.PORT || 4000 // with this we can change the port number in .env file
connectDB()// connect to the MongoDB database using the connectDB function from mongodb.js

connectCloudinary()// connect to the Cloudinary service using the connectCloudinary function from cloudinary.js
//Middleware
app.use(express.json()) //Whatever request comes in, it will be converted to json
app.use(cors())// with this we can access the backend from any ip address

//API Endpoints

app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)

app.get('/',(req,res)=>{
  res.send('API WORKING')
})

app.listen(port,()=>console.log('server started on PORT :' + port))
import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
// This file is part of the backend controllers for user management in an e-commerce application.

// This function creates a JWT token for the user
// It takes the user ID as an argument and signs it with a secret key from the environment
const createToken=(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET)
}


//Route for user login
const loginUser = async(req,res)=>{
  try {
     const {email,password}=req.body;

    const user=await userModel.findOne({email})//Now if any user exists with the same email, it will stored in the exists variable
    if(!user){
        return res.json({success:false,message:"User does not exist"})
    }
    const isMatch= await bcrypt.compare(password,user.password);//Here the entered password is password 
    // and the user.password is the hashed password stored in the database. We are comparing the two passwords
    if(isMatch){
        const token=createToken(user._id)
        res.json({success:true,token})
    }
    else{
        res.json({success:false, message:"Invalid credentials"});
    }
  } catch (error) {
     console.log(error);
    res.json({success:false,message:error.message});
  }
}



//Route for user registration
const registerUser= async(req,res)=>{
try {
    const {name,email,password}=req.body;//Destructuring the request body to get name, email, and password
    //check if the user already exists or not
    const exists=await userModel.findOne({email})//Now if any user exists with the same email, it will stored in the exists variable
    if(exists){
        return res.json({success:false,message:"User Already Exists"})
    }

    //Here we will checking if the email is valid or not and password is strong or not
    if(!validator.isEmail(email)){
        return res.json({ success:false,message:"Please enter a valid email"})
    }
    if(password.length<8){
        return res.json({succes:false,message:"Please enter a strong password"})
    }
    // Hashing user password
    const salt= await bcrypt.genSalt(10)
    const hashedPassword= await bcrypt.hash(password,salt)
// Now we have username, email and hashed password, we can create a new user
   
    const newUser= new userModel({
        name,
        email,
        password:hashedPassword,
        cartData: {}
    })
    // after creating a new user, we will save it to the database
    const user= await newUser.save()//After saving the user, it will return the user object

    const token= createToken(user._id)//Creating a token for the user using the createToken function
    //Now we will send the response to the client
    
    res.json({success:true,token});//Sending the response with success status and token
    //The token will be used for authentication in the future requests

} catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
}
}


//Route for admin login
const adminLogin= async(req,res)=>{
try {
    const {email,password}=req.body
    if(email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD){
        const token=jwt.sign(email+password,process.env.JWT_SECRET);
        res.json({success:true,token});
    }
    else{
        res.json({success:false,message:"Wrong Credentials"});
    }
} catch (error) {
     console.log(error);
    res.json({success:false,message:error.message});
}
}

 export {loginUser,registerUser,adminLogin};
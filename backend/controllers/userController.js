import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import sendEmail from '../utils/sendEmail.js';
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
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // ✅ Proper JWT payload
      const token = jwt.sign(
        { email: process.env.ADMIN_EMAIL },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({ success: true, token });
    } else {
      return res.json({ success: false, message: "Wrong Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//------------------- Logic for forget password-----------------
const forgotPassword=async(req,res)=>{
try {
  const {email}=req.body;
  if(!email){
    return res.status(400).json(
      {
       message: "Email is required",
       success:false
  })
  }
  const newUser=await userModel.findOne({email});
  if(!newUser){
    return res.status(401).json({
      success:false,
      message:"User does not exist"
    })
  }

  const newToken=jwt.sign(
    {id:newUser._id},
    process.env.JWT_SECRET,
    {expiresIn: "10m"}
  )
   const resetLink = `${process.env.FRONTEND_URL}/reset-password/${newToken}`;
   //This is the message we want to mail along with the link   
   const html = `
      <h2>Password Reset</h2>
      <p>Click below to reset your password</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 10 minutes</p>
    `;
    
      await sendEmail(newUser.email, "Reset Password", html);
    
    res.json({ success: true });

} catch (error) {
  console.log("Error in logging in while resetting password: ",error);
    res.status(500).json({
      success:false,
      message:"Error while Logging in"
    })
}
}
// -------------Reset Password logic--------------
const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and password are required",
      });
    }

    // STEP 10: Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // STEP 11: Find user
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // STEP 11: Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Reset link expired",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid reset link",
    });
  }
};

 export {loginUser,registerUser,adminLogin,forgotPassword,resetPassword};
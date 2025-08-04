import express from 'express'
import { loginUser,registerUser,adminLogin } from '../controllers/userController.js'


const userRouter=express.Router()//creating a new router for user related routes

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

export default userRouter;
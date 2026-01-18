import express from 'express'
import { loginUser,registerUser,adminLogin, forgotPassword, resetPassword } from '../controllers/userController.js'


const userRouter=express.Router()//creating a new router for user related routes

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.post('/forgot-password',forgotPassword)
userRouter.post('/reset-password',resetPassword)

export default userRouter;
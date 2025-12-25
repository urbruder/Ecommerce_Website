import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import { adminLogin } from "../controllers/userController.js";

const adminRouter = express.Router();

// ADMIN LOGIN
adminRouter.post("/", adminLogin);

// VERIFY ADMIN TOKEN
adminRouter.get("/verify", adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin verified",
  });
});

export default adminRouter;
import express from "express";
import { listProduct,removeProduct,singleProduct,addProduct } from "../controllers/productController.js";
import upload from "../middleware/multer.js";



const productRouter=express.Router()//creating a new router for user related routes

productRouter.post('/add',upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]),addProduct);
productRouter.post('/remove',removeProduct);
productRouter.post('/single',singleProduct);
productRouter.get('/list',listProduct);//We use get method for listing products
//  as we are not sending any data to the server, we are just fetching the data from the server

export default productRouter;
import { v2 as cloudinary} from "cloudinary";
import productModel from "../models/productModel.js";
// Function for add product
const addProduct= async(req,res)=>{
 try {
    const {name,description,price,category,subCategory,sizes,bestseller}=req.body;
    //Here it will check that if image exists in the request body then only it will assign the value to image variable
    const image1=req.files.image1 && req.files.image1[0];// Accessing the uploaded files from the request
    const image2=req.files.image2 && req.files.image2[0];
    const image3=req.files.image3 && req.files.image3[0];
    const image4=req.files.image4 && req.files.image4[0];


    const images=[image1,image2,image3,image4].filter(image => image !== undefined);

    let imagesUrls= await Promise.all(
      images.map(async (item)=>{
           let result= await cloudinary.uploader.upload(item.path,{resource_type:"image"})
           return result.secure_url
      })
    )

  const productData={
   name,
   description,
   category,
   price: Number(price),
   sizes:JSON.parse(sizes),// Parsing sizes from JSON string to an object
   image:imagesUrls,
   date: Date.now(),
   subCategory,
   bestseller:Boolean(bestseller)
  }
  console.log(productData);

  const product=new productModel(productData);
  await product.save();

  res.json({success:true,message:"Product added"});

    res.json({});
    

 } catch (error) {
    console.log(error);
    res.json({success:false,message:error.message});
 }
}



// Function for list Product
const listProduct= async(req,res)=>{

}



// Function for remove product
const removeProduct= async(req,res)=>{

}



// Function for single product info
const singleProduct= async(req,res)=>{

}


export {addProduct,listProduct,removeProduct,singleProduct};
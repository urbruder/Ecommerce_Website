import mongoose from "mongoose";


const userSchema= new mongoose.Schema({
    name:{ type:String,required:true},
    password:{ type:String,required:true},
    email:{ type:String,required:true,unique:true},//If  a user has created with this email, they cannot create another user 
    // with the same email
    cartData:{type:Object,default:{}}//Whenever a new user is created, the cartData will be an empty object.
    //  If the user adds something to the cart, it will be updated
},{minimize:false})//Whenever we create a new user, the cartData will be an empty object. 
// If we don't use this option, mongoose will remove the empty object from the schema and we won't be able to add anything to the cart later.

const userModel=mongoose.models.user || mongoose.model("user",userSchema);

export default userModel;

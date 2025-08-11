import multer from "multer";

// Configure multer storage
// This is where the uploaded files will be stored
const storage=multer.diskStorage({
    filename:function(req,file,callback){
        callback(null,file.originalname)
    }
})

const upload =multer({storage})//The filename mentioned above should be storage if we are writing storage here.

export default upload;
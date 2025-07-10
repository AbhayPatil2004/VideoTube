import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({
    cloud_name: process.CLOUDINARY_CLOUD_NAME,
    api_key: process.CLOUDINARY_API_KEY,
    api_secret: process.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async ( localFilePath ) =>{
    try{
        if( !localFilePath ) return null 
        const response = await cloudinary.uploader.upload(
            localFilePath ,{
                resource_type : "auto"
            }

        )
        console.log("File upload succesful",response.url)
        fs.readFileSync.unlinkSync(localFilePath);
        return response 
    }
    catch(error){
        fs.readFileSync.unlinkSync(localFilePath);
        return null 
    }
}

export { uploadOnCloudinary}
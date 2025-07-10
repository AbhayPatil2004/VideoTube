import { asyncHandler } from "../utils/ayncHandler";
import {ApiError} from "../utils/ApiError.js"
import { User} from '../models/user.models.js'
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async( req , res ) =>{
    // TODO
    const { fullName , email , username , password } = req.body

    if( 
        [fullName,email,username,password].some((field) => field?.trim() === "")
     ){
    }
    
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    
    if( existedUser ){
        throw new ApiError( 400 , "User with this email or username already Exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if( !avatarLocalPath ){
        throw new ApiError( 400 , "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if( !createUser ){
        throw new ApiError( 400 , "Something went Wrong");
    }

    return res
    .status(201)
    .json( new ApiResponse(200 , createUser , "User register Succesfully"));
})  

export {
    registerUser
}
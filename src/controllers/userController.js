import { asyncHandler } from "../utils/ayncHandler";
import {ApiError} from "../utils/ApiError.js"
import { User} from '../models/user.models.js'
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse.js";

const genrateAccessAndRefereshToken = async ( userId ) =>{
    const user = await User.findById(userId);
    // 
    if( !user ){
        throw new ApiError(400 , "User not found");
    }

    const accessToken = user.genrateAccessToken()
    const refreshToken = user.genrateRefreshToken()

    try{
        user.refreshToken = refreshToken 
        await user.save( {validateBeforeSave : false })
        return { accessToken , refreshToken }
    }
    catch(error){
        throw new ApiError( 500 , "Error Genrated");
    }
}

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

const loginUser = asyncHandler( async ( req , res ) => {

    const { email , username , password } = req.body;

    if( !email ){
        throw new ApiError(400 , "Email is requried");
    }

    const user = await User.findOne({
        $or : ( {username} , {email})
    })

    if( !user ){
        throw new ApiError( 400 , "User not Found");
    }

    const isPasswordValid = await user.isPasswordCorrect( password )

    if( !isPasswordValid ){
        throw new ApiError(400 , "Invalid credentials");
    }

    const {accessToken,refreshToken} = await genrateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select( "-password -refreshToken");

    if( !loggedInUser ){
        throw ApiError("400" , "User Not found")
    }

    const options = {
        httpOnly : true ,
        secure : process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken" , accessToken , options )
        .cookie("refreshToken" , refreshToken , options )
        .json(
            new ApiResponse( 
                200 ,
                { user : loggedInUser , accessToken , refreshToken },
                "User loagged in succesfully"
            )
        )

})

const refreshAccessToken = asyncHandler( async ( req , res ) => {

    const incomingRefreshToken = req.cookies.refreshToken ||
    req.body.refreshToken 

    if( !incomingRefreshToken ){
        throw new ApiError( 400 , "Refresh Token is requried ");
    }
})

export {
    registerUser,
    loginUser
}
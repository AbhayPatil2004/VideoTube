import { asyncHandler } from "../utils/ayncHandler";
import { ApiError } from "../utils/ApiError.js"
import { user, User } from '../models/user.models.js'
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "jsonwebtoken";
import mongoose from "mongoose";

const genrateAccessAndRefereshToken = async (userId) => {
    const user = await User.findById(userId);
    // 
    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const accessToken = user.genrateAccessToken()
    const refreshToken = user.genrateRefreshToken()

    try {
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Error Genrated");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // TODO
    const { fullName, email, username, password } = req.body

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User with this email or username already Exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverLocalPath)

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createUser) {
        throw new ApiError(400, "Something went Wrong");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createUser, "User register Succesfully"));
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is requried");
    }

    const user = await User.findOne({
        $or: ({ username }, { email })
    })

    if (!user) {
        throw new ApiError(400, "User not Found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefereshToken(user._id)

    const loggedInUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!loggedInUser) {
        throw ApiError("400", "User Not found")
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User loagged in succesfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out succesfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken ||
        req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh Token is requried ");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (user.refreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        const { accessToken, refreshToken: newRefreshToken } = await genrateAccessAndRefereshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "Access Token refreshed SuccessFully"
                ))
    }
    catch (error) {
        throw new ApiError(401, "Error Occured");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req, user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "invalid Password ")
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Succesfuly"));
})

const getCurrentuser = asyncHandler(async (req, res) => {
    return
    res.status(200)
        .json(new ApiResponse(200, req.user, "Current user detail"));
})

const updateAccountDetail = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body

    if (!fullname) {
        throw new ApiError(400, "Fullname are requried")
    }
    if (!email) {
        throw new ApiError(400, "email are requried")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email: email
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account detail updated succesfully"));
})

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Files is requroed ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Someting went Worong ")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res
        .status(200)
        .json( new ApiResponse(200 , user , "Avatar updated "))
})

const updateUserCoverimage = asyncHandler(async (req, res) => {

    const coverImageLocalPath = req.file?.path

    if( !coverImageLocalPath ){
        throw new ApiError(400, "File is requried")
    }
    
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    if( !coverImage ){
        throw new ApiError(400, "Someting went wrong")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {
            new : true 
        }
    ).select(-password -refreshToken)

    return res
        .status(200)
        .json( new ApiResponse( 200 , user , "Update succesfull" ))
})

const getUserChannelProfle = asyncHandler( async(req,res) => {

    const {username} = req.params

    if( !username?.trim() ){
        throw new ApiError(400,"User is Requried");
    }

    const channel = await User.aggregate(
        [
            {
                $match:{
                    username : username?.toLowerCase()
                }
            },
            {
                $lookup:{
                    form : "subscription",
                    loaclField : "_id",
                    foreignField :"channel",
                    as : "subscribers"
                }
            },
            {
                $lookup:{
                    from :"susubscription",
                    loaclField : "_id",
                    foreignField : "subscriber",
                    as : "subscribedTo"
                }
            },
            {
                $addField:{
                    subscriberCount :{
                        $size :"$subscribers"
                    },
                    channelSubscribedToCount:{
                        $size:"$subscribedTo"
                    },
                    isSubscribed:{
                        $cond:{
                            if:{$in:[req.user?._id,"$subscriber.subscriber"]},
                            then:true ,
                            else :false 
                        }
                    }
                }
            },
            {
                $project:{
                    fullname : 1 ,
                    username : 1 ,
                    avatar : 1 ,
                    subscriberCount : 1 ,
                    channelSubscribedToCount : 1 ,
                    isSubscribed : 1 ,
                    coverImage : 1 ,
                    email : 1 
                }
            }

        ]
    )

    if( !channel){
        throw new ApiError( 200 , "Channel Not Found");
    }

    return res
        .status(200)
        .josn( new ApiResponse( 200 , channel[0] , "Channel profile fetch Succesfully"));
})

const getwatchHistory = asyncHandler( async( req , res ) =>{

    const user = await User.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                $lookup:{
                    from :"videos",
                    loaclField:"watchHistory",
                    foreignField:"_id",
                    as : "watchHistory",
                    pipeline:[
                        {
                            $lookup:{
                                from : "users",
                                loaclField :"owner",
                                foreignField:"_id",
                                as :"owner",
                                pipeline:[
                                    {
                                        $project:{
                                            fullname : 1,
                                            username : 1,
                                            avatar : 1 
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addField:{
                                owner : {
                                    $first:"$owner"
                                }
                            }
                        }
                    ]
                }
            }
        ]
    )

    if( !user ){
        throw new ApiError(200,"User not found")
    }

    return res
        .status(200)
        .json( 200 , user[0]?.watchHistory , "watch histiry");
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverimage,
    getUserChannelProfle,
    getwatchHistory 
}
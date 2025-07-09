// id string pk
// username string 
// email string 
// fullname string 
// avatar string 
// coverImage string 
// watchHistory ObjectId[] videos
// password string 
// refreshToken string 
// createdAt Date
// updatedAt Date

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema(
    {
        username: {
            type: String,
            requried: true,
            unique: true,
            lowercse: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            requried: true,
            unique: true,
            lowercse: true,
            trim: true,
        },
        fullname: {
            type: String,
            requried: true,
            trims: true,
            index: true
        },
        avatar: {
            type: String,
            requried: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            requried: [true, "password is requried"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {

    if (this.modified("password")) return next()

    this.password = bcrypt.hash(this.password, 10)

    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.genrateAccessToken = function () {
    return jwy.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresin : process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.genrateRefreshToken = function () {
    return jwy.sign(
        {
            _id : this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresin : process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const user = mongoose.model("User", userSchema);

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

import mongoose ,{Schema} from "mongoose";

const userSchema = new Schema(
    {
        username :{
            type : String ,
            requried : true ,
            unique: true ,
            lowercse : true ,
            trim : true ,
            index : true 
        },
        email :{
            type : String ,
            requried : true ,
            unique: true ,
            lowercse : true ,
            trim : true ,
        },
        fullname :{
            type : String ,
            requried : true ,
            trims : true ,
            index : true 
        },
        avatar :{
            type : String ,
            requried : true
        },
        coverImage :{
            type : String 
        },
        watchHistory :[
            {
                type : Schema.Types.ObjectId,
                ref : "Video"
            }
        ],
        password :{
            type : String ,
            requried : [true,"password is requried"]
        },
        refreshToken:{
            type : String 
        }
    },
    { timestamps : true }
)

export const user = mongoose.model("User",userSchema);

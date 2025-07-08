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

const videoSchema = new Schema(
    {
        videoFile :{
            type :Stirng ,
            required : true,
        },
        thumbnail :{
            type :Stirng ,
            required : true,
        },
        
        itle :{
            type :Stirng ,
            required : true,
        },
        description:{
            type :Stirng ,
            required : true 
        },
        views :{
            true : Number,
            default : 0 
        },
        duration :{
            true : Number,
            required : true 
        },
        isPublished :{
            type : Boolean ,
            default : true 
        },
        owner :{
            type :Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps:true}
)
    

export const Video = mongoose.model("Video",videoSchema);

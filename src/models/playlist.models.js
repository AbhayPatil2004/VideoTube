import mongoose, { Schema } from "mongoose";

const playListSchema = new Schema(
    {
        name :{
            type : String ,
            requried: true 
        },
        description :{
             type : String ,
            requried: true 
        },
        videos :[
            {
                type : Schema.Types.ObjectId ,
                ref : "Video"
            }
        ],
        owner:{
            type : Schema.types.ObjectId ,
            ref : "User"
        }
    },
    {
        timestamps : true 
    }
)

export const PlayList = mongoose.model("PlayList",playListSchema);
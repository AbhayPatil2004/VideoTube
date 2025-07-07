import express from 'express'
import cors from "cors"


const app = express() 

app.use(
    cors({
        origin : process.env.CORS_ORIGIN,
        credentials : true 
    })
)

// comman middleware
app.use(express.json({limlt:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

// import route

import healthcheckRoute from "./routes/healthcheckRoute.js"

app.use("/api/v1/healthcheck",healthcheckRoute)


export { app }
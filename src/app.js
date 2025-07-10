import express from 'express'
import cors from "cors"
import cookieParser from 'cookie-parser'

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
import userRouter from "./routes/user.routes.js"
import { errorHandler } from './middlewares/error.middleware.js'

app.use("/api/v1/healthcheck",healthcheckRoute)
app.use("/api/v1/users",userRouter)

app.use(errorHandler)
export { app }
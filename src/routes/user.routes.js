import { Router } from "express";

import { registerUser } from "../controlrs/userController";
import { upload } from "../middlewares/multer.middleware";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name :"avatar",
            maxCount : 1
        },
        {
            name :"coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)

export default router
import { Router } from "express";

import { registerUser } from "../controlrs/userController";
import { upload } from "../middlewares/multer.middleware";
import { verifyJWT } from "../middlewares/auth.middleware";
import { registerUser , logoutUser} from "../controllers/userController";

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

// secured route
router.route("/logout").post( verifyJWT , logoutUser)


export default router
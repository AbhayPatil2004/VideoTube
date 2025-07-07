import { Router } from "express" ;
import  healthcheck  from "../controllers/healthcheckController.js";

const router = Router()

router.route("/").get(healthcheck)

export default router ;
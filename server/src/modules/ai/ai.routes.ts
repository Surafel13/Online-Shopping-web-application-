import Router from "express"
import { aiController } from "./ai.controller.js"

const router = Router()


router.get("/", 
    aiController.analyzeProducts
)

export default router
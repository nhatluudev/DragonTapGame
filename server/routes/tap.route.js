import express from "express"
import { asyncHandler } from "../utils/handler.js"
import TapController from "../controllers/tap.controller.js"
const tapRouter = express.Router()

tapRouter.get("/readUserTokens/:telegramId", asyncHandler(TapController.readUserTokens))
tapRouter.post("/tap", asyncHandler(TapController.tap))

export default tapRouter;
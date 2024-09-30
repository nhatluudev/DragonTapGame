import express from "express"
import { asyncHandler } from "../utils/handler.js"
import UserController from "../controllers/user.controller.js"
import TapController from "../controllers/user.controller.js"
const userRouter = express.Router()

// Route to create or fetch user
userRouter.get("/checkLoginStatus/:telegramId", asyncHandler(UserController.checkLoginStatus))
userRouter.get('/tenMinCheckInStatus/:telegramId', asyncHandler(UserController.getTenMinCheckInStatus));

// Fetch sorted leaderboard (based on user tokens)
userRouter.get('/leaderboard', UserController.getLeaderboard);

userRouter.post('/createOrFetchUser', asyncHandler(TapController.createOrFetchUser));
userRouter.post("/getLoginReward", asyncHandler(UserController.getLoginReward))
userRouter.post("/tenMinCheckIn", asyncHandler(UserController.tenMinCheckIn))
userRouter.post("/checkMemberStatus", asyncHandler(UserController.checkMemberStatus))
userRouter.post("/startMission", asyncHandler(UserController.startMission))
userRouter.post("/checkMission", asyncHandler(UserController.checkMission))
userRouter.post("/rewardMission", asyncHandler(UserController.rewardMission))

userRouter.post("/recordReferral", asyncHandler(UserController.recordReferral))

export default userRouter;
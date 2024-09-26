import express from 'express';
import tapRouter from "./tap.route.js"
import userRouter from "./user.route.js"
const router = express.Router()

//Check Permission
router.use('/api/taps', tapRouter)
router.use('/api/users', userRouter)

export default router
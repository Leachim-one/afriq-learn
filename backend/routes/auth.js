import express from 'express'
import { signUp, signIn, saveProfile, updateStreak, getMe, updateProfile, forgotPassword, verifyResetOtp, resetPassword } from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.post('/signup', signUp)
router.post('/signin', signIn)
router.post('/profile', protect, saveProfile)
router.post('/streak', protect, updateStreak)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-otp', verifyResetOtp)
router.post('/reset-password', resetPassword)

export default router
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendEmail, isValidEmailFormat, hasMxRecord } from '../utils/sendEmail.js'
import { welcomeEmail } from '../utils/emailTemplates.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

const publicUser = (u) => ({
  id: u._id,
  fullName: u.fullName,
  email: u.email,
  isProfileComplete: u.isProfileComplete,
})

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password } = req.body

    if (!fullName?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: 'All fields are required' })

    if (!isValidEmailFormat(email))
      return res.status(400).json({ message: 'Please enter a valid email address' })

    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    // Real-email check: domain must accept mail
        // Real-email check: domain must accept mail (skip if we can't verify)
    const deliverable = await hasMxRecord(email)
    if (deliverable === false)
      return res.status(400).json({ message: 'That email domain does not exist. Please use a real email address.' })
    
    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) return res.status(400).json({ message: 'An account with this email already exists' })

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({ fullName: fullName.trim(), email: normalizedEmail, password: hashedPassword })

    // Fire-and-forget welcome email (don't block signup if email fails)
    sendEmail({ to: user.email, subject: 'Welcome to Afriq Learn! 🎉', html: welcomeEmail(user.fullName) })
      .catch((err) => console.error('Welcome email failed:', err.message))

    res.status(201).json({ token: signToken(user._id), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email?.toLowerCase().trim() })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    res.status(200).json({ token: signToken(user._id), user: publicUser(user) })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Onboarding profile (ProfilingPage)
export const saveProfile = async (req, res) => {
  try {
    const { displayName, preferredLanguage, skillLevel, learningPace } = req.body
    await User.findByIdAndUpdate(req.userId, {
      fullName: displayName || req.body.fullName,
      preferredLanguage,
      skillLevel,
      learningPace,
      isProfileComplete: true,
    })
    res.status(200).json({ message: 'Profile saved!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// #5 — Get the full current user for the Profile page
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.status(200).json({ user })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// #5 / #6 — Update editable profile fields + notification preference
export const updateProfile = async (req, res) => {
  try {
    const { fullName, preferredLanguage, skillLevel, learningPace, profilePicture, notificationsEnabled } = req.body
    const updates = {}
    if (fullName !== undefined) updates.fullName = fullName.trim()
    if (preferredLanguage !== undefined) updates.preferredLanguage = preferredLanguage
    if (skillLevel !== undefined) updates.skillLevel = skillLevel
    if (learningPace !== undefined) updates.learningPace = learningPace
    if (profilePicture !== undefined) updates.profilePicture = profilePicture
    if (notificationsEnabled !== undefined) updates.notificationsEnabled = notificationsEnabled

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password')
    res.status(200).json({ user, message: 'Profile updated successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const updateStreak = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const today = new Date().toISOString().split('T')[0]
    if (user.lastActiveDate === today) return res.status(200).json({ streak: user.streak })

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    user.streak = user.lastActiveDate === yesterdayStr ? user.streak + 1 : 1
    user.lastActiveDate = today
    await user.save()
    res.status(200).json({ streak: user.streak })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
// ---- Forgot Password (OTP via email) ----

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email?.trim()) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    // Always respond success to prevent email enumeration
    if (!user) return res.status(200).json({ message: 'If that email exists, a code was sent.' })

    const otp = generateOtp()
    const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    user.resetOtp = otp
    user.resetOtpExpiry = expiry
    await user.save()

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0f1115;color:#e7e9ee;border-radius:16px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
          <div style="width:36px;height:36px;border-radius:10px;background:#25a267;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">AL</div>
          <strong style="font-size:18px">Afriq Learn</strong>
        </div>
        <h1 style="font-size:22px;margin:0 0 12px">Reset your password</h1>
        <p style="line-height:1.6;color:#c2c6cf">Hi ${user.fullName},</p>
        <p style="line-height:1.6;color:#c2c6cf">We received a request to reset your password. Use the code below — it expires in 15 minutes.</p>
        <div style="margin:28px 0;text-align:center">
          <div style="display:inline-block;background:#1a2a1f;border:2px solid #25a267;border-radius:14px;padding:20px 40px">
            <span style="font-size:36px;font-weight:900;letter-spacing:10px;color:#25a267">${otp}</span>
          </div>
        </div>
        <p style="line-height:1.6;color:#c2c6cf">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
        <p style="margin-top:32px;font-size:12px;color:#8b909a">You're receiving this because you have an Afriq Learn account.</p>
      </div>`

    await sendEmail({ to: user.email, subject: 'Your Afriq Learn password reset code', html })
    res.status(200).json({ message: 'Reset code sent!' })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !user.resetOtp) return res.status(400).json({ message: 'Invalid or expired code.' })

    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Incorrect code. Please try again.' })
    if (new Date() > user.resetOtpExpiry) return res.status(400).json({ message: 'This code has expired. Please request a new one.' })

    res.status(200).json({ message: 'Code verified!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' })
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user || !user.resetOtp) return res.status(400).json({ message: 'Invalid or expired code.' })
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid code.' })
    if (new Date() > user.resetOtpExpiry) return res.status(400).json({ message: 'Code has expired. Please request a new one.' })

    user.password = await bcrypt.hash(newPassword, 12)
    user.resetOtp = ''
    user.resetOtpExpiry = null
    await user.save()

    res.status(200).json({ message: 'Password reset successfully!' })
  } catch (error) {
    res.status(500).json({ message: 'Server error. Please try again.' })
  }
}

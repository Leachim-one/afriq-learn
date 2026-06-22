import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false },
  profilePicture: { type: String, default: '' },
  preferredLanguage: { type: String, default: '' },
  skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  learningPace: { type: String, enum: ['Slow', 'Normal', 'Fast'], default: 'Normal' },
  isProfileComplete: { type: Boolean, default: false },
  googleId: { type: String, default: '' },
  currentRoadmap: { type: Object, default: null },
  roadmaps: [
    {
      id: String,
      title: String,
      description: String,
      nodes: [Object],
      createdAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: false }
    }
  ],
  quizResults: [
    {
      topic: String,
      difficulty: String,
      score: Number,
      total: Number,
      passed: Boolean,
      questions: [Object],   
      answers: [Object],     
      timeTaken: Number,     
      takenAt: Date
    }
  ],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
  notificationsEnabled: { type: Boolean, default: true },
  lastReminderSent: { type: String, default: '' },
  resetOtp: { type: String, default: '' },
  resetOtpExpiry: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.model('User', userSchema)

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'

import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import { startInactivityReminders } from './utils/inactivityReminder.js'

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected:', mongoose.connection.host)
    startInactivityReminders() // #6 start the scheduler once DB is ready
  })
  .catch(err => console.log('❌ MongoDB Error:', err))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`))
export default app
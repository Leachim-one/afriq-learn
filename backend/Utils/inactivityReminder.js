import cron from 'node-cron'
import User from '../models/User.js'
import { sendEmail } from './sendEmail.js'
import { reminderEmail } from './emailTemplates.js'

const DAYS_INACTIVE = 3

export const startInactivityReminders = () => {
  // Runs every day at 09:00 server time
  cron.schedule('0 9 * * *', async () => {
    try {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - DAYS_INACTIVE)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      const today = new Date().toISOString().split('T')[0]

      const users = await User.find({ notificationsEnabled: true, lastActiveDate: { $ne: '' } })

      for (const user of users) {
        if (user.lastActiveDate <= cutoffStr && user.lastReminderSent !== today) {
          await sendEmail({
            to: user.email,
            subject: 'We miss you at Afriq Learn 👋',
            html: reminderEmail(user.fullName, user.streak),
          }).catch((e) => console.error('Reminder failed for', user.email, e.message))

          user.lastReminderSent = today
          await user.save()
        }
      }
      console.log('✅ Inactivity reminders processed')
    } catch (e) {
      console.error('Inactivity reminder job error:', e.message)
    }
  })
}
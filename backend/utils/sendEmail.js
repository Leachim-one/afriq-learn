import { Resend } from 'resend'
import dns from 'dns/promises'

const resend = new Resend(process.env.RESEND_API_KEY)

export const isValidEmailFormat = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const hasMxRecord = async (email) => {
  try {
    const domain = email.split('@')[1]
    const records = await dns.resolveMx(domain)
    return Array.isArray(records) && records.length > 0
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') return false
    console.warn('MX lookup skipped:', err.code || err.message)
    return null
  }
}

export const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from: 'Afriq Learn <onboarding@resend.dev>',
    to,
    subject,
    html,
  })
  if (error) throw new Error(error.message)
  return data
}
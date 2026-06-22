import nodemailer from 'nodemailer'
import dns from 'dns/promises'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const isValidEmailFormat = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Returns: true = deliverable, false = definitely no mail server,
// null = couldn't check (network/DNS issue) -> treat as OK
export const hasMxRecord = async (email) => {
  try {
    const domain = email.split('@')[1]
    const records = await dns.resolveMx(domain)
    return Array.isArray(records) && records.length > 0
  } catch (err) {
    // ENOTFOUND / ENODATA = domain truly has no mail server
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') return false
    // Any other error (timeout, blocked DNS, etc.) -> can't verify, don't block
    console.warn('MX lookup skipped:', err.code || err.message)
    return null
  }
}

export const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: `"Afriq Learn" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}
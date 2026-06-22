const wrap = (inner) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0f1115;color:#e7e9ee;border-radius:16px">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      <div style="width:36px;height:36px;border-radius:10px;background:#25a267;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700">AL</div>
      <strong style="font-size:18px">Afriq Learn</strong>
    </div>
    ${inner}
    <p style="margin-top:32px;font-size:12px;color:#8b909a">You're receiving this because you have an Afriq Learn account.</p>
  </div>`

export const welcomeEmail = (name) =>
  wrap(`
    <h1 style="font-size:22px;margin:0 0 12px">Welcome aboard, ${name}! 🎉</h1>
    <p style="line-height:1.6;color:#c2c6cf">
      Your account is ready. Tell us your goals and we'll build a personalised learning roadmap just for you.
    </p>
    <a href="${process.env.CLIENT_URL}/profiling"
       style="display:inline-block;margin-top:20px;background:#25a267;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">
       Build my roadmap →
    </a>`)

export const reminderEmail = (name, streak) =>
  wrap(`
    <h1 style="font-size:22px;margin:0 0 12px">We miss you, ${name} 👋</h1>
    <p style="line-height:1.6;color:#c2c6cf">
      You haven't studied in a few days${streak ? ` — your ${streak}-day streak is at risk!` : ''}.
      Jump back in and keep the momentum going.
    </p>
    <a href="${process.env.CLIENT_URL}/dashboard"
       style="display:inline-block;margin-top:20px;background:#25a267;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600">
       Continue learning →
    </a>`)
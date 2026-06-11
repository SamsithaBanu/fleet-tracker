import logger from "../utils/logger.js";
import nodemailer from "nodemailer";

let transporter = null;

const initEmail =()=>{
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if(!user || !pass){
        logger.warn("Email credentials are not set. Email notifications will be disabled.");
        return null;
    }

    try{
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {user, pass},
        })

        //verify connection
        transporter.verify((err)=>{
            if(err){
                logger.error('Error verifying email transporter', err.message);
                transporter = null;
            }else{
                logger.success('Email transporter verified and ready to send emails');
            }
        })
    } catch(error){
        logger.error("Error initializing email transporter", error.message);
    }
}

// Send any email
const sendEmail = async (to, subject, html) => {
  if (!transporter) {
    logger.warn(`Email (dev mode) → ${to}: ${subject}`)
    return { success: true, dev: true }
  }

  try {
    const result = await transporter.sendMail({
      from: `"QuickDeliver" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    logger.success(`Email sent → ${to} [${result.messageId}]`)
    return { success: true, messageId: result.messageId }

  } catch (err) {
    logger.error(`Email failed → ${to}:`, err.message)
    return { success: false, error: err.message }
  }
}
// Daily summary email to admin
const sendDailySummaryEmail = async (stats) => {
  const html = `
    <div style="font-family:sans-serif;max-width:500px;margin:0 auto">
      <h2 style="color:#16a34a">QuickDeliver — Daily Summary</h2>
      <p style="color:#666">${new Date().toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
      })}</p>

      <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:16px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;color:#374151">Total orders</td>
            <td style="padding:8px 0;font-weight:600;text-align:right">
              ${stats.totalOrders}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151">Delivered</td>
            <td style="padding:8px 0;font-weight:600;color:#16a34a;text-align:right">
              ${stats.delivered}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151">Failed</td>
            <td style="padding:8px 0;font-weight:600;color:#dc2626;text-align:right">
              ${stats.failed}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151">Success rate</td>
            <td style="padding:8px 0;font-weight:600;text-align:right">
              ${stats.successRate}%
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#374151">Active drivers</td>
            <td style="padding:8px 0;font-weight:600;text-align:right">
              ${stats.activeDrivers}
            </td>
          </tr>
        </table>
      </div>

      <p style="color:#9ca3af;font-size:12px">
        QuickDeliver Bangalore · Automated daily report
      </p>
    </div>
  `

  return sendEmail(
    process.env.ADMIN_EMAIL,
    `QuickDeliver Daily Report — ${new Date().toLocaleDateString('en-IN')}`,
    html
  )
}

export {initEmail, sendEmail, sendDailySummaryEmail};
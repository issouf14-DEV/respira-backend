const nodemailer = require('nodemailer');

// Export CommonJS Netlify function
exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  // Test mode: when set, function won't call external providers.
  const TEST_MODE = process.env.TEST_EMAIL_MODE === 'true';

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid JSON body' })
    };
  }

  const { to, subject, body, type } = payload || {};

  // Basic validation
  if (!to || !subject || !body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Missing required fields: to, subject, body' })
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Invalid email address' })
    };
  }

  try {
    // Prefer SendGrid if API key present
    if (process.env.SENDGRID_API_KEY) {
      // Lazy require so code still works when package not installed in some envs
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      if (TEST_MODE) {
        // Simulate success
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, provider: 'sendgrid', message: 'TEST_MODE - simulated send' })
        };
      }

      const from = process.env.SENDGRID_FROM_EMAIL;
      if (!from) throw new Error('SENDGRID_FROM_EMAIL not set');

      const msg = {
        to,
        from,
        subject,
        text: body,
        html: `<div style="font-family: Arial, sans-serif;">${body}</div>`
      };

      const result = await sgMail.send(msg);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, provider: 'sendgrid', result })
      };
    }

    // Fallback to Nodemailer (SMTP). Read config from env vars.
    if (TEST_MODE) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, provider: 'nodemailer', message: 'TEST_MODE - simulated send' })
      };
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
    const smtpSecure = process.env.SMTP_SECURE === 'true';

    let transporter;
    if (smtpHost && smtpPort && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Simple Gmail-like transport using service
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      throw new Error('No email provider configured (set SENDGRID_API_KEY or SMTP_* / EMAIL_USER & EMAIL_PASS)');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text: body,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background:#dc2626;color:white;padding:16px;border-radius:6px;">🚗 GBA - Notification</div>
          <div style="padding:16px;border:1px solid #eee;">${body}</div>
          <div style="font-size:12px;color:#666;padding:8px;">Email automatique</div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, provider: 'nodemailer', messageId: info.messageId })
    };

  } catch (error) {
    console.error('Error sending email:', error && error.message ? error.message : error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || String(error) })
    };
  }
};

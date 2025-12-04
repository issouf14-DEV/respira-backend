const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Gérer les requêtes OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { to, subject, body, type } = JSON.parse(event.body);

    // Configuration du transporteur email
    // Utilise les variables d'environnement Netlify
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'gba.notifications@gmail.com',
        pass: process.env.EMAIL_PASS || 'votre-mot-de-passe-app'
      }
    });

    // Configuration de l'email
    const mailOptions = {
      from: `"GBA Notifications" <${process.env.EMAIL_USER || 'gba.notifications@gmail.com'}>`,
      to: to,
      subject: subject,
      text: body,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1>🚗 GBA - Location de Véhicules</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #dee2e6;">
            <pre style="font-family: Arial, sans-serif; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${body}</pre>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>📧 Email automatique du système GBA</p>
            <p>📞 Support : 05 03 71 31 15 | 🌐 www.gba-location.com</p>
          </div>
        </div>
      `
    };

    // Envoyer l'email
    const result = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email envoyé avec succès',
        messageId: result.messageId,
        type: type,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Erreur envoi email:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erreur lors de l\'envoi de l\'email',
        details: error.message
      })
    };
  }
};
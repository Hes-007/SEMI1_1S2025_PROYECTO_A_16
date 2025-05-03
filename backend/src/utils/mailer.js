const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear un transportador
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // con Google Gmail y su SMTPP
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    // Credenciales generadas para la aplicación (no del propio correo)
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Enviar una notificación por correo electrónico para la cancelación de una cita
 * @param {Object} options - Opciones de correo electrónico
 * @param {string} options.to - Correo electrónico del destinatario
 * @param {string} options.patientName - Nombre del paciente
 * @param {string} options.doctorName - Nombre del médico
 * @param {string} options.date - Fecha de la cita
 * @param {string} options.time - Hora de la cita
 * @param {string} options.reason - Motivo de la cancelación
 * @returns {Promise<boolean>} - Verdadero si el correo electrónico se envió correctamente
 */
const sendCancellationEmail = async ({ to, patientName, doctorName, date, time, reason }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Cita médica cancelada - SaludPlus',
      // HTML fumado con IA (que pereza hacer esta onda a mano)
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #3a3a3a;">Notificación de cancelación de cita</h2>
          <p>Estimado/a <strong>${patientName}</strong>,</p>
          <p>Le informamos que su cita con el/la Dr(a). <strong>${doctorName}</strong> ha sido cancelada.</p>
          <div style="background-color: #f8f8f8; padding: 15px; border-radius: 4px; margin: 15px 0;">
            <p><strong>Fecha:</strong> ${date}</p>
            <p><strong>Hora:</strong> ${time}</p>
            <p><strong>Motivo original de la cita:</strong> ${reason}</p>
          </div>
          <p>Le pedimos disculpas por cualquier inconveniente que esto pueda causarle.</p>
          <p>Por favor, ingrese a nuestra plataforma para programar una nueva cita.</p>
          <p style="margin-top: 20px;">Atentamente,</p>
          <p><strong>El equipo de SaludPlus</strong></p>
        </div>
      `
    });
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = {
  sendCancellationEmail,
};
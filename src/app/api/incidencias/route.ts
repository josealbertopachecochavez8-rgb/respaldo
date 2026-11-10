import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Lista temporal de correos autorizados para hacer la prueba
const usuariosSimulados = [
  'tu_correo@institucion.edu.mx', // Reemplaza por tu correo institucional de prueba
];

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'josealbertopachecochavez0@gmail.com',
    pass: 'znjricqgfcekxkir',
  },
});

export async function POST(request) {
  try {
    const { correo } = await request.json();

    // Validar si el correo existe en la lista simulada
    const existe = usuariosSimulados.includes(correo);

    if (!existe) {
      return NextResponse.json(
        { message: 'El correo no está registrado en el sistema.' },
        { status: 404 }
      );
    }

    // Enviar la notificación al correo institucional
    await transporter.sendMail({
      from: '"Soporte Sistema" <josealbertopachecochavez4@gmail.com>',
      to: correo,
      subject: 'Recuperación de Contraseña',
      html: `
        <h2>Sistema de Control de Asistencia</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="http://localhost:3000/RESTABLECER">Restablecer Contraseña</a>
      `,
    });

    return NextResponse.json({
      success: true,
      message: 'Correo enviado con éxito a tu cuenta institucional.',
    });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor.', error: error.message },
      { status: 500 }
    );
  }
}
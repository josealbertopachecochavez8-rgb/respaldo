import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { destinatario, asunto, mensaje } = await request.json();

    // Configuración del servidor de correo con tu cuenta real
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'josealbertopachecochavez4@gmail.com',
        pass: 'uwlhqifcnzbbilmb'
      }
    });

    // Configuración del mensaje que se enviará al usuario registrado
    const mailOptions = {
      from: '"Sistema de Incidencias" <josealbertopachecochavez4@gmail.com>',
      to: destinatario, // Llega a cualquier correo que escriba el usuario
      subject: asunto,
      text: mensaje
    };

    // Envío del correo electrónico
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return NextResponse.json({ success: false, message: 'Error al enviar el correo' }, { status: 500 });
  }
}
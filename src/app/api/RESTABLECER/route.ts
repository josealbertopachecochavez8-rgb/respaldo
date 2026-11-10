import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  const { email, nuevaContrasena } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: '"Sistema de Incidencias" <josealbertopachecochavez4@gmail.com>',
      to: email,
      subject: 'Restablecimiento de Contraseña',
      text: `Tu nueva contraseña es: ${nuevaContrasena}`
    });
    return NextResponse.json({ message: 'Correo enviado correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 });
  }
}
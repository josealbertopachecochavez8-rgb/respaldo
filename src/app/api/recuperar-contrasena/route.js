process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const uri = "mongodb+srv://josealbertopachecochavez4_db_user:Pass123456@cluster0.qqftpks.mongodb.net/?retryWrites=true&w=majority";

// Declaración de la caché de conexión para evitar fugas en Next.js
let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient; 
  const client = new MongoClient(uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, 
  auth: {
    user: 'josealbertopachecochavez0@gmail.com',
    pass: 'omdslcdvnnkhrsoh',
  },
  tls: {
    rejectUnauthorized: false 
  }
});

export async function POST(request) {
  try {
    const { correo } = await request.json();

    const client = await connectToDatabase();
    const db = client.db('usicamm'); 

    // Usamos una expresión regular para ignorar espacios accidentales al buscar en la BD
    const correoLimpio = correo ? correo.trim() : '';
    const usuario = await db.collection('usuarios_sistema').findOne({ 
      correo_institucional: { $regex: new RegExp(`^\\s*${correoLimpio}\\s*$`, 'i') } 
    });
    
    if (!usuario) {
      return NextResponse.json(
        { mensaje: 'El correo electrónico no se encuentra registrado en el sistema.' },
        { status: 404 }
      );
    }

    const nuevaContrasena = Math.random().toString(36).slice(-8);
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

    await db.collection('tokens_recuperacion').insertOne({
      correo_usuario: correoLimpio,
      token_temporal: nuevaContrasena,
      fecha_expiracion: fechaExpiracion,
      utilizado: 0
    });

    // Rutas absolutas seguras para los archivos adjuntos en Next.js
    const logoSepPath = path.join(process.cwd(), 'public', 'logo-sep.png');
    const logoUsicammPath = path.join(process.cwd(), 'public', 'logo-usicamm.png');
    const attachments = [];
    
    if (fs.existsSync(logoSepPath)) {
      attachments.push({ filename: 'logo-sep.png', path: logoSepPath, cid: 'logo_sep' });
    }
    if (fs.existsSync(logoUsicammPath)) {
      attachments.push({ filename: 'logo-usicamm.png', path: logoUsicammPath, cid: 'logo_usicamm' });
    }

    await transporter.sendMail({
      from: '"Soporte Sistema USICAMM" <josealbertopachecochavez4@gmail.com>',
      to: correoLimpio,
      subject: 'Recuperación de Contraseña',
      text: `Has solicitado recuperar tu contraseña. Tu contraseña temporal es: ${nuevaContrasena}`,
      html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #edf2f7; font-family: Arial, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #edf2f7; padding: 30px 0;">
          <tr>
            <td align="center">
              
              <!-- Tarjeta Principal -->
              <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #cbd5e0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                
                <!-- Franja Superior Guinda Oficial -->
                <tr>
                  <td style="background-color: #9b2247; height: 6px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>

                <!-- Encabezado de Logos -->
                <tr>
                  <td align="center" style="padding: 25px 40px 20px 40px; background-color: #ffffff; border-bottom: 2px solid #f7fafc;">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" style="width: 50%; vertical-align: middle;">
                          <img src="cid:logo_sep" alt="Gobierno de México" width="160" height="auto" style="display: block; width: 160px; max-width: 160px; border: 0;" />
                        </td>
                        <td align="right" style="width: 50%; vertical-align: middle;">
                          <img src="cid:logo_usicamm" alt="USICAMM" width="110" height="auto" style="display: block; width: 110px; max-width: 110px; border: 0;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Contenido del Mensaje -->
                <tr>
                  <td style="padding: 40px 40px 30px 40px; color: #2d3748; text-align: left;">
                    <h2 style="color: #9b2247; font-size: 20px; font-weight: bold; margin: 0 0 5px 0; text-align: center; letter-spacing: 0.5px;">
                      RECUPERACIÓN DE CONTRASEÑA
                    </h2>
                    <p style="text-align: center; color: #718096; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 30px 0; font-weight: bold;">
                      Sistema de Gestión de Incidencias &bull; USICAMM
                    </p>

                    <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 15px;">
                      Estimado/a usuario/a,
                    </p>
                    <p style="font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
                      Se ha generado una clave de acceso temporal para ingresar al sistema institucional:
                    </p>

                    <!-- Cuadro de la Contraseña -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #9b2247; border-radius: 4px; margin-bottom: 25px;">
                      <tr>
                        <td align="center" style="padding: 22px 10px;">
                          <span style="font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #9b2247; font-family: 'Courier New', Courier, monospace;">
                            ${nuevaContrasena}
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Alerta de Vigencia -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fffaf0; border: 1px solid #feebc8; border-radius: 4px; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 12px 15px; font-size: 13px; color: #744210; line-height: 1.5;">
                          <strong>Aviso de seguridad:</strong> Tu contraseña vencerá en 15 minutos. Actualízala dentro de la plataforma para mantener tu cuenta segura.
                        </td>
                      </tr>
                    </table>

                    <p style="font-size: 14px; color: #718096; margin: 0 0 12px 0;">
                      Atentamente,
                    </p>
                    <p style="font-size: 14px; color: #4a5568; margin: 0; line-height: 1.4;">
                      <strong>Subdirección de Recursos Humanos y Organización</strong>
                    </p>
                  </td>
                </tr>

                <!-- Pie de Página Institucional -->
                <tr>
                  <td align="center" style="background-color: #f7fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0;">
                    <p style="font-size: 11px; color: #a0aec0; margin: 0; line-height: 1.4;">
                      Este correo es informativo y generado automáticamente. Por favor no responda a este mensaje.<br>
                      Gobierno de México &copy; ${new Date().getFullYear()}
                    </p>
                  </td>
                </tr>

                <!-- Franja Inferior Guinda -->
                <tr>
                  <td style="background-color: #9b2247; height: 6px; font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>

              </table>

            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
      attachments
    });

    return NextResponse.json(
      { mensaje: 'Contraseña generada y enviada a tu correo con éxito.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error detallado en el proceso de recuperación:', error);
    return NextResponse.json(
      { mensaje: 'Ocurrió un error interno al procesar la solicitud.', detalle: error.message },
      { status: 500 }
    );
  }
}
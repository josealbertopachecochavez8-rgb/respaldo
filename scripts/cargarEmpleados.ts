import * as xlsx from 'xlsx';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: No se encontró MONGODB_URI en el archivo .env');
  process.exit(1);
}

async function subirBaseDeDatos() {
  try {
    console.log('⏳ Conectando a MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Conectado a MongoDB Atlas.');

    const EmpleadoSchema = new mongoose.Schema({}, { strict: false });
    const Empleado = mongoose.models.Empleado || mongoose.model('Empleado', EmpleadoSchema);

    // 1. Limpiar colección anterior para evitar registros desactualizados
    const borrados = await Empleado.deleteMany({});
    console.log(`🧹 Registros anteriores eliminados: ${borrados.deletedCount}`);

    // 2. Leer el archivo Excel actualizado (bd.xlsx)
    const rutaExcel = path.resolve(process.cwd(), 'bd.xlsx');
    const workbook = xlsx.readFile(rutaExcel);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    // Los encabezados están en la fila 6 (índice 5)
    const rows: any[] = xlsx.utils.sheet_to_json(sheet, { range: 5 });

    const empleadosListos = [];

    for (const row of rows) {
      const curpRaw = (row['C.U.R.P.'] || '').toString().trim().toUpperCase();
      if (!curpRaw || curpRaw.length !== 18) continue;

      const rolNormalizado = (row['ROL'] || 'Empleado').toString().trim().toLowerCase();
      const horarioRaw = row['Horario\nde registro'] || row['Horario de registro'] || '09:00 A 16:00';

      empleadosListos.push({
        no: row['No.'],
        noControl: `2026-${String(row['No.'] || '001').padStart(3, '0')}`,
        paterno: (row['Primer Apellido'] || '').toString().trim().toUpperCase(),
        materno: (row['Segundo Apellido'] || '').toString().trim().toUpperCase(),
        nombre: (row['Nombre (s)'] || '').toString().trim().toUpperCase(),
        rfc: (row['R.F.C. (Con Homoclave)'] || '').toString().trim().toUpperCase(),
        curp: curpRaw,
        puesto: (row['Nombre del Puesto'] || '').toString().trim(),
        tipoPlaza: (row['Tipo de plaza'] || '').toString().trim(),
        correo: (row['Correo Electrónico'] || '').toString().trim().toLowerCase(),
        horario: horarioRaw.toString().trim(),
        area: 'DIRECCIÓN GENERAL DE ADMINISTRACIÓN',
        rol: rolNormalizado, // 'empleado' o 'super admin'
        registrado: false,
        password: '', // Se llenará definitivamente cuando se registre y se envíe el correo
      });
    }

    // 3. Insertar todos los registros nuevos
    const insertados = await Empleado.insertMany(empleadosListos);
    console.log(`🚀 ¡Éxito! Se subieron ${insertados.length} empleados a MongoDB Atlas.`);
    console.table(
      insertados.map((e: any) => ({
        No: e.no,
        CURP: e.curp,
        Nombre: `${e.nombre} ${e.paterno}`,
        Rol: e.rol,
      }))
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al subir la base de datos:', error);
    process.exit(1);
  }
}

subirBaseDeDatos();
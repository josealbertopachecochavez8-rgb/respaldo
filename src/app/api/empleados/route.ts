import { NextResponse } from 'next/server';
import { dbConnect } from '@/db';
import Empleado from '@/models/Empleado';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { curp } = await request.json();

    if (!curp || curp.length !== 18) {
      return NextResponse.json({ success: false, message: 'CURP inválida' }, { status: 400 });
    }

    const curpBuscada = curp.trim().toUpperCase();

    // 1. Buscar en MongoDB primero
    const regexCurp = new RegExp(`^${curpBuscada}$`, 'i');
    let empleadoEnBD = await Empleado.findOne({ curp: regexCurp }).lean();
    if (!empleadoEnBD) {
      empleadoEnBD = await Empleado.findOne({ 'C.U.R.P.': regexCurp }).lean();
    }

    let paterno = empleadoEnBD?.paterno || empleadoEnBD?.['Primer Apellido'] || '';
    let materno = empleadoEnBD?.materno || empleadoEnBD?.segundoApellido || empleadoEnBD?.['Segundo Apellido '] || empleadoEnBD?.['Segundo Apellido'] || '';
    let nombre = empleadoEnBD?.nombre || empleadoEnBD?.['Nombre (s)'] || '';
    let rfc = empleadoEnBD?.rfc || empleadoEnBD?.['R.F.C. (Con Homoclave)'] || '';
    let puesto = empleadoEnBD?.puesto || empleadoEnBD?.['Nombre del Puesto'] || '';
    let tipoPlaza = empleadoEnBD?.tipoPlaza || empleadoEnBD?.['Tipo de plaza'] || '';
    let correo = empleadoEnBD?.correo || empleadoEnBD?.['Correo Electrónico'] || '';
    let horario = empleadoEnBD?.horario || empleadoEnBD?.['Horario\nde registro'] || '09:00 A 16:00';
    let area = empleadoEnBD?.area || 'DIRECCIÓN GENERAL DE ADMINISTRACIÓN';
    let no = empleadoEnBD?.no || empleadoEnBD?.['No. '] || empleadoEnBD?.['No.'] || '';

    // 2. Si falta el apellido materno o el empleado no está completo en Mongo, leemos directo del Excel (bd.xlsx)
    if (!materno || materno.trim() === '') {
      try {
        const filePath = path.join(process.cwd(), 'bd.xlsx');
        if (fs.existsSync(filePath)) {
          const workbook = XLSX.readFile(filePath);
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          
          // Leemos saltando las 5 filas de encabezado institucional (y respaldo sin rango)
          let data: any[] = XLSX.utils.sheet_to_json(sheet, { range: 5 });
          let encontradoExcel = data.find((row: any) => {
            const c = String(row['C.U.R.P.'] || row.curp || '').trim().toUpperCase();
            return c === curpBuscada;
          });

          if (!encontradoExcel) {
            data = XLSX.utils.sheet_to_json(sheet);
            encontradoExcel = data.find((row: any) => {
              const c = String(row['C.U.R.P.'] || row.curp || '').trim().toUpperCase();
              return c === curpBuscada;
            });
          }

          if (encontradoExcel) {
            paterno = paterno || encontradoExcel['Primer Apellido'] || encontradoExcel.paterno || '';
            materno = encontradoExcel['Segundo Apellido '] || encontradoExcel['Segundo Apellido'] || encontradoExcel.segundoApellido || encontradoExcel.materno || '';
            nombre = nombre || encontradoExcel['Nombre (s)'] || encontradoExcel.nombre || '';
            rfc = rfc || encontradoExcel['R.F.C. (Con Homoclave)'] || encontradoExcel.rfc || '';
            puesto = puesto || encontradoExcel['Nombre del Puesto'] || '';
            tipoPlaza = tipoPlaza || encontradoExcel['Tipo de plaza'] || '';
            correo = correo || encontradoExcel['Correo Electrónico'] || '';
            horario = horario || encontradoExcel['Horario\nde registro'] || '09:00 A 16:00';
            no = no || encontradoExcel['No. '] || encontradoExcel['No.'] || '';
          }
        }
      } catch (excelErr) {
        console.error('Error leyendo Excel de respaldo:', excelErr);
      }
    }

    if (!paterno && !nombre) {
      return NextResponse.json({ success: false, message: 'La CURP no se encuentra registrada' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      empleado: {
        no: no,
        paterno: paterno,
        materno: materno,
        nombre: nombre,
        rfc: rfc,
        curp: curpBuscada,
        puesto: puesto,
        tipoPlaza: tipoPlaza,
        correo: correo,
        horario: horario,
        area: area,
        rol: empleadoEnBD?.rol || 'empleado'
      }
    });

  } catch (error) {
    console.error('Error en API empleados:', error);
    return NextResponse.json({ success: false, message: 'Error interno del servidor' }, { status: 500 });
  }
}
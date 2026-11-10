'use client';
/** * SISTEMA DE GESTIÓN DE INCIDENCIAS - USICAMM 2026 
 * MÓDULO: PANEL DEL EMPLEADO 
 *  Residente JOSE ALBERTO PACHECO CHAVEZ 
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// ... (cuando por fin termine la función del acuse) ...
import { useIncidencias } from '@/context/IncidenciasContext';
// INTERFAZ PARA EL HISTÓRICO
interface HistoricoIncidencia {
  id: string;
  fecha: string;
  tipo: string;
  estatus: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';
  detalle: string;
}
export default function FormatoEmpleadoFinal() {
  const router = useRouter();
  const { setIncidencias } = useIncidencias() || { setIncidencias: () => {} };
  const [horaActual, setHoraActual] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [nombramiento, setNombramiento] = useState('');
  const [fechaPermisoEconomico, setFechaPermisoEconomico] = useState('');
  
  const [motivo, setMotivo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<'INC' | 'VAC' | 'LIC'>('INC');
  const [tramite, setTramite] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [mostrarIncidencias, setMostrarIncidencias] = useState(false);
  const [modalPdfAbierto, setModalPdfAbierto] = useState(false);
const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light');
const [horaBiometrico, setHoraBiometrico] = useState('');
  const toggleTheme = () => {
    // EFECTO EN TIEMPO REAL: Sincroniza las resoluciones del Jefe con el Empleado
  useEffect(() => {
    const [idIncidenciaEditando, setIdIncidenciaEditando] = useState(null);
    const cargarDatosDelJefe = () => {
      try {
        const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
        // 1. Filtramos solo las incidencias que le pertenecen a este empleado (por su RFC)
        const delEmpleado = guardadas.filter((e: any) => e.rfcEmpleado === datos.rfc || e.rfc === datos.rfc);
                // 2. Sincronizamos el Historial Visual (📂 MIS TRÁMITES)
        if (delEmpleado.length > 0) {
          const historialFormateado = delEmpleado.map((inc: any, index: number) => {
            let estatusVisual = 'PENDIENTE';
            if (inc.estatus?.includes('AUTORIZADO') || inc.estado?.includes('AUTORIZADO')) estatusVisual = 'APROBADO';
            if (inc.estatus?.includes('RECHAZADO') || inc.estado?.includes('RECHAZADO')) estatusVisual = 'RECHAZADO';
            return {
              id: inc.id || String(index),
              fecha: inc.fecha || new Date(inc.fechaSolicitud).toLocaleDateString(),
              tipo: inc.incidencia || 'INCIDENCIA',
              estatus: estatusVisual,
              detalle: (inc.estatus?.includes('PENDIENTE') || inc.estado?.includes('PENDIENTE')) 
                ? 'EN REVISIÓN POR EL JEFE INMEDIATO' 
                : (inc.notaJefe || inc.nota || `SOLICITUD PROCESADA: ${inc.estatus}`)
            };
          });
          // Usamos tu set de actualización existente de la línea 30
          setMisIncidencias(historialFormateado);
        }

        const resueltas = delEmpleado
          .filter((inc: any) => !inc.estatus?.includes('PENDIENTE') && !inc.estado?.includes('PENDIENTE'))
          .map((inc: any, index: number) => ({ 
            id: index,
            tramite: inc.incidencia?.toUpperCase(),
            estatus: (inc.estatus?.includes('AUTORIZADO') || inc.estado?.includes('AUTORIZADO')) ? 'AUTORIZADA' : 'RECHAZADA',
            nota: (inc.estatus?.includes('RECHAZADO') || inc.estado?.includes('RECHAZADO')) 
              ? (inc.notaJefe || inc.nota || "Sin motivo especificado por el jefe.") 
              : "Validada correctamente por tu jefe inmediato."
          }));
        
        if (resueltas.length > 0) {
          // Usamos tu set de actualización de la línea 24
          setNotificaciones(resueltas);
        }

      } catch (err) {
        console.error("Error sincronizando resoluciones:", err);
      }
    };

    cargarDatosDelJefe();

    // Revisa cambios automáticamente cada 3 segundos en segundo plano
    const intervaloJefe = setInterval(cargarDatosDelJefe, 3000);
    return () => clearInterval(intervaloJefe);
  }, [datos.rfc]);
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('blue');
    else setTheme('light');
  };

  const themeStyles = {
    light: "bg-gray-50 text-black",
    dark: "bg-gray-900 text-white",
    blue: "bg-[#0f172a] text-white"
  };

  const isDark = theme === 'dark' || theme === 'blue';

  const [saldos, setSaldos] = useState({
    '1er Periodo': 10,
    '2do Periodo': 10,
    'Extraordinarias': 10
  });  // NUEVOS ESTADOS PARA EL HISTÓRICO
  const [verHistorico, setVerHistorico] = useState(false);
const [misIncidencias, setMisIncidencias] = useState<HistoricoIncidencia[]>([]);  // DATOS ESTÁTICOS DEL SERVIDOR
  const [datos] = useState({
    paterno: "PACHECO",
    materno: "CHÁVEZ",
    nombres: "JOSE ALBERTO",
    rfc: "PACA950101XXX",
    curp: "PACA950101HDFXXX01",
    noControl: "2026-098",
    puesto: "INGENIERO RESIDENTE",
    id: "",
    clavePresupuestal: "11007-2111-001",
    adscripcion: "DIRECCIÓN GENERAL DE ADMINISTRACIÓN",
    horario: "08:00 - 16:00"
  });

const [notificaciones, setNotificaciones] = useState<{ id: number; tramite: string; estatus: string; nota: string }[]>([]);

  useEffect(() => {
    
  // Reloj
  const timer = setInterval(() => {
    const now = new Date();
    setHoraActual(now.toLocaleTimeString('es-MX', { hour12: false }));
  }, 1000);

  // Sincronización con LocalStorage (lo que pone el jefe)
  const cargarDatos = () => {
    const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    // Filtramos por tu RFC
    const misDatos = guardadas.filter((e: any) => e.rfc === "PACA950101XXX");
    setMisIncidencias(misDatos);
  };

  cargarDatos();
  return () => clearInterval(timer);
}, []);

  const calcularDias = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = fin.getTime() - inicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 0;
    return diffDays > 0 ? diffDays : 0;
  };

  const diasSolicitados = calcularDias();
const alCambiarArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.type !== 'application/pdf') {
      alert("Por favor selecciona un archivo PDF válido.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setArchivo(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};
  const generarAcuseGubernamental = () => {
    const win = window.open('', '', 'width=850,height=1000');
    if (!win) return;
const esIlimitado = tramite.includes('Comisión');
  // 1. Identificamos cada tipo de trámite de forma independiente
const esLicenciaMedica = tramite.includes('Licencia');
const esCuidados = tramite.includes('Cuidados');
const esConstancia = tramite.includes('Constancia'); // <--- Nueva variable

// 2. Definimos el mensaje base del sistema
let mensajeSistema = esIlimitado 
  ? "Se turna al Director de área o Titular de área" 
  : "Se turna al superior jerárquico para su validación y autorización.";

// 3. Evaluamos cuál opción fue seleccionada para agregar su respectivo aviso
if (esLicenciaMedica) {
  mensajeSistema += "<br><br><strong>Aviso Normativo:</strong> La licencia médica será sujeta a validación ante el ISSSTE.";
} else if (esCuidados) {
  mensajeSistema += "<br><br><strong>Aviso Normativo:</strong> Cuidados paternos/maternos será sujeta a validación ante el ISSSTE.";
} else if (esConstancia) {
  mensajeSistema += "<br><br><strong>Aviso Normativo:</strong> La constancia médica de tiempo de consulta será sujeta a validación ante el ISSSTE."; // <--- Puedes ajustar este texto si deseas que diga otra cosa
}    const periodoTexto = (seccionSeleccionada === 'VAC' && fechaInicio && fechaFin) 
      ? `DEL ${fechaInicio} AL ${fechaFin}` 
      : new Date().toLocaleDateString('es-MX');
      

    win.document.write(`
      <html>
        <head>
          <title>ACUSE_OFICIAL_${datos.id}</title>
          <style>
            @page { size: letter; margin: 10mm; }
            body { font-family: Arial, sans-serif; padding: 30px; color: #000; line-height: 1.3; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .logos-img { height: 70px; object-fit: contain; }
            .leyenda-header { text-align: center; font-size: 10px; font-weight: bold; border-bottom: 3px solid #691C32; padding-bottom: 10px; }
            .titulo-documento { text-align: center; font-size: 16px; font-weight: 900; margin: 20px 0; text-decoration: underline; }
            .info-box { border: 1px solid #000; margin-bottom: 15px; }
            .info-header { background: #691C32; color: #fff; padding: 5px 10px; font-size: 11px; font-weight: bold; }
            .info-content { padding: 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; }
            .label { font-weight: bold; color: #333; font-size: 9px; }
            .value { border-bottom: 1px solid #eee; padding-bottom: 2px; }
            .motivo-area { padding: 10px; font-size: 11px; border: 1px solid #ccc; background: #f9f9f9; min-height: 60px; }
            .mensaje-sistema { border: 2px dashed #000; padding: 10px; margin: 20px 0; text-align: center; font-weight: bold; font-size: 12px; white-space: pre-line; }
            .firma-linea { border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px; font-size: 11px; font-weight: bold; margin: 50px auto 0 auto; }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td style="width: 25%;"><img src="/logo-sep.png" class="logos-img"></td>
              <td class="leyenda-header">
                DIRECCIÓN GENERAL DE ADMINISTRACIÓN<br>
                DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS<br>
                SUBDIRECCIÓN DE RECURSOS HUMANOS Y ORGANIZACIÓN
              </td>
              <td style="width: 25%; text-align: right;"><img src="/logo-usicamm.png" class="logos-img"></td>
            </tr>
          </table>
          <div class="titulo-documento">FORMATO DE REGISTRO DE INCIDENCIA</div>
          <div style="text-align: right; font-size: 11px; margin-bottom: 10px;">
            <strong>FECHA DE SOLICITUD:</strong> ${new Date().toLocaleDateString('es-MX')}<br>
            <strong>FOLIO DIGITAL:</strong> 2026-${Math.floor(Math.random() * 9000) + 1000}
          </div>
          <div class="info-box">
            <div class="info-header">DATOS DEL SERVIDOR PÚBLICO</div>
            <div class="info-content">
              <div><span class="label">PATERNO/MATERNO/NOMBRE:</span><br>${datos.paterno} ${datos.materno} ${datos.nombres}</div>
              <div><span class="label">RFC / CURP:</span><br>${datos.rfc} / ${datos.curp}</div>
              <div><span class="label">UNIDAD DE ADSCRIPCIÓN:</span><br>${datos.adscripcion}</div>
              <div><span class="label">PUESTO Y CLAVE:</span><br>${datos.puesto} | ${datos.clavePresupuestal}</div>
              <div><span class="label">TIPO DE NOMBRAMIENTO:</span><br>${nombramiento}</div>
              <div><span class="label"> NO. CONTROL:</span><br>${datos.id} / ${datos.noControl}</div>
            </div>
          </div>
          <div class="info-box">
            <div class="info-header">TIPO DE INCIDENCIA SOLICITADA</div>
            <div style="padding: 10px;">
              <div class="value" style="font-size: 14px; font-weight: bold;">${tramite}</div>
${horaBiometrico ? `
  <div class="label" style="margin-top: 10px;">HORA REGISTRO BIOMÉTRICO:</div>
  <div class="value" style="font-size: 13px; font-weight: bold; color: #000;">${horaBiometrico} hrs.</div>
` : ''}
<div class="label" style="margin-top:10px;">PERÍODO:</div>              <div class="value">${periodoTexto}</div>
${seccionSeleccionada === 'VAC' ? `<div class="value" style="margin-top: 10px; font-size: 14px;">días otorgados ${diasSolicitados}</div>` : ''}              <div class="label" style="margin-top:10px;">MOTIVOS Y/O OBSERVACIONES DEL EMPLEADO:</div>
              <div class="motivo-area">${motivo || 'EL EMPLEADO NO REGISTRÓ OBSERVACIONES.'}</div>
            </div>
          </div>
          <div class="mensaje-sistema">${mensajeSistema}</div>
          <div class="firma-linea"><br>${datos.nombres} ${datos.paterno}<br>FIRMA DEL SERVIDOR PÚBLICO</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };
const manejarEnvio = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!nombramiento) return alert("ERROR: Seleccione Tipo de Nombramiento");
    if (!tramite) return alert("ERROR: Seleccione un trámite específico.");

    if (confirm("¿Confirma el envío?")) {
      try {
        const tramiteNormalizado = tramite.trim().toUpperCase();
        
        // 1. Identificamos si es uno de los 3 documentos exclusivos con PDF
        const esDocumentoMedicoExclusivo = [
          "LICENCIA MÉDICA",
          "CUIDADOS MATERNOS/PATERNOS",
          "CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA"
        ].some(doc => tramiteNormalizado.includes(doc));

        // Clasificación automática
        let clasificacion = "ORDINARIA";
        if (tramiteNormalizado.includes("TODO EL DIA") || tramiteNormalizado.includes("TODO EL DÍA")) {
          clasificacion = "EXTRAORDINARIA";
        }

        const payloadIncidencia = {
          id: `2026-${Math.floor(Math.random() * 9000) + 1000}`,
          folioDigital: `2026-${Math.floor(Math.random() * 9000) + 1000}`,
          rfcEmpleado: datos.rfc,
          rfc: datos.rfc,
          nombreEmpleado: `${datos?.paterno || 'PACHECO'} ${datos?.materno || 'CHÁVEZ'} ${datos?.nombres || 'JOSE ALBERTO'}`,
          nombre: `${datos?.paterno || 'PACHECO'} ${datos?.materno || 'CHÁVEZ'} ${datos?.nombres || 'JOSE ALBERTO'}`,
          tipoNombramiento: nombramiento,
          incidencia: tramiteNormalizado,
          tipo: tramiteNormalizado,
          justificacion: motivo,
          obs: motivo,
          clasificacion: clasificacion,
          horaBiometrico: horaBiometrico,
          fechaSolicitud: new Date().toISOString(),
          estatus: 'PENDIENTE',
          estado: 'pendiente',
          
          // 2. CAMPOS CLAVE PARA QUE AMBOS PANELES (JEFE Y RH) LO DETECTEN:
          // Si es médico, asignamos el estatus pendiente específico para que RH también lo liste
          estatusRH: esDocumentoMedicoExclusivo ? 'PENDIENTE' : 'NO_APLICA',
          estatusJefe: 'PENDIENTE',
          visibleParaRH: esDocumentoMedicoExclusivo,
          destinatarios: esDocumentoMedicoExclusivo ? ["JEFE_INMEDIATO", "RECURSOS_HUMANOS"] : ["JEFE_INMEDIATO"]
        };

        const nuevaIncidenciaConPdf = {
          ...payloadIncidencia,
          pdfAdjunto: archivo || "", 
        };

        try {
          const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
          const listaActualizada = [nuevaIncidenciaConPdf, ...guardadas];
          localStorage.setItem("base_incidencias", JSON.stringify(listaActualizada));
        } catch (error) {
          console.error("Error de almacenamiento:", error);
          const incidenciaLigera = { ...payloadIncidencia, pdfAdjunto: "DEMASIADO_PESADO" };
          const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
          localStorage.setItem("base_incidencias", JSON.stringify([incidenciaLigera, ...guardadas]));
          alert("Memoria al límite. El trámite se guardó en modo ligero.");
        }

        generarAcuseGubernamental();

        if (esDocumentoMedicoExclusivo) {
          alert("¡Enviado con éxito! El documento se ha turnado a tu Jefe Inmediato y a Recursos Humanos (RH) de forma simultánea.");
        } else {
          alert("Se turna a Superior Jerárquico y Autorización.");
        }

        // Limpieza de estados
        setTramite('');
        setMotivo('');
        setHoraBiometrico('');
        setMostrarIncidencias(false);
        if (setArchivo) setArchivo(null);

      } catch (error) {
        console.error("Error crítico:", error);
        alert("ERROR DE CONEXIÓN: No se pudo registrar la incidencia.");
      }
    }
  };
  return (
    
    <div className="min-h-screen bg-gray-200 p-2 md:p-6 text-black font-serif uppercase text-[10px] relative">
      
      {/* NOTIFICACIONES Y HORA */}
      <div className="fixed top-2 left-2 z-[100]">
        {mostrarNotificaciones && (
          <div className="absolute top-12 left-0 w-64 bg-white border-2 border-black p-3 shadow-2xl z-[101]">
            <h2 className="font-black border-b border-black mb-2 text-[9px]">ESTATUS DE TRÁMITES</h2>
            {notificaciones.map(n => (
              <div key={n.id} className="mb-2 border-b border-gray-100 pb-1">
                <p className="font-bold">{n.tramite}: <span className={n.estatus === 'AUTORIZADA' ? 'text-green-700' : 'text-red-700'}>{n.estatus}</span></p>
                <p className="normal-case italic text-[8px]">MOTIVO: {n.nota}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="fixed top-2 right-2 bg-black text-white px-3 py-1 rounded-full font-mono z-[100] border border-[#BC955C] text-[9px]">⏱ {horaActual}</div>

      <div className="max-w-5xl mx-auto bg-white border-2 border-black shadow-2xl relative overflow-hidden">
        
        {/* ENCABEZADO */}
        <div className="grid grid-cols-12 border-b-2 border-black">
          <div className="col-span-3 p-2 flex justify-center items-center border-r-2 border-black"><img src="/logo-sep.png" alt="SEP" className="h-35 object-contain" /></div>
          <div className="col-span-6 p-2 text-center border-r-2 border-black flex flex-col justify-center">
            <p className="font-bold text-[10px] leading-tight mb-1">DIRECCIÓN GENERAL DE ADMINISTRACIÓN<br/>DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS<br/>Subdirección de Recursos Humanos y Organización</p>
            <h1 className="font-black text-[11px] border-y border-black py-0.5 tracking-tighter">Sistema Integral de Incidencias de Personal
</h1>
            <p className="mt-3 font-bold">FECHA: {new Date().toLocaleDateString('es-MX')}</p>
          </div>
          <div className="col-span-3 p-2 flex justify-center items-center"><img src="/logo-usicamm.png" alt="USICAMM" className="h-24 object-contain" /></div>
        </div>

        {/* DATOS PERSONALES */}
        <div className="p-3 grid grid-cols-4 gap-2 border-b-2 border-black font-bold">
          <div className="border-b border-black">Paterno:<br/>{datos.paterno}</div>
          <div className="border-b border-black">Materno:<br/>{datos.materno}</div>
          <div className="col-span-2 border-b border-black">Nombre (s):<br/>{datos.nombres}</div>
          <div className="border-b border-black">RFC: {datos.rfc}</div>
          <div className="border-b border-black">CURP: {datos.curp}</div>
          <div className="border-b border-black">No. Control: {datos.noControl}</div>
          <div className="col-span-2 border-b border-black">Área: {datos.adscripcion}</div>
          <div className="border-b border-black">Horario: {datos.horario}</div>
          <div className="border-b border-black bg-gray-50">
            Plaza:
            <select className="ml-1 border border-black bg-white text-[9px] font-bold" onChange={(e)=>setNombramiento(e.target.value)}>
              <option value="">- SELECCIONE -</option>
              <option value="BASE">BASE</option>
              <option value="CONFIANZA">CONFIANZA</option>
            </select>
          </div>
        </div>

        {/* ===== MENÚ DE TRÁMITES (TABS) ===== */}
        <div className="border-b-2 border-black bg-gray-100 flex divide-x-2 divide-black">
          {(['INC', 'VAC', 'LIC'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => { setSeccionSeleccionada(tipo); setTramite(''); }}
              className={`flex-1 py-2 font-black tracking-widest transition-all ${
                seccionSeleccionada === tipo ? 'bg-black text-white' : 'bg-white hover:bg-gray-200'
              }`}
            >
              {tipo === 'INC' ? 'INCIDENCIAS' : tipo === 'VAC' ? 'VACACIONES' : 'LICENCIAS (PDF)'}
            </button>
          ))}
        </div>

        {/* CONTENIDO DINÁMICO DE TRÁMITES */}
        <div className="min-h-[280px] p-4 bg-white border-b-2 border-black">
          
{/* SECCIÓN INCIDENCIAS */}
{seccionSeleccionada === 'INC' && (
  <div className="grid grid-cols-2 gap-4 relative">
    
    {/* COLUMNA IZQUIERDA: SELECCIÓN EMERGENTE */}
    <div className="relative">
      <div 
        onClick={() => setMostrarIncidencias(!mostrarIncidencias)} 
        className="flex items-center gap-2 cursor-pointer mb-2 w-fit hover:opacity-80 transition-all"
      >
        <div className="w-6 h-6 border-2 border-black flex items-center justify-center font-bold text-lg bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          {mostrarIncidencias ? '−' : '+'}
        </div>
        <span className="text-[10px] font-black uppercase tracking-tight">Tipo de Incidencia</span>
      </div>

      {/* VENTANA EMERGENTE (DROPDOWN) */}
      {mostrarIncidencias && (
        <div className="absolute top-8 left-0 z-50 w-64 bg-white border-2 border-black p-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in-95 duration-200">
          <p className="text-[9px] font-black border-b border-black mb-2 pb-1 bg-gray-100 px-1 uppercase"></p>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {[
              'Omisión de Entrada', 'Omisión de  Salida', 'Retardo Menor', 'Retardo Mayor', 
              'Comisión de Entrada ', 'Comisión de Salida','Comisión todo el dia', 
               'Permiso Económico'
            ]
            .filter(i => i !== 'Permiso Económico' || nombramiento === 'BASE')
            .map(i => {
              // Definimos la descripción según la opción
              let descripcion = "";
              const limpia = i.trim();
              if (limpia === 'Omisión de Entrada') descripcion = "Registro en la torelancia de 11 a 20 min.";
              else if (limpia === 'Omisión de Salida') descripcion = "Registro en la torelancia de 21 a 30 min.";
              else if (limpia === 'Retardo Menor') descripcion = "Llegada tarde dentro del margen de tolerancia inicial.";
              else if (limpia === 'Retardo Mayor') descripcion = "Llegada tarde fuera del margen de tolerancia establecido.";
              else if (limpia === 'Comisión de Entrada') descripcion = "Asignación oficial que requiere checar entrada más tarde.";
              else if (limpia === 'Comisión de Salida') descripcion = "Asignación oficial que requiere retirarse antes de la hora habitual.";
              else if (limpia === 'Comisión todo el dia') descripcion = "Jornada completa destinada a una comisión o actividad oficial fuera del centro.";
              else if (limpia === 'Permiso Económico') descripcion = "Día económico solicitado conforme a derecho laboral.";

              return (
                <label 
                  key={i} 
                  title={descripcion} // <--- ESTO MUESTRA EL RECUADRITO AL PASAR EL CURSOR
                  className="flex items-center gap-2 cursor-pointer font-bold py-1.5 px-2 hover:bg-yellow-300 text-[10px] border border-transparent hover:border-black transition-all"
                >
                  <input 
                    type="radio" 
                    name="t" 
                    checked={tramite === i} 
                    onChange={() => {
                      setTramite(i); 
                      setArchivo(null);
                      setMostrarIncidencias(false); 
                    }} 
                  />
                  <span className={i === 'Retardo Menor' || i === 'Retardo Mayor' ? 'text-red-600' : i === 'Permiso Económico' ? 'text-amber-600' : i.includes('Comisión') ? 'text-blue-800' : 'text-black'}>                 
                    {i.toUpperCase()}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* INDICADOR DE SELECCIÓN ABAJO DEL BOTÓN */}
      {tramite && !mostrarIncidencias && (
        <div className="mt-4 p-2 border-2 border-dashed border-black bg-gray-50 animate-in slide-in-from-left-2">
          <p className="text-[7px] font-black text-gray-400 uppercase">Seleccionado:</p>
          <p className="text-[10px] font-bold text-black">{tramite.toUpperCase()}</p>
        </div>
      )}
    </div>

    {/* COLUMNA DERECHA: CAMPOS CONDICIONALES SEGÚN EL TRÁMITE */}
    <div className="flex flex-col gap-3">
      {tramite && (
        <div className="animate-in fade-in duration-500">
          
          {/* SI EL TRÁMITE ES 'Permiso Económico', MOSTRAR CALENDARIOS DE INICIO Y FIN */}
          {tramite === 'Permiso Económico' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-gray-500 uppercase">Fecha de Inicio:</label>
                <input 
                  type="date" 
                  value={fechaInicio}
                  min={`${new Date().getMonth() < 7 ? new Date().getFullYear() - 1 : new Date().getFullYear()}-08-01`}
                  max={`${new Date().getMonth() < 7 ? new Date().getFullYear() : new Date().getFullYear() + 1}-07-31`}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border-2 border-black p-2 text-[11px] bg-yellow-50 font-bold focus:bg-white transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-gray-500 uppercase">Fecha de Fin:</label>
                <input 
                  type="date" 
                  value={fechaFin}
                  min={`${new Date().getMonth() < 7 ? new Date().getFullYear() - 1 : new Date().getFullYear()}-08-01`}
                  max={`${new Date().getMonth() < 7 ? new Date().getFullYear() : new Date().getFullYear() + 1}-07-31`}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border-2 border-black p-2 text-[11px] bg-yellow-50 font-bold focus:bg-white transition-colors"
                />
              </div>
            </div>
          ) : (
            /* PARA CUALQUIER OTRO TRÁMITE, MANTIENE LA JUSTIFICACIÓN Y HORA BIOMÉTRICA */
            <>
              <p className="text-[8px] font-black mb-1 uppercase">Justificación:</p>
              <textarea
                maxLength={1000}
                className="w-full border-2 border-black p-2 text-[10px] h-32 bg-yellow-50 font-bold shadow-inner focus:bg-white transition-colors"
                placeholder="ESCRIBA EL MOTIVO DETALLADO AQUÍ PARA EL PDF..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
              />
              
              {!["COMISIÓN DE ENTRADA", "COMISIÓN DE SALIDA", "COMISIÓN TODO EL DIA", "COMISIÓN TODO EL DÍA"].some(c => tramite.toUpperCase().includes(c)) && (
                <div className="flex flex-col gap-1 mt-3">
                  <label className="text-[8px] font-black text-gray-400 uppercase">Escriba la Hora del Registro Biométrico:</label>
                  <input 
                    type="time" 
                    value={horaBiometrico}
                    onChange={(e) => setHoraBiometrico(e.target.value)}
                    className="w-full border-2 border-black p-1 text-[11px] bg-yellow-50 font-bold focus:bg-white transition-colors"
                  />
                </div>
              )}
            </>
          )}

        </div>
      )}
    </div>
  </div>
)}

{/* SECCIÓN VACACIONES */}
{seccionSeleccionada === 'VAC' && (
  <div className="max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    {/* ESTATUS DE DÍAS POR GOZAR */}
    {seccionSeleccionada === 'VAC' && (
      <div className="max-w-2xl mx-auto p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-6 animate-in fade-in duration-500">
        
      {/* 2. CALENDARIOS DINÁMICOS CON RESTRICCIÓN ESTRICTA Y CANDADO DE 3 INCIDENCIAS */}
<div className="space-y-3">
  <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
    <div className="space-y-1">
      <label className="block text-[8px] font-black text-gray-400 uppercase ml-1">Fecha de Inicio</label>
      <input 
        type="date" 
        className="w-full text-xs font-bold focus:outline-none bg-slate-50 p-2 rounded-lg" 
        value={fechaInicio}
        min={
          tramite?.toLowerCase().includes("2do") || tramite === "2" 
            ? "2026-12-01" 
            : (tramite?.toLowerCase().includes("1er") || tramite === "1" ? "2026-01-01" : undefined)
        }
        max={
          tramite?.toLowerCase().includes("2do") || tramite === "2" 
            ? "2026-12-31" 
            : (tramite?.toLowerCase().includes("1er") || tramite === "1" ? "2026-11-30" : undefined)
        }
        onChange={(e) => {
          const valor = e.target.value;
          if (!valor) return;

          // Validar fin de semana (Sábado = 6, Domingo = 0)
          const [year, month, day] = valor.split('-').map(Number);
          const fechaSeleccionada = new Date(year, month - 1, day);
          const diaSemana = fechaSeleccionada.getDay();
          
          if (diaSemana === 0 || diaSemana === 6) {
            alert("⚠️ Error en congruencia de fechas: Los fines de semana (Sábados y Domingos) están estrictamente prohibidos y bloqueados.");
            return;
          }
          setFechaInicio(valor);
        }} 
      />
    </div>
    
    <div className="space-y-1">
      <label className="block text-[8px] font-black text-gray-400 uppercase ml-1">Fecha de Término</label>
      <input 
        type="date" 
        className="w-full text-xs font-bold focus:outline-none bg-slate-50 p-2 rounded-lg" 
        value={fechaFin}
        min={
          tramite?.toLowerCase().includes("2do") || tramite === "2" 
            ? "2026-12-01" 
            : (tramite?.toLowerCase().includes("1er") || tramite === "1" ? "2026-01-01" : undefined)
        }
        max={
          tramite?.toLowerCase().includes("2do") || tramite === "2" 
            ? "2026-12-31" 
            : (tramite?.toLowerCase().includes("1er") || tramite === "1" ? "2026-11-30" : undefined)
        }
        onChange={(e) => {
          const valor = e.target.value;
          if (!valor) return;

          // Validar fin de semana (Sábado = 6, Domingo = 0)
          const [year, month, day] = valor.split('-').map(Number);
          const fechaSeleccionada = new Date(year, month - 1, day);
          const diaSemana = fechaSeleccionada.getDay();
          
          if (diaSemana === 0 || diaSemana === 6) {
            alert("⚠️ Error en congruencia de fechas: Los fines de semana (Sábados y Domingos) están estrictamente prohibidos y bloqueados.");
            return;
          }
          setFechaFin(valor);
        }} 
      />
    </div>
  </div>

  {/* ALERTA Y BLOQUEO ESTRICTO DEL MES */}
  {(() => {
    if (!fechaInicio) return null;
    const mesSeleccionado = fechaInicio.substring(0, 7); // YYYY-MM
    
    // Contamos incidencias registradas en este mes exacto
    const incidenciasGuardadas = JSON.parse(localStorage.getItem('base_incidencias') || '[]');
    const totalMes = incidenciasGuardadas.filter((item: any) => 
      item.fechaInicio && item.fechaInicio.startsWith(mesSeleccionado)
    ).length;

    if (totalMes >= 3) {
      return (
        <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-[10px] font-black uppercase text-center tracking-wide">
          🔒 CANDADO ESTRICTO ACTIVO: Ha alcanzado el límite máximo de 3 incidencias para este mes. El sistema no le permitirá enviar más solicitudes hasta que Recursos Humanos acepte o rechace los folios pendientes.
        </div>
      );
    }
    return null;
  })()}
</div> 
        {/* ENCABEZADO DE REPORTE */}
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">vacaciones / Ciclo 2026</h3>
          <p className="text-sm font-bold text-slate-800">Días por gozar</p>
        </div>

        {/* BARRAS DE ESTATUS DINÁMICAS */}
        <div className="space-y-6">
          {Object.entries(saldos).map(([periodo, totalBase]) => {
            const esSeleccionado = tramite === periodo;
            
            // LÓGICA DE EXCLUSIVIDAD VISUAL:
            const diasGozados = esSeleccionado ? Number(diasSolicitados) : 0;
            const diasRestantes = Number(totalBase) - diasGozados;
            const porcentajeGozado = (diasGozados / Number(totalBase)) * 100;

            // Identificar los textos informativos de las reglas fijas
            let reglaPeriodo = "";
            if (periodo.toLowerCase().includes("1er") || periodo.includes("1")) {
              reglaPeriodo = "Enero a Noviembre (Ciclos 2026 - 3050)";
            } else if (periodo.toLowerCase().includes("2do") || periodo.includes("2")) {
              reglaPeriodo = "Exclusivo de Diciembre (Calendario Bloqueado)";
            } else {
              reglaPeriodo = "Vacaciones Extraordinarias (Tope 10 días)";
            }

            return (
              <div 
                key={periodo}
                onClick={() => setTramite(periodo)}
                className={`group cursor-pointer p-4 rounded-2xl transition-all ${
                  esSeleccionado ? 'bg-blue-50/50 ring-1 ring-blue-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-end mb-3">
                  <div className="space-y-1">
                    <span className={`text-[9px] font-[900] uppercase tracking-widest ${esSeleccionado ? 'text-blue-600' : 'text-slate-400'}`}>
                      {periodo}
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {reglaPeriodo}
                    </p>
                    {esSeleccionado && (
                      <div className="mt-1">
                        <p className="text-xs font-bold text-blue-700 animate-pulse">
                          ⚠️ Periodo en edición
                        </p>
                        {/* MUESTRA LOS DÍAS SOLICITADOS EN EL CALENDARIO DEBAJO DEL TÍTULO */}
                        {diasSolicitados > 0 && (
                          <p className="text-[11px] font-black text-slate-800 mt-1 bg-white px-2 py-0.5 rounded-md border border-blue-100 inline-block">
                            N. de días solicitados: <span className="text-blue-600">{diasSolicitados}</span> d
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Días Restantes</p>
                    <p className={`text-2xl font-black italic ${esSeleccionado ? 'text-blue-700' : 'text-slate-900'}`}>
                      {diasRestantes}
                    </p>
                  </div>
                </div>

                {/* GRÁFICO DE BARRA DE ESTATUS */}
                <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-700 ease-in-out ${
                      esSeleccionado ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
                    style={{ width: `${Math.max(0, 100 - porcentajeGozado)}%` }}
                  />
                </div>
                
                {/* LEYENDA PARA REPORTE */}
                <div className="flex justify-between mt-2">
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Goce: {diasGozados} d</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Base: {totalBase} d</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    )}

    {/* 4. VALIDACIÓN DE ERROR CRÍTICO */}
    {tramite && (() => {
      const obtenerMes = (fechaStr: string) => fechaStr ? parseInt(fechaStr.split('-')[1], 10) : null;
      const obtenerAnio = (fechaStr: string) => fechaStr ? parseInt(fechaStr.split('-')[0], 10) : null;
      
      const mesInicio = obtenerMes(fechaInicio);
      const mesFin = obtenerMes(fechaFin);
      const anioInicio = obtenerAnio(fechaInicio);
      const anioFin = obtenerAnio(fechaFin);

      let mensajeError = "";

      if (diasSolicitados > saldos[tramite as keyof typeof saldos]) {
        mensajeError = "⚠️ Error: Estás excediendo los días disponibles del período seleccionado";
      }
      
      if (mesInicio && mesFin) {
        const esPrimerPeriodo = tramite.toLowerCase().includes("1er") || tramite.includes("1");
        const esSegundoPeriodo = tramite.toLowerCase().includes("2do") || tramite.includes("2");
        const esExtraordinaria = tramite.toLowerCase().includes("extra");

        if (esPrimerPeriodo) {
          if (mesInicio === 12 || mesFin === 12) {
            mensajeError = "⚠️ Error: El 1er Periodo solo permite meses de Enero a Noviembre.";
          } else if (anioInicio! < 2026 || anioFin! > 3050) {
            mensajeError = "⚠️ Error: El rango de años permitido es exclusivamente del 2026 al 3050.";
          }
        }

        if (esSegundoPeriodo && (mesInicio !== 12 || mesFin !== 12)) {
          mensajeError = "⚠️ Error estricto: El 2do Periodo debe ser obligatoriamente en Diciembre.";
        }

        if (esExtraordinaria && diasSolicitados > 10) {
          mensajeError = "⚠️ Error estricto: Las vacaciones Extraordinarias tienen un tope máximo de 10 días.";
        }
      }

      return mensajeError ? (
        <div className="bg-red-50 border border-red-200 p-3 rounded-xl animate-pulse">
          <p className="text-[9px] text-red-600 font-black text-center uppercase tracking-tighter">
            {mensajeError}
          </p>
        </div>
      ) : null;
    })()}

  </div>
)}          {/* SECCIÓN LICENCIAS */}
          {seccionSeleccionada === 'LIC' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {['Licencia Médica*', 'Cuidados Maternos/Paternos*', 'Constancia Médica de Tiempo de Consulta*'].map(i => (
                  <label key={i} className="flex items-center gap-2 font-bold text-red-700 py-2 border-b border-gray-100 cursor-pointer">
                    <input type="radio" name="t" checked={tramite === i} onChange={() => setTramite(i)} /> {i}
                  </label>
                ))}
              </div>
              <div className="border-2 border-red-600 p-2 bg-red-50 flex flex-col justify-center items-center">
           {/* SECCIÓN DE VISUALIZACIÓN CUANDO YA HAY ARCHIVO */}
{archivo ? (
  <div className="relative w-full h-[200px] border border-black bg-gray-50 flex flex-col items-center justify-center gap-2">
    <p className="text-[11px] font-black text-emerald-700">✓ COMPROBANTE ADJUNTO</p>
    
    <div className="flex gap-2">
      {/* BOTÓN PARA ABRIR EN GRANDE */}
     {/* BOTÓN PARA ABRIR EN GRANDE CON BLOB SEGURO */}
<button
  type="button"
  onClick={() => {
    if (!pdfUrl) return;
    // Convertimos el base64 a un objeto blob legible por el navegador
    const arr = pdfUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }}
  className="bg-black text-white px-3 py-1.5 text-[10px] font-bold rounded hover:bg-gray-800 transition-all shadow"
>
  Ver en Grande 👁️
</button>

      {/* BOTÓN PARA CAMBIAR */}
      <button 
        type="button"
        onClick={() => { setArchivo(null); setPdfUrl(null); }}
        className="bg-red-700 text-white px-3 py-1 text-[10px] font-bold"
      >
        Cambiar Archivo ✕
      </button>
    </div>
  </div>
) : (
  /* AQUÍ VA EL INPUT ORIGINAL */
  <div className="text-center p-4 border-2 border-red-600">
    <p className="font-black text-red-600 mb-2">ADJUNTAR COMPROBANTE (PDF)</p>
    <input type="file" accept=".pdf" onChange={alCambiarArchivo} />
  </div>

)}

              </div>
            </div>
          )}
        </div>

        {/* PANEL DE CONTROL  */}

        <div className="p-8 flex justify-center items-center gap-10 bg-white/80 backdrop-blur-md border-t border-gray-100 rounded-b-2xl relative">
<button 
  type="button" 
  onClick={(e) => manejarEnvio(e)}
  className="group relative bg-[#691C32] px-12 py-4 rounded-full overflow-hidden transition-all duration-500 hover:shadow-lg active:scale-95"
>
  <div className="relative z-10 flex items-center gap-3">
    <span className="text-white text-[9px] font-black tracking-widest uppercase">ENVIAR INCIDENCIA</span>
    <span className="text-xl group-hover:animate-bounce"></span>
  </div>
</button>
<button
          type="button"
  onClick={() => {
    setIdIncidenciaEditando(inc.id);
    setTramite(inc.tipo);
  }}
>
</button>
          {/* BOTÓN: CARPETA */}
          <div className="absolute right-8 flex flex-col items-center gap-1">
            <button onClick={() => setVerHistorico(true)} className="w-12 h-12 bg-white border-2 border-[#BC955C] rounded-2xl flex items-center justify-center shadow-lg hover:bg-[#BC955C] group transition-all relative">
              <span className="text-2xl group-hover:scale-125 transition-transform">📂</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white animate-pulse"></span>
            </button>
            <span className="text-[7px] font-black text-[#BC955C]">MIS TRÁMITES</span>
          </div>
        </div>
<div className="flex items-center gap-6 ml-8 -mt-24">
    <div className="h-10 w-[1px] bg-slate-200"></div>            <div className="flex gap-3">
              <button onClick={() => router.push('/roles')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-[#BC955C] group-hover:shadow-[0_0_15px_rgba(188,149,92,0.2)] transition-all duration-500">
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-300 group-hover:border-[#BC955C]"></div>
                  <span className="text-xl group-hover:scale-125 transition-transform duration-500">◀️</span>
                </div>
                <span className="text-[7px] font-black text-slate-400 group-hover:text-[#BC955C] uppercase tracking-[0.2em]">Regresar</span>
              </button>
              <button onClick={() => router.push('/')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-500">
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-slate-300 group-hover:border-red-500"></div>
                  <span className="text-xl group-hover:translate-x-1 transition-transform duration-500">🚪</span>
                </div>
                <span className="text-[7px] font-black text-slate-400 group-hover:text-red-500 uppercase tracking-[0.2em]">Salir</span>
              </button>
            </div>
          </div>
        {/* MODAL DEL HISTÓRICO */}
        {verHistorico && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="bg-[#691C32] p-4 flex justify-between items-center border-b-2 border-black">
                <h3 className="text-white font-black italic text-xs tracking-widest">📋 HISTORIAL DE SOLICITUDES</h3>
                <button onClick={() => setVerHistorico(false)} className="text-white hover:rotate-90 transition-transform font-black">✕</button>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto space-y-3">

{misIncidencias.map((inc, i) => (
  <div key={i} className="border-2 border-gray-100 p-3 rounded-2xl flex justify-between items-center hover:bg-gray-50 transition-colors">
    
    <div className="flex items-center gap-2">
      {/* Contador visual */}
      <span className="text-[10px] font-bold text-gray-400">{i + 1}</span>
      
      <div className="text-left">
        <p className="text-[8px] font-black text-gray-400">{inc.fecha}</p>
        <p className="text-[10px] font-black text-black">{inc.tipo}</p>
        <p className="text-[7px] font-bold text-gray-500 italic mt-0.5 uppercase">{inc.detalle}</p>
      </div>
    </div>

    {/* Estatus visual */}
    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black border ${
      inc.estatus === 'APROBADO' ? 'bg-green-100 border-green-600 text-green-700' : 
      inc.estatus === 'RECHAZADO' ? 'bg-red-100 border-red-600 text-red-700' : 'bg-yellow-100 border-yellow-600 text-yellow-700'
    }`}>
      {inc.estatus}
    </span>
  </div>
))}            
 </div>
              <div className="p-3 bg-gray-50 text-center text-[8px] font-black text-gray-500 border-t border-gray-100 uppercase">
                Sistema USICAMM 2026 - Transparencia Administrativa
              </div>
            </div>
          </div>
        )}

        {/* PIE DE PÁGINA */}
        <div className="p-8 bg-white mt-auto">
          <div className="border-t-2 border-[#691C32] pt-3 max-w-sm text-left">
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección de Administración y Finanzas</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Subdirección de Recursos Humanos y Organización</p>
          </div>
        </div>
        <footer className="bg-black text-white p-1 text-center text-[7px] font-bold uppercase tracking-widest">
          Responsable Técnico: Ing. José Alberto Pacheco Chávez - USICAMM 2026
        </footer>
        
      </div> 
    </div>
  );
}
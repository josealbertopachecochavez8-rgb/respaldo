"use client"
import { useRouter } from 'next/navigation'
import { useState, useMemo, useEffect } from 'react'
export default function SistemaCapitalHumanoV5() {
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  // NUEVOS ESTADOS PARA EL HISTORIAL DE ANUNCIOS FLOTANTE
  const [mostrarModalHistorialAnuncios, setMostrarModalHistorialAnuncios] = useState(false);
  const [listaAnunciosGuardados, setListaAnunciosGuardados] = useState<any[]>([]);
// --- ESTADOS PARA REPORTE POR ÁREA ---
  const [verModalAreaReporte, setVerModalAreaReporte] = useState(false);
  const [areaSeleccionadaReporte, setAreaSeleccionadaReporte] = useState("");
  const areasUSICAMM = [
    "Dirección General de Admisión",
    "Dirección General de Promoción",
    "Dirección General de Reconocimiento",
    "Dirección General de Administración",
    "Dirección de Coordinación Institucional",
    "Dirección de Seguimiento para la Consolidación del Servicio Profesional Docente",
    "Dirección de Operación y Seguimiento de los Procesos de Ingreso",
    "Dirección de Promoción en la Función y Horas Adicionales",
    "Dirección de Consolidación de Información en Educación Básica",
    "Dirección de Implementación de Incentivos",
    "Dirección de Promoción en Educación Media Superior",
    "Dirección de Evaluación del Desempeño",
    "Dirección de Procesos para la Permanencia",
    "Dirección de Sistemas de Información",
    "Dirección de Planeación y Administración"
  ];
  const generarReportePorArea = (area: string) => {
    // Tomamos todos los registros de la base de incidencias global
    const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    
    // Filtramos los registros que correspondan a la unidad de adscripción o área seleccionada
    const incidenciasArea = todasLasIncidencias.filter((e: any) => {
      const adscripcion = (e.unidadAdscripcion || e.departamento || e.area || "").toUpperCase();
      return adscripcion.includes(area.toUpperCase());
    });

    // Contadores específicos por tipo de incidencia solicitada
    let omisionEntrada = 0;
    let omisionSalida = 0;
    let retardoMenor = 0;
    let retardoMayor = 0;
    let comisionEntrada = 0;
    let comisionSalida = 0;
    let comisionTodoElDia = 0;
    let permisoEconomico = 0;
    let vac1er = 0;
    let vac2do = 0;
    let vacExtra = 0;
    let licenciaMedica = 0;
    let cuidadosMatPaternos = 0;
    let constanciaMedica = 0;

    incidenciasArea.forEach((e: any) => {
      const inc = (e.incidencia || e.tipo || "").toUpperCase();
      if (inc.includes("OMISIÓN DE ENTRADA")) omisionEntrada++;
      else if (inc.includes("OMISIÓN DE SALIDA")) omisionSalida++;
      else if (inc.includes("RETARDO MENOR")) retardoMenor++;
      else if (inc.includes("RETARDO MAYOR")) retardoMayor++;
      else if (inc.includes("ENTRADA POR COMISIÓN")) comisionEntrada++;
      else if (inc.includes("SALIDA POR COMISIÓN")) comisionSalida++;
      else if (inc.includes("COMISIÓN TODO EL DIA")) comisionTodoElDia++;
      else if (inc.includes("PERMISO ECONÓMICO")) permisoEconomico++;
      else if (inc.includes("1ER PERÍODO")) vac1er++;
      else if (inc.includes("2DO PERÍODO")) vac2do++;
      else if (inc.includes("EXTRAORDINARIAS")) vacExtra++;
      else if (inc.includes("LICENCIA MÉDICA")) licenciaMedica++;
      else if (inc.includes("CUIDADOS MATERNOS")) cuidadosMatPaternos++;
      else if (inc.includes("CONSTANCIA MÉDICA")) constanciaMedica++;
    });

    const totalPermisos = omisionEntrada + omisionSalida + retardoMenor + retardoMayor + comisionEntrada + comisionSalida + comisionTodoElDia + permisoEconomico + vac1er + vac2do + vacExtra + licenciaMedica + cuidadosMatPaternos + constanciaMedica;

    // Estructura del reporte en CSV
    const rows = [
      ["REPORTE ESTADÍSTICO DE INCIDENCIAS POR ÁREA - USICAMM"],
      [`ÁREA / DIRECCIÓN: ${area.toUpperCase()}`],
      [`FECHA DE EMISIÓN: ${new Date().toLocaleDateString()}`],
      [`TOTAL DE INCIDENCIAS REGISTRADAS: ${totalPermisos}`],
      [],
      ["TIPO DE INCIDENCIA / PERMISO", "TOTAL REGISTRADOS"],
      ["OMISIÓN DE ENTRADA", omisionEntrada],
      ["OMISIÓN DE SALIDA", omisionSalida],
      ["RETARDO MENOR", retardoMenor],
      ["RETARDO MAYOR", retardoMayor],
      ["ENTRADA POR COMISIÓN", comisionEntrada],
      ["SALIDA POR COMISIÓN", comisionSalida],
      ["COMISIÓN TODO EL DIA", comisionTodoElDia],
      ["PERMISO ECONÓMICO", permisoEconomico],
      ["VACACIONES: 1ER PERÍODO", vac1er],
      ["VACACIONES: 2DO PERÍODO", vac2do],
      ["VACACIONES EXTRAORDINARIAS", vacExtra],
      ["LICENCIA MÉDICA", licenciaMedica],
      ["CUIDADOS MATERNOS / PATERNOS", cuidadosMatPaternos],
      ["CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA", constanciaMedica],
      [],
      ["DETALLE DE TRÁMITES EN ESTE ÁREA"],
      ["FOLIO", "EMPLEADO", "INCIDENCIA", "ESTATUS", "FECHA"]
    ];

    incidenciasArea.forEach((e: any) => {
      const nombreEmp = `${e.paterno || ""} ${e.materno || ""} ${e.nombre || e.nombreEmpleado || ""}`.trim() || "SERVIDOR PÚBLICO";
      rows.push([
        `"${e.folioDigital || e.folio || 'N/A'}"`,
        `"${nombreEmp}"`,
        `"${e.incidencia || e.tipo || 'N/A'}"`,
        `"${e.estado || e.estatusActual || 'PENDIENTE'}"`,
        `"${e.fecha || e.fechaRegistro || 'N/A'}"`
      ]);
    });

    const content = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const nombreArchivoLimpieza = area.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
    link.setAttribute("download", `REPORTE_AREA_${nombreArchivoLimpieza}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setVerModalAreaReporte(false);
    alert(`¡Reporte de "${area}" generado y descargado con éxito!`);
  };
  const abrirHistorialAnuncios = () => {
    const anuncios = JSON.parse(localStorage.getItem('lista_anuncios') || '[]');
    setListaAnunciosGuardados(anuncios);
    setMostrarModalHistorialAnuncios(true);
  };
  // Estados y función para el botón Subir Anuncio (Jefe)
  const [mostrarModalSubirAviso, setMostrarModalSubirAviso] = useState(false);
  const [tituloInput, setTituloInput] = useState("");
  const [tipoInput, setTipoInput] = useState("comunicado");
  const [fechaInicioInput, setFechaInicioInput] = useState("");
  const [fechaExpInput, setFechaExpInput] = useState("");
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null);
const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivoPreview(file.name);
    }
  };

const handlePublicarAnuncio = () => {
    if (!tituloInput.trim() || !fechaExpInput) {
      alert("Por favor completa el título y la fecha de vigencia.");
      return;
    }

    const input = document.getElementById('inputArchivoAviso') as HTMLInputElement;
    const file = input?.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;

        const nuevoAnuncio = {
          id: Date.now(),
          titulo: tituloInput,
          tipo: tipoInput,
          fechaInicio: fechaInicioInput,
          fechaExpiracion: fechaExpInput,
          archivo: file.name,
          archivoUrl: base64Data // <--- AQUÍ SE GUARDA EL ARCHIVO EN BASE64
        };

        const anunciosActuales = JSON.parse(localStorage.getItem('lista_anuncios') || '[]');
        localStorage.setItem('lista_anuncios', JSON.stringify([nuevoAnuncio, ...anunciosActuales]));
        
        alert("¡Anuncio publicado correctamente con archivo!");
        setMostrarModalSubirAviso(false);
        setTituloInput("");
        setFechaInicioInput("");
        setFechaExpInput("");
        setArchivoPreview(null);
        if (input) input.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      const nuevoAnuncio = {
        id: Date.now(),
        titulo: tituloInput,
        tipo: tipoInput,
        fechaInicio: fechaInicioInput,
        fechaExpiracion: fechaExpInput,
        archivo: archivoPreview || "Documento_Oficial",
        archivoUrl: ""
      };

      const anunciosActuales = JSON.parse(localStorage.getItem('lista_anuncios') || '[]');
      localStorage.setItem('lista_anuncios', JSON.stringify([nuevoAnuncio, ...anunciosActuales]));
      
      alert("¡Anuncio publicado correctamente!");
      setMostrarModalSubirAviso(false);
      setTituloInput("");
      setFechaInicioInput("");
      setFechaExpInput("");
      setArchivoPreview(null);
    }
  };
  const router = useRouter();
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [busqueda, setBusqueda] = useState("");
const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
const [verNotis, setVerNotis] = useState(false);
const INCIDENCIAS_AUTOMATICAS = ["LICENCIA MÉDICA", "CUIDADOS MATERNOS/PATERNOS", "CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA"];
// Agrega esto arriba con tus otros estados
const [rechazandoFolio, setRechazandoFolio] = useState(null);
const [motivoEscrito, setMotivoEscrito] = useState("");
const [acuseSeleccionado, setAcuseSeleccionado] = useState(null);
const [montado, setMontado] = useState(false);
useEffect(() => {
  setMontado(true);
}, []);


const [empleados, setEmpleados] = useState<any[]>([]);

  // Efecto para cargar los datos de localStorage y escuchar cuando el Jefe mande un trámite
 // Efecto para cargar los datos de localStorage y escuchar cuando el Jefe mande un trámite
  useEffect(() => {
    const cargarDatos = () => {
      const guardado = localStorage.getItem('base_incidencias');
      console.log("Datos leídos de base_incidencias en RH:", guardado); // <-- Añade esto
      if (guardado) {
        try {
          const datosParseados = JSON.parse(guardado);
          setEmpleados(datosParseados);
        } catch (e) {
          console.error("Error al leer base_incidencias", e);
        }
      }
    };
    cargarDatos();

    // Escuchamos los eventos de sincronización del Jefe
    window.addEventListener("storage", cargarDatos);
    window.addEventListener("actualizar-tabla-rh", cargarDatos as EventListener);

    return () => {
      window.removeEventListener("storage", cargarDatos);
      window.removeEventListener("actualizar-tabla-rh", cargarDatos as EventListener);
    };
  }, []);
   const confirmarEliminacionManual = () => {
    const inputPrompt = prompt("INGRESE FOLIO, ID O NOMBRE PARA NEGAR ACCESO:");
    if (!inputPrompt) return;

    const busq = inputPrompt.toUpperCase().trim();

    // Buscamos en el estado actual de empleados
    const existe = empleados.find(e => {
      const f = String(e.folio || e.folioDigital || "").toUpperCase();
      const ident = String(e.id || e.id_empleado || e.matricula || "").toUpperCase();
      const nom = String(e.nombre || e.nombreEmpleado || "").toUpperCase();
      return f === busq || ident === busq || nom.includes(busq);
    });

    if (existe) {
      const nombreEmpleado = existe.nombre || existe.nombreEmpleado || "REGISTRO";
      if (confirm(`¿CONFIRMA LA BAJA DE: ${nombreEmpleado}?`)) {
        // Obtenemos el identificador único para borrarlo de la base de datos local
        const idUnico = existe.id || existe.id_empleado || existe.folioDigital || existe.folio;

        // Filtramos el arreglo actual eliminando el registro
        const nuevaLista = empleados.filter(e => 
          (e.id || e.id_empleado || e.folioDigital || e.folio) !== idUnico
        );

        // Actualizamos el estado de React
        setEmpleados(nuevaLista);

        // Actualizamos de manera permanente el localStorage
        localStorage.setItem('base_incidencias', JSON.stringify(nuevaLista));

        // Añadimos a la lista negra de eliminados 'alv' por seguridad
        const borradosActuales = JSON.parse(localStorage.getItem('incidencias_borradas_alv') || '[]');
        localStorage.setItem('incidencias_borradas_alv', JSON.stringify([...borradosActuales, idUnico]));

        alert("ACCESO NEGADO Y REGISTRO ELIMINADO EXITOSAMENTE.");
      }
    } else {
      alert("NO SE ENCONTRÓ EL USUARIO EN LA LISTA ACTUAL.");
    }
  };

  // --- NUEVOS ESTADOS PARA REGISTROS ---
  // --- NUEVOS ESTADOS PARA REGISTROS ---
  const [verModalRegistros, setVerModalRegistros] = useState(false);
  const [registrosNuevos, setRegistrosNuevos] = useState<any[]>([]);

  // Sincronizamos con el localStorage al cargar la página y escuchar eventos
  useEffect(() => {
    const cargarRegistros = () => {
      const guardados = JSON.parse(localStorage.getItem("registros_nuevos_usuarios") || "[]");
      setRegistrosNuevos(guardados);
    };

    cargarRegistros();
    window.addEventListener("storage", cargarRegistros);
    return () => window.removeEventListener("storage", cargarRegistros);
  }, []);

  // --- ESTADO PARA HISTORIAL ---
  const [verHistorial, setVerHistorial] = useState(false);
  const [historialData, setHistorialData] = useState([
    { folio: "150", id: "SP-6150", nombre: "JUANITA PÉREZ GARCÍA", incidencia: "VACACIONES: 1ER PERÍODO", estatus: "FINALIZADO", fecha: "2026-01-15" },
    { folio: "089", id: "SP-6150", nombre: "JUANITA PÉREZ GARCÍA", incidencia: "LICENCIA MÉDICA", estatus: "ARCHIVADO", fecha: "2025-11-02" },
    { folio: "045", id: "SP-6150", nombre: "JUANITA PÉREZ GARCÍA", incidencia: "OMISIÓN DE SALIDA", estatus: "RECHAZADO", fecha: "2025-09-10" }
  ]);

  const catalogo = [
    "OMISIÓN DE ENTRADA", "OMISIÓN DE SALIDA", "RETARDO MENOR", "RETARDO MAYOR",
    " ENTRADA POR COMISIÓN", "SALIDA POR COMISIÓN","COMISIÓN TODO EL DIA",
     "PERMISO ECONÓMICO",
    "VACACIONES: 1ER PERÍODO", "VACACIONES: 2DO PERÍODO", "VACACIONES: EXTRAORDINARIAS",
    "LICENCIA MÉDICA", "CUIDADOS MATERNOS/PATERNOS", "CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA"
  ];
const listaFiltrada = useMemo(() => {
    // Tomamos la fuente base de empleados o el localStorage global si existe
    const datosGlobales = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("base_incidencias") || "[]") : [];
    const base = datosGlobales.length > 0 ? datosGlobales : empleados;

    return base.filter((e) => {
      const valorIncidencia = String(e.incidencia || e.tipo || "").toUpperCase();
      const filtroSel = String(tipoFiltro || "").toUpperCase();

      const cumpleCategoria = tipoFiltro === "TODOS" || 
        valorIncidencia === filtroSel || 
        valorIncidencia.includes(filtroSel) || 
        filtroSel.includes(valorIncidencia) ||
        (filtroSel.includes("1ER") && valorIncidencia.includes("1ER")) || 
        (filtroSel.includes("2DO") && valorIncidencia.includes("2DO")) || 
        (filtroSel.includes("OMISION DE SALIDA") && valorIncidencia.includes("OMISION DE SALIDA"));

      const textoBusqueda = busqueda.toLowerCase();
      const cumpleBusqueda = !busqueda || 
        (e.nombre && e.nombre.toLowerCase().includes(textoBusqueda)) || 
        (e.nombreEmpleado && e.nombreEmpleado.toLowerCase().includes(textoBusqueda)) || 
        (e.id && String(e.id).toLowerCase().includes(textoBusqueda)) ||
        (e.folioDigital && String(e.folioDigital).toLowerCase().includes(textoBusqueda));

      return cumpleCategoria && cumpleBusqueda;
    });
  }, [empleados, tipoFiltro, busqueda]);
interface Notificacion {
  id: number;
  txt: string;
  hora: string;
}
const manejarAccion = (valorFolio: string, tipo: 'AUTORIZADO' | 'RECHAZADO') => {
    // Definimos el estatus que verá el Jefe
    const decisionFinal = tipo === 'AUTORIZADO' ? 'VALIDADO POR RH' : 'RECHAZADO POR RH';

    const emp = empleados.find(e => (e.folioDigital || e.folio) === valorFolio);
    if (!emp) {
      alert("No se encontró el registro con ese folio");
      return;
    }

    // 1. Actualizamos el estado en la base global (localStorage) para que el Jefe lo vea reflejado
    const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    const index = todasLasIncidencias.findIndex((item: any) => (item.folioDigital || item.folio || item.id) === valorFolio);

    if (index !== -1) {
      todasLasIncidencias[index].estatus = decisionFinal;
      todasLasIncidencias[index].estado = decisionFinal;
      localStorage.setItem("base_incidencias", JSON.stringify(todasLasIncidencias));
    }

    // 2. Quitamos el registro de la vista de PENDIENTES de RH (porque RH ya lo atendió)
    const listaActualizada = empleados.filter(e => (e.folioDigital || e.folio || e.id) !== valorFolio);
    setEmpleados(listaActualizada);

    // 3. Sincronizamos con el jefe y almacenamiento local
    window.dispatchEvent(new CustomEvent("actualizar-tabla-jefe"));
    window.dispatchEvent(new Event("storage"));

    setNotificaciones((prev: Notificacion[]) => [
      { id: Date.now(), txt: `${decisionFinal}: ${emp.nombre || emp.nombreEmpleado}`, hora: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };
  const procesarNuevoRegistro = (indexAProcesar: number, decision: string) => {
  // 1. Obtenemos los registros actuales del localStorage
  const actual = JSON.parse(localStorage.getItem("registros_nuevos_usuarios") || "[]");

  // 2. Filtramos la lista eliminando exactamente el renglón (índice) donde se dio clic
  const actualizados = actual.filter((_: any, idx: number) => idx !== indexAProcesar);

  // 3. Guardamos la nueva lista en el localStorage
  localStorage.setItem("registros_nuevos_usuarios", JSON.stringify(actualizados));

  // 4. Actualizamos el estado visual para que desaparezca al instante
  setRegistrosNuevos(actualizados);

  alert(`Registro ${decision} con éxito.`);
};
  const descargarExcel = () => {
    const rows = [
      ["GESTIÓN DE RH - REPORTE "],
      [`FECHA: ${fechaReporte}`],
      ["FOLIO", "ID", "NOMBRE", "INCIDENCIA", "ESTATUS"]
    ];
    listaFiltrada.forEach(e => rows.push([e.folio, e.id, e.nombre, e.incidencia, e.estatusActual]));
    const content = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", `REPORTE_CAPITAL_HUMANO_${fechaReporte}.csv`);
document.body.appendChild(link); 
link.click();
document.body.removeChild(link); // Limpiamos el DOM
URL.revokeObjectURL(url);
  };

  const salirSistema = () => {
    if(confirm("¿ESTÁ SEGURO QUE DESEA CERRAR LA SESIÓN?")) {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans uppercase">
      <div className="max-w-[1600px] mx-auto bg-white border-t-[12px] border-[#691C32] shadow-2xl rounded-b-3xl overflow-hidden flex flex-col border-x border-b border-gray-200">
        
        {/* HEADER */}
        <header className="p-8 border-b-4 border-[#BC955C] flex justify-between items-center bg-white relative">
          <img src="/logo-sep.png" alt="SEP" className="h-16 w-auto object-contain" />
          <div className="text-center">
            <h1 className="text-3xl font-black text-black tracking-tighter">Sistema Integral de Incidencias de Personal
</h1>
            <p className="text-black font-black tracking-[10px] text-xs"></p>
          </div>
          <div className="flex items-center gap-6">
            <img src="/logo-usicamm.png" alt="USICAMM" className="h-16 w-auto object-contain" />
            <button onClick={() => router.push('/roles')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
              <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-[#BC955C] transition-all duration-500">
                <span className="text-xl group-hover:scale-125 transition-transform duration-500">◀️</span>
              </div>
              <span className="text-[7px] font-black text-slate-400 group-hover:text-[#BC955C] uppercase tracking-[0.2em]">Regresar</span>
            </button>
            <button onClick={salirSistema} className="group relative flex flex-col items-center gap-1 transition-all duration-300 focus:outline-none">
              <div className="relative w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm group-hover:border-red-500 transition-all duration-500">
                <span className="text-xl group-hover:translate-x-1 transition-transform duration-500">🚪</span>
              </div>
              <span className="text-[7px] font-black text-slate-400 group-hover:text-red-500 uppercase tracking-[0.2em]">Salir</span>
            </button>
          </div>
          
        </header>
{/* PANEL DE CONTROLES */}
        <div className="bg-[#f8f9fa] p-8 grid grid-cols-1 md:grid-cols-5 gap-6 border-b border-gray-200 items-end">
          
          {/* PERIODO (DEL / AL) EN LUGAR DE FECHA DE CORTE */}
          <div className="space-y-2">
            <label className="text-[10px] text-black font-black tracking-widest uppercase">Del (Periodo):</label>
            <input 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              className="w-full bg-white text-black border-2 border-black p-3 text-xs font-bold outline-none focus:ring-2 ring-[#BC955C]" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-black font-black tracking-widest uppercase">Al (Periodo):</label>
            <input 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              className="w-full bg-white text-black border-2 border-black p-3 text-xs font-bold outline-none focus:ring-2 ring-[#BC955C]" 
            />
          </div>          
          <div className="space-y-2">
            <label className="text-[10px] text-black font-black tracking-widest">INCIDENCIA:</label>
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="w-full bg-white text-black border-2 border-black p-3 text-sm font-bold outline-none focus:ring-2 ring-[#BC955C]">
<option value="TODOS">TODAS LAS INCIDENCIAS</option>              {catalogo.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            
            <label className="text-[10px] text-black font-black tracking-widest">BUSCADOR:</label>
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value.toUpperCase())} className="w-full bg-white text-black border-2 border-black p-3 text-sm font-bold outline-none focus:ring-2 ring-[#BC955C]" placeholder="BUSCAR POR FOLIO O NOMBRE..." />
          </div>
          
          {/* ========================================================================= */}
{/* BOTÓN Y VENTANA EMERGENTE (MODAL) DE "SUBIR ANUNCIO"                      */}
{/* ========================================================================= */}
<button
  type="button"
  onClick={() => {
    const anunciosTotales = JSON.parse(localStorage.getItem('lista_anuncios') || '[]');
    setListaAnunciosGuardados(anunciosTotales);
    setMostrarModalHistorialAnuncios(true);
  }}
  className="w-full bg-white text-gray-800 font-black py-3 px-2 transition-all border border-gray-300 rounded-xl hover:border-[#BC955C] hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 text-xs"
  title="Ver historial de anuncios publicados"
>
  <span className="text-sm">📋✨</span>
  <span className="font-extrabold tracking-wide uppercase">Historial</span>
</button>
{/* MODAL / VENTANA FLOTANTE: HISTORIAL DE ANUNCIOS */}
{mostrarModalHistorialAnuncios && (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[160] flex items-center justify-center p-4">
    <div className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full p-8 relative border border-slate-100 max-h-[85vh] flex flex-col">
      
      {/* Encabezado del Modal */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 shrink-0">
        <div>
          <span className="text-[10px] font-black tracking-[.2em] text-[#691C32] uppercase">Panel Directivo</span>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋✨</span> Historial de Anuncios Publicados
          </h3>
        </div>
        <button 
          type="button" 
          onClick={() => setMostrarModalHistorialAnuncios(false)} 
          className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2 py-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Contenido / Listado de Anuncios */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {listaAnunciosGuardados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-2">📭</span>
            <p className="font-bold text-sm">No se ha publicado ningún anuncio todavía.</p>
          </div>
        ) : (
          listaAnunciosGuardados.map((anuncio: any) => (
            <div 
              key={anuncio.id} 
              className="p-5 rounded-2xl border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    anuncio.tipo === 'urgente' ? 'bg-red-100 text-red-700' :
                    anuncio.tipo === 'evento' ? 'bg-blue-100 text-blue-700' :
                    anuncio.tipo === 'politica' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {anuncio.tipo}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    Vigencia: {anuncio.fechaInicio || 'N/A'} al {anuncio.fechaExpiracion || 'N/A'}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-800">{anuncio.titulo}</h4>
                <p className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                  📁 Archivo: <span className="text-slate-700">{anuncio.archivo}</span>
                </p>
              </div>

              {/* Botones de Descarga y Borrado */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {anuncio.archivoUrl && (
                  <a
                    href={anuncio.archivoUrl}
                    download={anuncio.archivo}
                    className="px-3 py-1.5 bg-[#691C32] text-white rounded-lg text-[10px] font-black hover:bg-[#521326] transition shadow-sm"
                  >
                    📥 Descargar
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el anuncio "${anuncio.titulo}"?`)) {
                      const nuevosAnuncios = listaAnunciosGuardados.filter(a => a.id !== anuncio.id);
                      localStorage.setItem('lista_anuncios', JSON.stringify(nuevosAnuncios));
                      setListaAnunciosGuardados(nuevosAnuncios);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black transition"
                  title="Eliminar de historial"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie del Modal */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end shrink-0">
        <button 
          type="button" 
          onClick={() => setMostrarModalHistorialAnuncios(false)} 
          className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md"
        >
          Cerrar
        </button>
      </div>

    </div>
  </div>
)}
{/* 1. EL BOTÓN (Colócalo al lado del botón verde de Excel ajustando tu grid a md:grid-cols-5) */}
<div className="flex items-end">
  <button
    type="button"
    onClick={() => setMostrarModalSubirAviso(true)}
    className="w-full bg-white text-gray-800 font-black py-3 px-3 transition-all border border-gray-300 rounded-xl hover:border-[#691C32] hover:shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-xs"
    title="Panel Directivo: Publicar nuevo aviso"
  >
    <span className="text-sm text-[#691C32]">📢</span>
    <span className="font-extrabold tracking-wide uppercase">Subir Anuncio</span>
  </button>
</div>

{/* 2. LA VENTANA EMERGENTE (MODAL) (Colócala al final de tu archivo, antes del último cierre de contenedor) */}
{mostrarModalSubirAviso && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
    <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 relative border border-slate-100">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-[10px] font-black tracking-[.2em] text-[#691C32] uppercase">Panel Directivo</span>
          <h3 className="text-xl font-bold text-gray-900">Subir Aviso o Archivo General</h3>
        </div>
        <button 
          type="button" 
          onClick={() => setMostrarModalSubirAviso(false)} 
          className="text-gray-400 hover:text-gray-600 font-bold text-xl px-2 py-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título del Anuncio</label>
          <input 
            type="text" 
            value={tituloInput} 
            onChange={(e) => setTituloInput(e.target.value)} 
            placeholder="Ej. Circular general..." 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] text-sm text-gray-800" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo</label>
          <select 
            value={tipoInput} 
            onChange={(e) => setTipoInput(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] text-sm text-gray-800 bg-white"
          >
            <option value="comunicado">Comunicado</option>
            <option value="urgente">Urgente</option>
            <option value="evento">Evento</option>
            <option value="politica">Normativa / Política</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Inicio *</label>
            <input 
              type="date" 
              value={fechaInicioInput} 
              onChange={(e) => setFechaInicioInput(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] text-sm text-gray-800" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Fin *</label>
            <input 
              type="date" 
              value={fechaExpInput} 
              onChange={(e) => setFechaExpInput(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] text-sm text-gray-800" 
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Adjuntar Archivo</label>
          <input 
  id="inputArchivoAviso"
  type="file" 
  onChange={handleArchivoChange} 
  className="w-full text-xs text-gray-500..."
/>          {archivoPreview && (
            <p className="text-[11px] text-emerald-600 mt-1.5 font-bold">✓ Archivo cargado correctamente</p>
          )}
        </div>
      </div>

      {/* Botones de acción del modal */}
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
        <button 
          type="button" 
          onClick={() => setMostrarModalSubirAviso(false)} 
          className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          type="button" 
          onClick={handlePublicarAnuncio} 
          className="px-5 py-2.5 bg-[#691C32] hover:bg-[#521326] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#691C32]/30 transition cursor-pointer"
        >
          Publicar Anuncio
        </button>
      </div>

    </div>
  </div>
)}
{/* BOTÓN REPORTES */}
<div className="flex items-end">
  <button
    type="button"
    onClick={() => setVerModalAreaReporte(true)}
    className="w-full bg-[#BC955C] hover:bg-[#a67c45] text-white font-black py-3 px-3 transition-all border border-black rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs cursor-pointer"
    title="Generar reportes estadísticos por área"
  >
    <span className="text-sm">📊</span>
    <span className="font-extrabold tracking-wide uppercase">Reportes</span>
  </button>
</div>
{/* MODAL DE REPORTES POR ÁREA */}
{verModalAreaReporte && (
  <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
    <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full p-8 relative border border-slate-200">
      
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#691C32] uppercase">Panel de Estadísticas</span>
          <h3 className="text-xl font-black text-gray-900">Reportes de Incidencias por Área</h3>
        </div>
        <button 
          onClick={() => setVerModalAreaReporte(false)} 
          className="text-gray-400 hover:text-red-600 font-black text-xl px-3 py-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
        <label className="block text-xs font-bold text-gray-700 uppercase">Seleccione una Dirección General o de Área:</label>
        <select 
          id="selectAreaReporte"
          className="w-full px-4 py-3 border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-[#691C32] text-xs font-bold text-gray-900 bg-white"
          defaultValue=""
        >
          <option value="" disabled>-- SELECCIONE UN ÁREA --</option>
          
          <optgroup label="DIRECCIONES GENERALES">
            <option value="Dirección General de Admisión">1. Dirección General de Admisión</option>
            <option value="Dirección General de Promoción">2. Dirección General de Promoción</option>
            <option value="Dirección General de Reconocimiento">3. Dirección General de Reconocimiento</option>
            <option value="Dirección General de Administración">4. Dirección General de Administración</option>
          </optgroup>

          <optgroup label="DIRECCIONES DE ÁREA">
            <option value="Dirección de Coordinación Institucional">1. Dirección de Coordinación Institucional</option>
            <option value="Dirección de Seguimiento para la Consolidación">2. Dirección de Seguimiento para la Consolidación del Servicio Profesional Docente</option>
            <option value="Dirección de Operación y Seguimiento de los Procesos">3. Dirección de Operación y Seguimiento de los Procesos de Ingreso</option>
            <option value="Dirección de Promoción en la Función y Horas Adicionales">4. Dirección de Promoción en la Función y Horas Adicionales</option>
            <option value="Dirección de Consolidación de Información en Educación Básica">5. Dirección de Consolidación de Información en Educación Básica</option>
            <option value="Dirección de Implementación de Incentivos">6. Dirección de Implementación de Incentivos</option>
            <option value="Dirección de Promoción en Educación Media Superior">7. Dirección de Promoción en Educación Media Superior</option>
            <option value="Dirección de Evaluación del Desempeño">8. Dirección de Evaluación del Desempeño</option>
            <option value="Dirección de Procesos para la Permanencia">9. Dirección de Procesos para la Permanencia</option>
            <option value="Dirección de Sistemas de Información">10. Dirección de Sistemas de Información</option>
            <option value="Dirección de Planeación y Administración">11. Dirección de Planeación y Administración</option>
          </optgroup>
        </select>
        <p className="text-[10px] text-slate-500 font-bold">
          * El reporte incluirá el desglose y conteo exacto de omisiones, retardos, comisiones, permisos económicos, periodos vacacionales y licencias médicas del área seleccionada.
        </p>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
        <button 
          onClick={() => setVerModalAreaReporte(false)} 
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
        >
          Cancelar
        </button>
        <button 
          onClick={() => {
            const selectEl = document.getElementById('selectAreaReporte') as HTMLSelectElement;
            const areaElegida = selectEl?.value;
            if (!areaElegida) {
              alert("Por favor seleccione un área de la lista.");
              return;
            }

            // Lógica de conteo y generación del archivo CSV con los datos requeridos
            const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
            const incidenciasArea = todasLasIncidencias.filter((e: any) => {
              const adscripcion = (e.unidadAdscripcion || e.departamento || e.area || "").toUpperCase();
              return adscripcion.includes(areaElegida.toUpperCase());
            });

            let omisionEntrada = 0, omisionSalida = 0, retardoMenor = 0, retardoMayor = 0;
            let comisionEntrada = 0, comisionSalida = 0, comisionTodoElDia = 0, permisoEconomico = 0;
            let vac1er = 0, vac2do = 0, vacExtra = 0;
            let licenciaMedica = 0, cuidadosMatPaternos = 0, constanciaMedica = 0;

            incidenciasArea.forEach((e: any) => {
              const inc = (e.incidencia || e.tipo || "").toUpperCase();
              if (inc.includes("OMISIÓN DE ENTRADA")) omisionEntrada++;
              else if (inc.includes("OMISIÓN DE SALIDA")) omisionSalida++;
              else if (inc.includes("RETARDO MENOR")) retardoMenor++;
              else if (inc.includes("RETARDO MAYOR")) retardoMayor++;
              else if (inc.includes("ENTRADA POR COMISIÓN")) comisionEntrada++;
              else if (inc.includes("SALIDA POR COMISIÓN")) comisionSalida++;
              else if (inc.includes("COMISIÓN TODO EL DIA")) comisionTodoElDia++;
              else if (inc.includes("PERMISO ECONÓMICO")) permisoEconomico++;
              else if (inc.includes("1ER PERÍODO")) vac1er++;
              else if (inc.includes("2DO PERÍODO")) vac2do++;
              else if (inc.includes("EXTRAORDINARIAS")) vacExtra++;
              else if (inc.includes("LICENCIA MÉDICA")) licenciaMedica++;
              else if (inc.includes("CUIDADOS MATERNOS")) cuidadosMatPaternos++;
              else if (inc.includes("CONSTANCIA MÉDICA")) constanciaMedica++;
            });

            const totalGeneral = omisionEntrada + omisionSalida + retardoMenor + retardoMayor + comisionEntrada + comisionSalida + comisionTodoElDia + permisoEconomico + vac1er + vac2do + vacExtra + licenciaMedica + cuidadosMatPaternos + constanciaMedica;

            const rows = [
              ["REPORTE ESTADÍSTICO DE INCIDENCIAS - USICAMM"],
              [`ÁREA / DIRECCIÓN: ${areaElegida.toUpperCase()}`],
              [`FECHA DE CORTE: ${new Date().toLocaleDateString()}`],
              [`TOTAL DE INCIDENCIAS: ${totalGeneral}`],
              [],
              ["TIPO DE INCIDENCIA / PERMISO", "TOTAL REGISTRADOS"],
              ["OMISIÓN DE ENTRADA", omisionEntrada],
              ["OMISIÓN DE SALIDA", omisionSalida],
              ["RETARDO MENOR", retardoMenor],
              ["RETARDO MAYOR", retardoMayor],
              ["ENTRADA POR COMISIÓN", comisionEntrada],
              ["SALIDA POR COMISIÓN", comisionSalida],
              ["COMISIÓN TODO EL DIA", comisionTodoElDia],
              ["PERMISO ECONÓMICO", permisoEconomico],
              ["VACACIONES: 1ER PERÍODO", vac1er],
              ["VACACIONES: 2DO PERÍODO", vac2do],
              ["VACACIONES EXTRAORDINARIAS", vacExtra],
              ["LICENCIA MÉDICA", licenciaMedica],
              ["CUIDADOS MATERNOS / PATERNOS", cuidadosMatPaternos],
              ["CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA", constanciaMedica],
              [],
              ["DETALLE DE REGISTROS EN ESTE ÁREA"],
              ["FOLIO", "EMPLEADO", "INCIDENCIA", "ESTATUS", "FECHA"]
            ];

            incidenciasArea.forEach((e: any) => {
              const nombreEmp = `${e.paterno || ""} ${e.materno || ""} ${e.nombre || e.nombreEmpleado || ""}`.trim() || "SERVIDOR PÚBLICO";
              rows.push([
                `"${e.folioDigital || e.folio || 'N/A'}"`,
                `"${nombreEmp}"`,
                `"${e.incidencia || e.tipo || 'N/A'}"`,
                `"${e.estado || e.estatusActual || 'PENDIENTE'}"`,
                `"${e.fecha || e.fechaRegistro || 'N/A'}"`
              ]);
            });

            const content = "\uFEFF" + rows.map(r => r.join(",")).join("\n");
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const nombreArchivoLimpieza = areaElegida.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
            link.setAttribute("download", `REPORTE_${nombreArchivoLimpieza}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setVerModalAreaReporte(false);
            alert(`¡Reporte de "${areaElegida}" descargado correctamente con todas sus estadísticas!`);
          }} 
          className="px-6 py-2.5 bg-[#107C41] hover:bg-[#0E6235] text-white rounded-xl text-xs font-black shadow-lg transition cursor-pointer flex items-center gap-2"
        >
          📊 Descargar Excel
        </button>
      </div>

    </div>
  </div>
)}
          <div className="flex items-end">
<button onClick={descargarExcel} className="w-full bg-[#107C41] hover:bg-[#0E6235] text-white font-black py-3 transition-all shadow-[0px_0px_0px_#000000] border-1 border-black text-xs active:translate-y-1 active:shadow-none">📊</button></div>
        </div>

        {/* TABLA PRINCIPAL */}
        <div className="p-10 flex-grow bg-white relative">
          
          <div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-black text-black border-l-8 border-[#691C32] pl-4 italic uppercase">
  Pendientes de Validación ({
    listaFiltrada.filter((e) => {
      // 1. Descontamos los que ya fueron mandados a la lista negra del navegador
      const borradosAlv = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('incidencias_borradas_alv') || '[]' : '[]');
      if (borradosAlv.includes(e.id)) return false;

      // 2. Mantenemos tus filtros visuales originales
      return (e.estado === "AUTORIZADO POR JEFE" || e.estado === "RECHAZADO POR JEFE" || e.estado === "PENDIENTE") && 
             e.estado !== "ACEPTADO" && e.estado !== "RECHAZADO";
    }).length
  })
  
</h2>



            <div className="flex gap-4 items-center">
              <div className="flex gap-4 items-center"><button onClick={() => setVerHistorial(true)} className="bg-white hover:bg-yellow-50 text-black border-2 border-black px-4 py-2 text-[10px] font-black rounded-full flex items-center gap-2 shadow-[0px_0px_0px_#FFD700] transition-all active:scale-95 active:shadow-none">📁 HISTORIAL DE TRÁMITES</button><button onClick={confirmarEliminacionManual} className="bg-white hover:bg-red-50 text-[#000000] border-2 border-[#000000] px-4 py-2 text-[10px] font-black rounded-full flex items-center gap-2 shadow-[0px_0px_0px_#000000] transition-all active:scale-95 active:shadow-none">🚫 BAJA DE USUARIO</button><button onClick={() => setVerModalRegistros(true)} className="bg-white hover:bg-amber-50 text-[#000000] border-2 border-[#000000] px-4 py-2 text-[10px] font-black rounded-full flex items-center gap-2 shadow-[0px_0px_0px_#000000] transition-all active:scale-95 active:shadow-none">👤 REGISTROS NUEVOS <span className="bg-[#BC955C] text-white px-2 py-0.5 rounded-full font-black text-[9px]">{registrosNuevos.length}</span></button></div>
              <div className="relative cursor-pointer select-none" onClick={() => setVerNotis(!verNotis)}>
                <span className="text-4xl text-black hover:scale-110 transition-transform block">🔔</span>
                {notificaciones.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-black text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold animate-pulse">{notificaciones.length}</span>}
              </div>
            </div>
          </div>

          {/* NOTIFICACIONES */}
          {verNotis && (
            <div className="absolute right-10 top-24 w-80 bg-black border-4 border-black rounded-2xl shadow-[4px_4px_0px_#000] z-50 max-h-60 overflow-y-auto p-4">
              <p className="text-xs font-black border-b-2 border-black pb-2 mb-2">Historial de Acciones</p>
              {notificaciones.length === 0 ? <p className="text-[10px] text-gray-400 font-bold py-2">Sin movimientos recientes</p> : notificaciones.map(n => (
                <div key={n.id} className="text-[10px] font-bold border-b border-gray-100 py-1 flex justify-between">
                  <span>{n.txt}</span> <span className="text-gray-400 font-black">{n.hora}</span>
                </div>
              ))}
            </div>
          )}

          {/* MODAL HISTORIAL */}
          {verHistorial && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
              <div className="bg-white border-4 border-black w-full max-w-4xl rounded-3xl overflow-hidden shadow-[12px_12px_0px_#BC955C]">
                <div className="bg-[#691C32] text-white p-5 flex justify-between items-center">
                  <h3 className="font-black italic tracking-widest text-lg">EXPEDIENTE DIGITAL: PANEL GENERAL</h3>
                  <button onClick={() => setVerHistorial(false)} className="text-2xl font-black hover:text-black transition-colors">✕</button>
                </div>
                <div className="p-8">
                  <table className="w-full text-black">
                    <thead>
                      <tr className="border-b-4 border-black text-[11px] font-black uppercase text-black">
                        <th className="pb-3 text-left">FOLIO</th><th className="pb-3 text-left">TRÁMITE / INCIDENCIA</th><th className="pb-3 text-left">FECHA REGISTRO</th><th className="pb-3 text-center">ESTATUS FINAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-200">
                      {historialData.map((h, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-5 font-black text-lg">#{h.folio}</td>
                          <td className="py-5 font-black text-sm text-[#691C32]">{h.incidencia}</td>
                          <td className="py-5 font-black text-sm">{h.fecha}</td>
                          <td className="py-5 text-center">
                            <span className={`px-4 py-1 rounded-full text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_#000] ${h.estatus === 'FINALIZADO' ? 'bg-green-400' : h.estatus === 'RECHAZADO' ? 'bg-red-400' : 'bg-yellow-400'}`}>{h.estatus}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 p-6 border-t-2 border-black flex justify-center">
                  <button onClick={() => setVerHistorial(false)} className="bg-black text-white px-10 py-3 font-black text-xs hover:bg-[#691C32] transition-all shadow-[4px_4px_0px_#BC955C]">CERRAR EXPEDIENTE</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL REGISTROS NUEVOS */}
          {verModalRegistros && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
              <div className="bg-white border-4 border-black w-full max-w-2xl rounded-3xl overflow-hidden shadow-[10px_10px_0px_#6E0505]">
                <div className="bg-black text-white p-4 flex justify-between items-center">
                  <h3 className="font-black italic tracking-widest text-sm">SOLICITUDES DE ACCESO AL SISTEMA</h3>
                  <button onClick={() => setVerModalRegistros(false)} className="text-xl hover:text-red-500 transition-colors">✕</button>
                </div>
               <div className="p-6">
            <table className="w-full text-black">
              <thead>
                <tr className="border-b-2 border-black text-[10px] font-black uppercase text-gray-500">
                  <th className="pb-2 text-left w-1/4">FOLIO</th>
                  <th className="pb-2 text-left w-2/4">NOMBRE DEL SOLICITANTE</th>
                  <th className="pb-2 text-center w-1/4">ACCIONES</th>
                </tr>
              </thead>
<tbody className="divide-y divide-gray-100">
  {registrosNuevos.map((r, index) => (
    <tr key={index} className="hover:bg-gray-50">
      <td className="py-4 font-black text-slate-800">
        {r.folioDigital || r.folio || 'N/A'}
      </td>
      <td className="py-4 font-bold text-slate-700">
        {r.nombreEmpleado || r.nombre || 'SERVIDOR PÚBLICO'}
        <span className="block text-[9px] text-gray-400 font-black">{r.fechaReg || r.fecha}</span>
      </td>
      <td className="py-4 flex gap-2 justify-center">
        <button 
          onClick={() => procesarNuevoRegistro(index, 'ACEPTAR')} 
          className="bg-green-600 text-white px-3 py-1 rounded-md font-black text-[9px] shadow">
          ACEPTAR
        </button>
        <button 
          onClick={() => procesarNuevoRegistro(index, 'RECHAZAR')} 
          className="bg-red-600 text-white px-3 py-1 rounded-md font-black text-[9px] shadow">
          RECHAZAR
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
              </div>
            </div>
          )}
          
<button 
  onClick={() => {
    // 1. Tomamos exactamente las incidencias visibles en la tabla actual
    const pendientes = listaFiltrada.filter((e) => {
      const borradosAlv = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('incidencias_borradas_alv') || '[]' : '[]');
      if (borradosAlv.includes(e.id || e.folioDigital || e.folio)) return false;

      return (e.estado === "AUTORIZADO POR JEFE" || e.estado === "RECHAZADO POR JEFE" || e.estado === "PENDIENTE JEFE" || e.estado === "PENDIENTE" || e.estatus === "PENDIENTE" || !e.estado);
    });

    if (pendientes.length === 0) {
      alert("No hay registros pendientes que eliminar en la tabla.");
      return;
    }

    // 2. Pedimos confirmación antes de proceder con la eliminación masiva
    if (window.confirm(`¿Seguro que quieres eliminar las ${pendientes.length} incidencias de forma definitiva?`)) {
      
      // 3. Extraemos todos los identificadores únicos de estos registros
      const idsAExcluir = pendientes.map(e => e.id || e.id_empleado || e.folioDigital || e.folio);

      // 4. Los guardamos en la lista negra del localStorage para que no vuelvan a aparecer
      const guardados = JSON.parse(localStorage.getItem('incidencias_borradas_alv') || '[]');
      const nuevoHistorial = Array.from(new Set([...guardados, ...idsAExcluir]));
      localStorage.setItem('incidencias_borradas_alv', JSON.stringify(nuevoHistorial));

      // 5. Filtramos el arreglo de empleados actual para removerlos al instante de la pantalla
      const listaRestante = empleados.filter(item => {
        const idItem = item.id || item.id_empleado || item.folioDigital || item.folio;
        return !idsAExcluir.includes(idItem);
      });

      setEmpleados(listaRestante);
      localStorage.setItem('base_incidencias', JSON.stringify(listaRestante));

      alert("Registros eliminados correctamente de la vista.");
    }
  }} 
  className="flex items-center justify-center bg-[#4B5563] text-white border-2 border-black w-12 h-12 rounded-xl hover:bg-gray-700 transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none mb-4 cursor-pointer text-lg"
  title="Eliminar todos los pendientes visibles"
>
  🗑️
</button>          {/* RENDEREADO DE LA TABLA PRINCIPAL CON COLORES DINÁMICOS */}
          <div className="border-2 border-black rounded-3xl overflow-hidden shadow-sm max-h-[600px] overflow-y-auto">
            <table className="w-full text-[12px]">
              <thead className="bg-[#f0f0f0] text-black font-black sticky top-0 uppercase border-b-2 border-black z-10">
                <tr>
                  <th className="p-5 border-r border-black">FOLIO</th>
                  <th className="p-5 text-left border-r border-black">INCIDENCIA</th>
                  <th className="p-5 text-left border-r border-black">NOMBRE COMPLETO</th>
                  <th className="p-5 text-left border-r border-black">ID</th>
                  <th className="p-5 text-center border-r border-black">ESTATUS</th>
                  <th className="p-5 text-center">ACCIÓN</th>
                </tr>
              </thead>
<tbody className="divide-y divide-gray-300 text-black font-bold">
  {(() => {
const registrosFiltrados = listaFiltrada.filter((e) => {
    const borradosAlv = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('incidencias_borradas_alv') || '[]' : '[]');
    const idActual = e.id || e.id_empleado || e.folioDigital || e.folio;
    if (borradosAlv.includes(idActual)) return false;

    const estatus = (e.estado || e.estatusActual || "").toUpperCase();
    return (
      estatus === "" || 
      estatus === "PENDIENTE" || 
      estatus === "PENDIENTE JEFE" || 
      estatus === "PENDIENTE POR RH" || // <--- ESTA LÍNEA ASEGURA QUE NUNCA DESAPAREZCA PARA RH
      estatus === "AUTORIZADO POR JEFE" || 
      estatus === "RECHAZADO POR JEFE" || 
      !e.estado
    );
  });
    return registrosFiltrados.map((e, index) => {
      const nombreCompletoReal = `${e.paterno || e.Paterno || ""} ${e.materno || e.Materno || ""} ${e.nombre || e.nombres || e["nombre (s)"] || e["NOMBRE (S)"] || ""}`.trim().replace(/\s+/g, ' ') || e.nombreCompleto || "JOSE ALBERTO PACHECO CHAVEZ";

      // El folio es estrictamente consecutivo hacia abajo (001, 002, 003...)
      const folioConsecutivo = String(index + 1).padStart(3, '0');
      
      const miEstatus = e.estado || e.estatusActual || "PENDIENTE";
      const colorBorde = miEstatus === "RECHAZADO POR JEFE" ? "border-[#FF0000] text-[#FF0000] shadow-[#FF0000]" : "border-[#2DCC70] text-[#2DCC70] shadow-[#2DCC70]";

      return (
        <tr key={e.id ? `${e.id}-${index}` : index} className="hover:bg-gray-50 transition-colors">
          {/* 1. FOLIO (Consecutivo hacia abajo) */}
          <td className="p-5 text-center text-black font-black text-xl bg-gray-50 border-r border-gray-200">
            {folioConsecutivo}
          </td>
          
          {/* 2. INCIDENCIA */}
          <td className="p-5 border-r border-gray-200 text-center font-bold text-sm">
            {e.incidencia}
          </td>
          
          {/* 3. NOMBRE */}
          <td className="p-5 border-r border-gray-200 font-bold text-gray-900 uppercase">
            {nombreCompletoReal}
          </td>

          {/* 4. ID (Identificador o matrícula del empleado) */}
          <td className="p-5 border-r border-gray-200 text-center font-bold">
            {e.id || e.id_empleado || e.matricula || "2026-8745"}
          </td>

          {/* 5. ESTATUS */}
          <td className="p-5 border-r border-gray-200 text-center">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black bg-white border-2 shadow-[2px_2px_0px_#000] ${colorBorde}`}>
              {miEstatus}
            </span>
          </td>

          {/* 6. ACCIÓN */}
          <td className="p-5 flex justify-center gap-3 items-center">
            <button 
              onClick={() => manejarAccion(e.folioDigital || e.folio, 'AUTORIZADO')} 
              className="p-2 px-3 bg-white border border-slate-200 rounded-lg hover:bg-emerald-500 hover:text-white transition-all font-black text-[9px]"
            >
              ACEPTAR
            </button>
            <button 
              onClick={() => manejarAccion(e.folioDigital || e.folio, 'RECHAZADO')} 
              className="p-2 px-3 bg-white border border-slate-200 rounded-lg hover:bg-rose-500 hover:text-white transition-all font-black text-[9px]"
            >
              RECHAZAR
            </button>
            <button 
              onClick={() => setAcuseSeleccionado(e)} 
              className="p-2 px-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm font-black text-[9px]"
              title="Ver Acuse Oficial"
            >
              ABRIR 🔍
            </button>
          </td>
        </tr>
      );
    });
  })()}
</tbody>
            </table>
            {/* MODAL DEL ACUSE OFICIAL */}
{acuseSeleccionado && (
  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
      
      {/* Barra superior del modal */}
      <div className="bg-[#691C32] text-white p-4 px-6 flex justify-between items-center shrink-0">
        <span className="font-black text-xs tracking-widest uppercase">ACUSE OFICIAL DE INCIDENCIA</span>
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()} 
            className="bg-[#BC955C] text-white px-4 py-2 rounded-xl font-black text-[10px] hover:opacity-90 transition-all shadow cursor-pointer"
          >
            🖨️ IMPRIMIR / PDF
          </button>
          <button 
            onClick={() => setAcuseSeleccionado(null)} 
            className="bg-white/20 hover:bg-rose-600 text-white w-8 h-8 rounded-full font-black text-xs transition-all flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contenido del Acuse Oficial */}
      <div className="flex-1 p-8 overflow-y-auto uppercase text-slate-800 bg-white space-y-6">
        
        {/* Cabecera con Logos de SEP y USICAMM */}
        <div className="flex justify-between items-center border-b-2 border-[#691C32] pb-4">
          <div className="w-1/4">
            <img src="/logo-sep.png" alt="SEP" className="h-12 w-auto object-contain" />
          </div>
          <div className="text-center text-[8.5px] font-bold leading-tight flex-1">
            <p className="font-black">DIRECCIÓN GENERAL DE ADMINISTRACIÓN</p>
            <p>DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS</p>
            <p>SUBDIRECCIÓN DE RECURSOS HUMANOS Y ORGANIZACIÓN</p>
          </div>
          <div className="w-1/4 flex justify-end">
            <img src="/logo-usicamm.png" alt="USICAMM" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="text-right text-[10px] font-bold">
          <p>FECHA DE SOLICITUD: {acuseSeleccionado.fecha || new Date().toLocaleDateString()}</p>
          <p>FOLIO DIGITAL: {acuseSeleccionado.folioDigital || acuseSeleccionado.folio || 'N/A'}</p>
        </div>

        <h2 className="text-center font-black text-sm underline">FORMATO DE REGISTRO DE INCIDENCIA</h2>

        <div className="border border-[#691C32] rounded-lg overflow-hidden">
          <div className="bg-[#691C32] text-white px-3 py-1 text-[10px] font-black">DATOS DEL SERVIDOR PÚBLICO</div>
          <div className="p-4 text-[11px] grid grid-cols-2 gap-4">
            <div><strong>NOMBRE:</strong><br/>{acuseSeleccionado.nombreEmpleado || acuseSeleccionado.nombre || 'N/A'}</div>
            <div><strong>ID / CURP:</strong><br/>{acuseSeleccionado.id || 'N/A'}</div>
            <div className="col-span-2">
              <strong>UNIDAD DE ADSCRIPCIÓN:</strong><br/>
              {acuseSeleccionado.unidadAdscripcion || acuseSeleccionado.departamento || "DIRECCIÓN GENERAL DE ADMINISTRACIÓN"}
            </div>
          </div>
        </div>

        <div className="border border-[#691C32] rounded-lg overflow-hidden">
          <div className="bg-[#691C32] text-white px-3 py-1 text-[10px] font-black">TIPO DE INCIDENCIA SOLICITADA</div>
          <div className="p-4 text-[11px] space-y-3">
            <div><strong>INCIDENCIA:</strong><br/>{acuseSeleccionado.incidencia || acuseSeleccionado.tipo || 'N/A'}</div>
            <div><strong>MOTIVOS Y/O OBSERVACIONES:</strong><br/>{acuseSeleccionado.motivo || acuseSeleccionado.justificacion || 'SIN DESCRIPCIÓN'}</div>
          </div>
        </div>

        <div className="text-center text-[10px] border border-dashed border-slate-400 p-4 rounded-lg">
          Se turna al superior jerárquico para su validación y autorización.
        </div>
{/* 📄 VISOR INTELIGENTE: SOLO SE MUESTRA SI ES DE LOS 3 TIPOS Y TIENE UN PDF REAL */}
{acuseSeleccionado && (() => {
  const tipoIncidenciaActual = (acuseSeleccionado.incidencia || acuseSeleccionado.tipo || "").toUpperCase();
  
  // 1. Validamos que sea exclusivamente uno de los 3 tipos con permiso de PDF
  const esLicenciaValida = 
    tipoIncidenciaActual.includes("LICENCIA MÉDICA") || 
    tipoIncidenciaActual.includes("CUIDADOS MATERNOS") || 
    tipoIncidenciaActual.includes("CONSTANCIA MÉDICA");

  if (!esLicenciaValida) return null;

  let raw = acuseSeleccionado.pdfAdjunto || acuseSeleccionado.archivo || acuseSeleccionado.pdf || '';
  const folioActual = acuseSeleccionado.folioDigital || acuseSeleccionado.folio || '';
  
  let pdfUrlFinal = '';

  if (raw && !raw.startsWith('data:') && !raw.startsWith('http') && !raw.startsWith('blob:')) {
    try {
      const keys = ['incidencias', 'misIncidencias', 'registrosIncidencias', 'solicitudes', 'historialIncidencias', 'listaIncidencias'];
      for (const key of keys) {
        const dataStr = localStorage.getItem(key);
        if (dataStr) {
          const lista = JSON.parse(dataStr);
          if (Array.isArray(lista)) {
            const encontrado = lista.find(item => 
              (item.folio === folioActual || item.folioDigital === folioActual || item.pdfAdjunto === raw) &&
              item.pdfAdjunto && item.pdfAdjunto.startsWith('data:')
            );
            if (encontrado) {
              raw = encontrado.pdfAdjunto;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.error("Error buscando el PDF en el storage:", e);
    }
  }

  if (raw && typeof raw === 'string' && raw.startsWith('data:')) {
    try {
      const arr = raw.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      pdfUrlFinal = URL.createObjectURL(new Blob([u8arr], { type: mime }));
    } catch (e) {
      console.error("Error al convertir a Blob:", e);
    }
  } else if (raw && (raw.startsWith('http') || raw.startsWith('blob:'))) {
    pdfUrlFinal = raw;
  }

  const tienePdfReal = Boolean(pdfUrlFinal && (pdfUrlFinal.startsWith('blob:') || pdfUrlFinal.startsWith('http')));

  // 2. Si es uno de los 3 tipos pero NO mandaron PDF real, ocultamos el cuadro por completo para que no salga la advertencia
  if (!tienePdfReal) return null;

  return (
    <div className="border border-red-600 rounded-lg mb-6 overflow-hidden bg-red-50 p-4 text-center shadow-sm">
      <p className="font-black text-red-700 text-[11px] mb-3 uppercase tracking-wider">
        COMPROBANTE MÉDICO / LICENCIA ADJUNTO (PDF)
      </p>
      
      <div className="flex flex-col items-center gap-3">
        <button 
          type="button"
          onClick={() => window.open(pdfUrlFinal, '_blank')}
          className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-gray-800 transition-all shadow cursor-pointer"
        >
          📄 ABRIR COMPROBANTE PDF EN GRANDE
        </button>

        <div className="w-full h-96 border border-slate-300 bg-white rounded-lg overflow-hidden shadow-inner flex flex-col items-center justify-center">
          <iframe 
            src={pdfUrlFinal} 
            className="w-full h-full border-0" 
            title="Visor PDF Real" 
          />
        </div>
      </div>
    </div>
  );
})()}        <div className="text-center font-bold text-[11px] pt-8">
          <div className="w-72 border-b border-black mx-auto mb-2"></div>
          {acuseSeleccionado.nombreEmpleado || acuseSeleccionado.nombre || 'SERVIDOR PÚBLICO'}<br/>
          <span className="text-[9px] text-slate-500">FIRMA DEL SERVIDOR PÚBLICO</span>
        </div>
        
      </div>

    </div>
  </div>
)}
          </div>
        </div>

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
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SistemaCapitalHumanoV5() {
  const router = useRouter();
  
  const [listaAnuncios, setListaAnuncios] = useState<any[]>([]);
  const [mostrarModalSubirAviso, setMostrarModalSubirAviso] = useState(false);
  const [tituloInput, setTituloInput] = useState("");
  const [tipoInput, setTipoInput] = useState("comunicado");
  const [fechaInicioInput, setFechaInicioInput] = useState("");
  const [fechaExpInput, setFechaExpInput] = useState("");
  const [archivoPreview, setArchivoPreview] = useState("");

  const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light');
  const [acuseSeleccionado, setAcuseSeleccionado] = useState<any>(null);
  const [fechaReporte, setFechaReporte] = useState(new Date().toISOString().split('T')[0]);
  const [tipoFiltro, setTipoFiltro] = useState("TODOS");
  const [estatusFiltro, setEstatusFiltro] = useState("PENDIENTE");
  const [busqueda, setBusqueda] = useState("");

  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [verNotis, setVerNotis] = useState(false);
  const [motivoEscrito, setMotivoEscrito] = useState("");
  const [rechazandoFolio, setRechazandoFolio] = useState<any>(null);
  const [editandoFolio, setEditandoFolio] = useState<any>(null);
  
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<any>(null);
  const [verHistoricoJefe, setVerHistoricoJefe] = useState(false);
  const [empleados, setEmpleados] = useState<any[]>([]);

  const historialJefe = [
    { fecha: "2026-05-10", tipo: "OMISIÓN DE ENTRADA POR COMISIÓN", status: "AUTORIZADO", nota: "Visita a sede regional" },
    { fecha: "2026-04-22", tipo: "PERMISO ECONÓMICO", status: "AUTORIZADO", nota: "Trámites personales" },
    { fecha: "2026-03-15", tipo: "VACACIONES: 1ER PERÍODO", status: "AUTORIZADO", nota: "Periodo vacacional" }
  ];

  const catalogo = [
    "OMISIÓN DE ENTRADA", "OMISIÓN DE SALIDA", "RETARDO MENOR", "RETARDO MAYOR",
    "ENTRADA POR COMISIÓN", "SALIDA POR COMISIÓN",
    "COMISIÓN TODO EL DIA", "PERMISO ECONÓMICO",
    "VACACIONES: 1ER PERÍODO", "VACACIONES: 2DO PERÍODO",
    "LICENCIA MÉDICA", "CUIDADOS MATERNOS/PATERNOS",
    "CONSTANCIA MÉDICA DE TIEMPO DE CONSULTA"
  ];

  const MOTIVOS_RECHAZO = [
    "DOCUMENTACIÓN ILEGIBLE", "FALTA DE FIRMA AUTÓGRAFA",
    "PERIODO EXCEDE EL LÍMITE", "CERTIFICADO MÉDICO SIN SELLO",
    "ERROR EN ID DE SERVIDOR PÚBLICO", "SOLICITUD EXTEMPORÁNEA"
  ];

  // ==========================================
  // EFECTOS Y PERSISTENCIA
  // ==========================================
  useEffect(() => {
    const guardados = localStorage.getItem("avisos_institucionales");
    if (guardados) {
      try {
        setListaAnuncios(JSON.parse(guardados));
      } catch (e) {
        console.error("Error al cargar avisos", e);
      }
    }
  }, []);

  const agregarNotificacion = (msg: string, tipo: string) => {
    const color = tipo === 'AUTORIZADO' ? 'text-emerald-600' : 'text-rose-600';
    setNotificaciones(prev => [{ id: Date.now(), txt: msg, color, hora: new Date().toLocaleTimeString() }, ...prev]);
  };

  useEffect(() => {
    const consultarIncidencias = () => {
      const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
      setEmpleados(guardadas);
    };

    consultarIncidencias();

    const escucharCambios = (e: StorageEvent) => {
      if (e.key === "base_incidencias") {
        consultarIncidencias();
        if (typeof agregarNotificacion === 'function') {
          agregarNotificacion("Nueva incidencia recibida de un Servidor Público", "Autorizado");
        }
      }
    };

    window.addEventListener("storage", escucharCambios);
    return () => window.removeEventListener("storage", escucharCambios);
  }, []);

  // ==========================================
  // HANDLERS Y FUNCIONES
  // ==========================================
  const handleArchivoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setArchivoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublicarAnuncio = () => {
    if (!tituloInput.trim() || !fechaInicioInput || !fechaExpInput) {
      alert("Por favor ingresa el título, la fecha de inicio y la fecha de fin.");
      return;
    }

    const nuevoAviso = {
      id: Date.now(),
      titulo: tituloInput,
      tipo: tipoInput,
      fechaInicio: fechaInicioInput,
      fechaExpiracion: fechaExpInput,
      archivoUrl: archivoPreview || "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80",
      remitente: "Jefatura de Área"
    };

    const nuevaLista = [nuevoAviso, ...listaAnuncios];
    setListaAnuncios(nuevaLista);
    localStorage.setItem("avisos_institucionales", JSON.stringify(nuevaLista));

    setTituloInput("");
    setTipoInput("comunicado");
    setFechaInicioInput("");
    setFechaExpInput("");
    setArchivoPreview("");
    setMostrarModalSubirAviso(false);

    alert("¡Anuncio publicado correctamente!");
  };

  const generarPdfOficial = (inc: any) => {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes.");
      return;
    }

    const contenidoHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ACUSE_OFICIAL</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; text-transform: uppercase; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #691C32; padding-bottom: 15px; margin-bottom: 20px; }
          .title { text-align: center; font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 20px; }
          .section-box { border: 1px solid #691C32; margin-bottom: 15px; border-radius: 4px; overflow: hidden; }
          .section-title { background-color: #691C32; color: white; padding: 5px 10px; font-size: 10px; font-weight: bold; }
          .section-content { padding: 10px; font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .full-width { grid-column: span 2; }
          .footer-firma { text-align: center; margin-top: 50px; font-size: 11px; font-weight: bold; }
          .linea-firma { width: 300px; border-bottom: 1px solid #000; margin: 40px auto 10px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div><strong>EDUCACIÓN</strong><br><small>SECRETARÍA DE EDUCACIÓN PÚBLICA</small></div>
          <div style="text-align: center; font-size: 9px;">
            DIRECCIÓN GENERAL DE ADMINISTRACIÓN<br>
            DIRECCIÓN DE ADMINISTRACIÓN Y FINANZAS<br>
            SUBDIRECCIÓN DE RECURSOS HUMANOS Y ORGANIZACIÓN
          </div>
          <div><strong>USICAMM</strong></div>
        </div>

        <div style="text-align: right; font-size: 10px; margin-bottom: 10px;">
          <strong>FECHA DE SOLICITUD:</strong> ${inc.fecha || new Date().toLocaleDateString()}<br>
          <strong>FOLIO DIGITAL:</strong> ${inc.folioDigital || inc.folio || 'N/A'}
        </div>

        <div class="title">FORMATO DE REGISTRO DE INCIDENCIA</div>

        <div class="section-box">
          <div class="section-title">DATOS DEL SERVIDOR PÚBLICO</div>
          <div class="section-content">
            <div><strong>NOMBRE:</strong><br>${inc.nombreEmpleado || inc.nombre || 'N/A'}</div>
            <div><strong>ID / CURP:</strong><br>${inc.id || 'N/A'}</div>
            <div class="full-width"><strong>UNIDAD DE ADSCRIPCIÓN:</strong><br>DIRECCIÓN GENERAL DE ADMINISTRACIÓN</div>
          </div>
        </div>

        <div class="section-box">
          <div class="section-title">TIPO DE INCIDENCIA SOLICITADA</div>
          <div class="section-content">
            <div class="full-width"><strong>INCIDENCIA:</strong><br>${inc.incidencia || inc.tipo || 'N/A'}</div>
            <div class="full-width"><strong>MOTIVOS Y/O OBSERVACIONES:</strong><br>${inc.motivo || inc.justificacion || 'SIN DESCRIPCIÓN'}</div>
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; border: 1px dashed #000; padding: 10px; margin-top: 20px;">
          Se turna al superior jerárquico para su validación y autorización.
        </div>

        <div class="footer-firma">
          <div class="linea-firma"></div>
          ${inc.nombreEmpleado || inc.nombre || 'SERVIDOR PÚBLICO'}<br>
          FIRMA DEL SERVIDOR PÚBLICO
        </div>
      </body>
      </html>
    `;

    ventana.document.write(contenidoHtml);
    ventana.document.close();
    ventana.print();
  };

  const manejarAperturaJefe = (e: any) => {
    setAcuseSeleccionado(e);

    const folioActual = e.folioDigital || e.folio;
    const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    const index = todasLasIncidencias.findIndex((item: any) => (item.folioDigital || item.folio) === folioActual);

    if (index !== -1) {
      todasLasIncidencias[index].estatus = "PENDIENTE POR RH";
      todasLasIncidencias[index].estado = "PENDIENTE POR RH";
      todasLasIncidencias[index].archivoUrl = e.archivoUrl || e.pdfAdjunto || e.archivo || todasLasIncidencias[index].archivoUrl;

      localStorage.setItem("base_incidencias", JSON.stringify(todasLasIncidencias));
      setEmpleados(todasLasIncidencias);

      window.dispatchEvent(new CustomEvent("actualizar-tabla-rh"));
      window.dispatchEvent(new Event("storage"));
    }
  };

  const manejarAccion = async (folio: string, nuevoEstado: 'AUTORIZADO' | 'RECHAZADO', motivoCustom = "") => {
    const cmp = empleados.find(e => (e.folioDigital || e.folio) === folio);
    if (!cmp) return;

    let motivoRechazo = motivoCustom;

    if (nuevoEstado === 'RECHAZADO' && !motivoRechazo) {
      const inputMotivo = prompt("Escriba el motivo del rechazo de la solicitud:");
      if (inputMotivo === null) return;
      if (inputMotivo.trim() === "") {
        alert("Es obligatorio escribir un motivo para rechazar.");
        return;
      }
      motivoRechazo = inputMotivo;
    }

    const estatusFinal = nuevoEstado === 'AUTORIZADO' ? 'AUTORIZADO POR JEFE' : 'RECHAZADO POR JEFE';

    try {
      const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
      const index = todasLasIncidencias.findIndex((e: any) => (e.folioDigital || e.folio) === folio);

      if (index !== -1) {
        todasLasIncidencias[index].estatus = estatusFinal;
        todasLasIncidencias[index].estado = estatusFinal;
        if (nuevoEstado === 'RECHAZADO') {
          todasLasIncidencias[index].notaJefe = motivoRechazo;
          todasLasIncidencias[index].nota = motivoRechazo;
        }
        localStorage.setItem("base_incidencias", JSON.stringify(todasLasIncidencias));
        window.dispatchEvent(new CustomEvent("actualizar-tabla-rh"));
      }

      agregarNotificacion(`${nuevoEstado === 'AUTORIZADO' ? '✓' : 'X'} ${cmp?.nombreEmpleado || cmp?.nombre || 'Solicitud'} ha sido ${nuevoEstado.toLowerCase()}`, nuevoEstado);

      const incidenciasRestantes = todasLasIncidencias.filter((e: any) => (e.folioDigital || e.folio) !== folio);
      setEmpleados(incidenciasRestantes);
      setRechazandoFolio(null);
    } catch (error) {
      console.error("Error al guardar resolución:", error);
      alert("Hubo un error al procesar el cambio en el simulador local.");
    }
  };

  const descargarExcel = () => {
    const ahora = new Date();
    const fechaDescarga = ahora.toLocaleDateString();
    const horaDescarga = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const filaFecha = `,,,,"FECHA DE DESCARGA:","${fechaDescarga} ${horaDescarga}"\n\n`;
    const encabezados = "FOLIO,ID SERVIDOR,NOMBRE,INCIDENCIA,ESTATUS,DESCRIPCION\n";
    const filas = listaFiltrada.map(e => {
      const idTrabajadorLimpio = String(e.id || '').trim();
      const idFormateado = idTrabajadorLimpio.length > 0 && !isNaN(Number(idTrabajadorLimpio)) 
        ? String(Number(idTrabajadorLimpio)).padStart(2, '0') 
        : idTrabajadorLimpio || '#';
        
      return `${e.folioDigital || e.folio},${idFormateado},"${e.nombre || e.nombreEmpleado || ''}",${e.incidencia || e.tipo},${e.estado || e.estatus},"${e.motivo || e.justificacion || ''}"`;
    }).join("\n");
    const contenidoCsv = "\uFEFF" + filaFecha + encabezados + filas;
    const blob = new Blob([contenidoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const fechaArchivo = ahora.toISOString().split('T')[0];
    link.download = `RH_REPORTE_${fechaArchivo}.csv`; 
    link.click();
    URL.revokeObjectURL(url);
  };

  const eliminarDefinitivo = (folio: string) => {
    if (confirm("¿De verdad quieres borrar permanentemente esta incidencia?")) {
      const todasLasIncidencias = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
      const limpias = todasLasIncidencias.filter((e: any) => (e.folioDigital || e.folio) !== folio);
      localStorage.setItem("base_incidencias", JSON.stringify(limpias));
      window.dispatchEvent(new CustomEvent("actualizar-tabla-rh"));
      setEmpleados(limpias);
    }
  };

  // ==========================================
  // FILTRADO REACTIVO EN MEMORIA
  // ==========================================
  const listaFiltrada = useMemo(() => {
    return empleados.filter(e => {
      const valorIncidencia = (e.incidencia || e.tipo || "")
        .replace(/[*]/g, "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .trim().toUpperCase();

      const filtroSel = (tipoFiltro || "")
        .replace(/[*]/g, "")
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .trim().toUpperCase();

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
        (e.id && String(e.id).toLowerCase().includes(textoBusqueda));
      
      return cumpleCategoria && cumpleBusqueda;
    });
  }, [empleados, tipoFiltro, busqueda]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 font-sans uppercase text-slate-700">
      <div className="max-w-[1500px] mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100">
        
        <header className="relative p-6 px-10 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm flex items-center justify-between">
          <div className="w-1/4">
            <img src="/logo-sep.png" alt="SEP" className="h-14 w-auto object-contain transition-opacity hover:opacity-80" />
          </div>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-800 leading-none">Sistema Integral de Incidencias de Personal</h1>
            <div className="flex items-center justify-center gap-2 mt-2"></div>
          </div>
          <div className="w-1/4 flex items-center justify-end gap-6">
            <img src="/logo-usicamm.png" alt="USICAMM" className="h-12 w-auto object-contain opacity-90" />
            <div className="h-10 w-[1px] bg-slate-200"></div>
            <div className="flex gap-3">
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
        </header>

        <div className="bg-slate-50/50 p-8 grid grid-cols-1 md:grid-cols-6 gap-6 border-b border-slate-100">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-1">SERVIDOR PÚBLICO</label>
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs shadow-sm focus:ring-2 focus:ring-[#BC955C] outline-none transition-all" placeholder="BUSCAR..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-1">CATEGORÍA</label>
            <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs shadow-sm outline-none">
              <option value="TODOS">TODAS</option>
              {catalogo.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 ml-1">ESTADO</label>
            <select value={estatusFiltro} onChange={(e) => setEstatusFiltro(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs shadow-sm outline-none">
              <option value="TODOS">📂 VER TODO</option>
              <option value="PENDIENTE">⏳ PENDIENTES</option>
              <option value="AUTORIZADO">✅ AUTORIZADOS</option>
              <option value="RECHAZADO">❌ RECHAZADOS</option>
            </select>
          </div>
          <div className="flex items-end gap-2"></div>
          <div className="flex items-end justify-center gap-2"></div>
        </div>

        {verHistoricoJefe && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-[#BC955C] font-black tracking-[.3em] text-[9px]">EXPEDIENTE PERSONAL</h3>
                  <h2 className="text-xl font-black italic text-white">ING. JOSÉ ALBERTO PACHECO CHÁVEZ</h2>
                </div>
                <button onClick={() => setVerHistoricoJefe(false)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose-500 transition-all font-black">✕</button>
              </div>
              <div className="p-8 space-y-4 max-h-[450px] overflow-y-auto">
                {historialJefe.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-center min-w-[60px]">
                      <p className="text-[10px] font-black text-slate-400">{item.fecha.split('-')[0]}</p>
                      <p className="text-sm font-black text-slate-800 leading-none">{item.fecha.split('-')[1]}/{item.fecha.split('-')[2]}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-800">{item.tipo}</p>
                      <p className="text-[9px] text-slate-400 font-bold italic">{item.nota}</p>
                    </div>
                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {verNotis && (
          <div className="mx-8 mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl animate-in fade-in slide-in-from-top-4">
             <h4 className="text-[10px] font-black text-emerald-700 mb-2">ACTIVIDAD RECIENTE</h4>
             <div className="flex gap-4 overflow-x-auto pb-2">
                {notificaciones.map(n => (
                  <div key={n.id} className="min-w-[200px] bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                    <p className={`text-[9px] font-black ${n.color}`}>{n.txt}</p>
                    <span className="text-[8px] text-slate-400 font-bold">{n.hora}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        <div className="p-8">
          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black tracking-widest uppercase border-b border-slate-100">
                <tr>
                  <th className="p-6">ID INCIDENCIA</th>
                  <th className="p-6">SERVIDOR PÚBLICO</th>
                  <th className="p-6">MOTIVO</th>
                  <th className="p-6 text-center">ESTATUS</th>
                  <th className="p-6">DESCRIPCIÓN SOLICITUD</th>
                  <th className="p-6 text-center">GESTIÓN</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-medium divide-y divide-slate-50">{
                listaFiltrada.filter((e) => {
                  const incidenciaTexto = (e.incidencia || e.tipo || "").toUpperCase().trim();
                  if (
                    incidenciaTexto.includes("COMISIÓN DE ENTRADA") ||
                    incidenciaTexto.includes("COMISIÓN DE SALIDA") ||
                    incidenciaTexto.includes("COMISIÓN TODO EL DIA")
                  ) {
                    return false;
                  }

                  if (estatusFiltro === 'TODOS') {
                    return true;
                  }

                  if (estatusFiltro === 'PENDIENTE') {
                    const estadoActual = (e.estado || e.estatus || 'PENDIENTE').toUpperCase().trim();
                
                // Si el jefe ya autorizó, ya no se muestra en la bandeja del jefe (lo sigue viendo RH)
                if (estadoActual === 'AUTORIZADO POR JEFE' || estadoActual === 'VALIDADO POR JEFE') {
                  return false;
                }

                return estadoActual === 'PENDIENTE' || estadoActual === '' || estadoActual === 'PENDIENTE POR JEFE';
                  }

            if (estatusFiltro === 'AUTORIZADO') {
  return e.estado === 'AUTORIZADO' || e.estado === 'AUTORIZADO POR JEFE' || e.estado === 'VALIDADO POR RH';
}

if (estatusFiltro === 'RECHAZADO') {
  return e.estado === 'RECHAZADO' || e.estado === 'RECHAZADO POR JEFE' || e.estado === 'RECHAZADO POR RH';
}      
                  return e.estado === estatusFiltro;
                }).map((e) => {
                  const nombreReal = e.nombreEmpleado || (isNaN(Number(e.nombre)) ? e.nombre : null) || "SERVIDOR PÚBLICO";
                  const idCrudo = (!isNaN(Number(e.nombre)) ? e.nombre : null) || e.id || e.folio || '';
                  const idTrabajadorLimpio = String(idCrudo).trim();
                  const idFormateado = idTrabajadorLimpio.length > 0 && !isNaN(Number(idTrabajadorLimpio))
                    ? String(Number(idTrabajadorLimpio)).padStart(2, '0')
                    : idTrabajadorLimpio || '#';

                  return (
                    <tr key={e.folioDigital || e.folio} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-6 font-black text-slate-600 tracking-wider">
                        {idFormateado}
                      </td>
                      <td className="p-6">
                        <div className="font-black text-slate-800 uppercase tracking-tight">
                          {nombreReal}
                        </div>
                      </td>
                      <td className="p-6">
                        {editandoFolio === (e.folioDigital || e.folio) ? (
                          <select 
                            autoFocus 
                            className="w-full border-2 border-[#BC955C] p-2 bg-white rounded-lg font-black text-[10px] outline-none shadow-md"
                            value={e.incidencia} 
                            onBlur={() => setEditandoFolio(null)}
                            onChange={(opt) => {
                              setEmpleados(prev => prev.map(emp => (emp.folioDigital || emp.folio) === (e.folioDigital || e.folio) ? {...emp, incidencia: opt.target.value} : emp));
                              setEditandoFolio(null);
                            }}
                          >
                            {catalogo.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        ) : (
                          <span 
                            onClick={() => setEditandoFolio(e.folioDigital || e.folio)}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md font-bold text-[10px] cursor-pointer hover:bg-blue-100 transition-all border border-transparent hover:border-blue-200 inline-block"
                          >
                            {e.incidencia || e.tipo} ✎
                          </span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black border ${
                          e.estado === 'AUTORIZADO' || e.estado === 'AUTORIZADO POR JEFE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          e.estado === 'RECHAZADO' || e.estado === 'RECHAZADO POR JEFE' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>{e.estado || e.estatus || 'PENDIENTE'}</span>
                      </td>
                      <td className="p-6">
                        <div className="max-w-[250px]">
                          <p className="text-[9px] font-bold text-slate-500 italic leading-tight line-clamp-2">
                            {e.justificacion || e.motivo || e.incidencia || "Sin descripción"}
                          </p>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => manejarAperturaJefe(e)} 
                            className="p-2 px-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm font-black text-[9px]" 
                            title="Ver Acuse Oficial"
                          >
                            ABRIR 🔍
                          </button>
                          {(!e.estatus || e.estatus === 'PENDIENTE') && (
                            <>
                              <button onClick={() => manejarAccion(e.folioDigital || e.folio, 'AUTORIZADO')} className="p-2 px-3 bg-white border border-slate-200 rounded-lg hover:bg-emerald-500 hover:text-white transition-all font-black text-[9px]">AUTORIZAR</button>
                              <button onClick={() => setRechazandoFolio(e.folioDigital || e.folio)} className="p-2 px-3 bg-white border border-slate-200 rounded-lg hover:bg-rose-500 hover:text-white transition-all font-black text-[9px]">RECHAZAR</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              }</tbody>
            </table>
          </div>
        </div>

        {/* MODAL DEL ACUSE OFICIAL */}
        {acuseSeleccionado && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
              
              <div className="bg-[#691C32] text-white p-4 px-6 flex justify-between items-center">
                <span className="font-black text-xs tracking-widest uppercase">ACUSE OFICIAL DE INCIDENCIA</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => generarPdfOficial(acuseSeleccionado)} 
                    className="bg-[#BC955C] text-white px-4 py-2 rounded-xl font-black text-[10px] hover:opacity-90 transition-all shadow"
                  >
                    🖨️ IMPRIMIR / PDF
                  </button>
                  <button 
                    onClick={() => setAcuseSeleccionado(null)} 
                    className="bg-white/20 hover:bg-rose-600 text-white w-8 h-8 rounded-full font-black text-xs transition-all flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 overflow-y-auto uppercase text-slate-800 bg-white">
                <div className="flex justify-between items-center border-b-2 border-[#691C32] pb-4 mb-6">
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

                <div className="text-right text-[10px] mb-6 font-bold">
                  <p>FECHA DE SOLICITUD: {acuseSeleccionado.fecha || new Date().toLocaleDateString()}</p>
                  <p>FOLIO DIGITAL: {acuseSeleccionado.folioDigital || acuseSeleccionado.folio || 'N/A'}</p>
                </div>

                <h2 className="text-center font-black text-sm underline mb-6">FORMATO DE REGISTRO DE INCIDENCIA</h2>

                <div className="border border-[#691C32] rounded-lg mb-4 overflow-hidden">
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

                <div className="border border-[#691C32] rounded-lg mb-6 overflow-hidden">
                  <div className="bg-[#691C32] text-white px-3 py-1 text-[10px] font-black">TIPO DE INCIDENCIA SOLICITADA</div>
                  <div className="p-4 text-[11px] space-y-3">
                    <div><strong>INCIDENCIA:</strong><br/>{acuseSeleccionado.incidencia || acuseSeleccionado.tipo || 'N/A'}</div>
                    <div><strong>MOTIVOS Y/O OBSERVACIONES:</strong><br/>{acuseSeleccionado.motivo || acuseSeleccionado.justificacion || 'SIN DESCRIPCIÓN'}</div>
                  </div>
                </div>
<div className="text-center text-[10px] border border-dashed border-slate-400 p-4 rounded-lg mb-4">
                  Se turna al superior jerárquico para su validación y autorización.
                </div>

                {/* 📄 VISOR INTELIGENTE DE PDF */}
                {(() => {
                  const tipo = (acuseSeleccionado.incidencia || acuseSeleccionado.tipo || "").toUpperCase();
                  const esValida = tipo.includes("LICENCIA MÉDICA") || tipo.includes("CUIDADOS MATERNOS") || tipo.includes("CONSTANCIA MÉDICA");
                  if (!esValida) return null;

                  let raw = acuseSeleccionado.pdfAdjunto || acuseSeleccionado.archivo || acuseSeleccionado.pdf || '';
                  const folioActual = acuseSeleccionado.folioDigital || acuseSeleccionado.folio || '';
                  let pdfUrlFinal = '';

                  if (raw && !raw.startsWith('data:') && !raw.startsWith('http') && !raw.startsWith('blob:')) {
                    try {
                      const lista = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
                      const encontrado = lista.find((item: any) => (item.folio === folioActual || item.folioDigital === folioActual) && item.pdfAdjunto?.startsWith('data:'));
                      if (encontrado) raw = encontrado.pdfAdjunto;
                    } catch (e) {}
                  }

                  if (raw && raw.startsWith('data:')) {
                    try {
                      const arr = raw.split(',');
                      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
                      const bstr = atob(arr[1]);
                      let n = bstr.length;
                      const u8arr = new Uint8Array(n);
                      while (n--) u8arr[n] = bstr.charCodeAt(n);
                      pdfUrlFinal = URL.createObjectURL(new Blob([u8arr], { type: mime }));
                    } catch (e) {}
                  } else if (raw && (raw.startsWith('http') || raw.startsWith('blob:'))) {
                    pdfUrlFinal = raw;
                  }

                  if (!pdfUrlFinal) return null;

                  return (
                    <div className="border border-red-600 rounded-lg mb-4 overflow-hidden bg-red-50 p-3 text-center">
                      <p className="font-black text-red-700 text-[10px] mb-2 uppercase">COMPROBANTE MÉDICO / LICENCIA ADJUNTO (PDF)</p>
                      <button type="button" onClick={() => window.open(pdfUrlFinal, '_blank')} className="bg-black text-white px-3 py-1.5 rounded-lg text-[9px] font-black mb-3">
                        📄 ABRIR COMPROBANTE PDF EN GRANDE
                      </button>
                      <div className="w-full h-80 border border-slate-300 bg-white rounded-lg overflow-hidden">
                        <iframe src={pdfUrlFinal} className="w-full h-full border-0" title="Visor PDF" />
                      </div>
                    </div>
                  );
                })()}

                <div className="text-center font-bold text-[11px] mt-6">
                  <div className="w-72 border-b border-black mx-auto mb-2"></div>
                  {acuseSeleccionado.nombreEmpleado || acuseSeleccionado.nombre || 'SERVIDOR PÚBLICO'}<br/>
                  <span className="text-[9px] text-slate-500">FIRMA DEL SERVIDOR PÚBLICO</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL DETALLES DE INCIDENCIA */}
        {incidenciaSeleccionada && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95">
              <div className="p-6 border-b flex justify-between items-center bg-slate-900 text-white">
                <div>
                  <h3 className="font-black text-[#BC955C] tracking-[.2em] text-[10px]">DETALLES DE LA INCIDENCIA</h3>
                  <p className="text-xl font-black italic">FOLIO: #{incidenciaSeleccionada.folioDigital || incidenciaSeleccionada.folio}</p>
                </div>
                <button 
                  onClick={() => setIncidenciaSeleccionada(null)} 
                  className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-rose-500 hover:text-white transition-all font-black"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-8 bg-slate-50 space-y-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="text-[9px] font-black text-slate-400 block mb-1">SERVIDOR PÚBLICO</label>
                    <p className="text-sm font-black text-slate-800">{incidenciaSeleccionada.nombreEmpleado || incidenciaSeleccionada.nombre}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <label className="text-[9px] font-black text-slate-400 block mb-1">ID TRABAJADOR (SP)</label>
                    <p className="text-sm font-black text-slate-800">{incidenciaSeleccionada.id}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="text-[9px] font-black text-[#BC955C] tracking-wider block mb-1">TIPO DE INCIDENCIA</label>
                  <p className="text-base font-black text-slate-900">{incidenciaSeleccionada.incidencia || incidenciaSeleccionada.tipo}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <label className="text-[9px] font-black text-slate-400 block mb-1">DESCRIPCIÓN / MOTIVO DE LA SOLICITUD</label>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                    "{incidenciaSeleccionada.justificacion || incidenciaSeleccionada.motivo}"
                  </p>
                </div>

                <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-black text-slate-400">ESTATUS ACTUAL:</span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${
                    incidenciaSeleccionada.estado === 'AUTORIZADO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                    incidenciaSeleccionada.estado === 'RECHAZADO' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>{incidenciaSeleccionada.estado || incidenciaSeleccionada.estatus}</span>
                </div>
              </div>

              <div className="p-6 border-t bg-white flex justify-end gap-3">
                <button 
                  onClick={() => { 
                    manejarAccion(incidenciaSeleccionada.folioDigital || incidenciaSeleccionada.folio, 'AUTORIZADO'); 
                    setIncidenciaSeleccionada(null); 
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px]"
                >
                  AUTORIZAR INCIDENCIA
                </button>
                <button 
                  onClick={() => { 
                    setRechazandoFolio(incidenciaSeleccionada.folioDigital || incidenciaSeleccionada.folio); 
                    setIncidenciaSeleccionada(null); 
                  }}
                  className="px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px]"
                >
                  RECHAZAR INCIDENCIA
                </button>
              </div>
            </div>
          </div>
        )}

        {rechazandoFolio && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 border border-slate-100 animate-in zoom-in-95">
              <h3 className="text-lg font-black text-slate-800 text-center mb-6 text-[12px]">MOTIVO DE RECHAZO</h3>
              
              <textarea
                autoFocus
                className="w-full h-32 p-4 border-2 border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-rose-500 transition-all text-slate-800"
                placeholder="Escribe aquí el motivo detallado del rechazo..."
                value={motivoEscrito}
                onChange={(e) => setMotivoEscrito(e.target.value)}
              />

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => {
                    setMotivoEscrito("");
                    setRechazandoFolio(null);
                  }} 
                  className="flex-1 py-3 text-slate-400 font-black text-[10px] hover:text-slate-600 uppercase"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    manejarAccion(rechazandoFolio, 'RECHAZADO', motivoEscrito || "SIN MOTIVO ESPECIFICADO");
                    setMotivoEscrito("");
                  }}
                  className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] hover:bg-rose-700 shadow-lg"
                >
                  CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="bg-slate-50 p-12 border-t border-slate-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-1">
              <div className="border-t-2 border-[#691C32] pt-3 max-w-sm text-left">
                <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración</p>
                <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección de Administración y Finanzas</p>
                <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Subdirección de Recursos Humanos y Organización</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-black text-slate-800 uppercase border-b-2 border-[#BC955C] inline-block pb-1">Ing. José Alberto Pacheco Chávez</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
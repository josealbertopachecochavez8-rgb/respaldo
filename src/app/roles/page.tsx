"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PantallaRoles() {

  // Estados de tu formulario de Subir Anuncio (si no los tenías declarados aquí, agrégalos)
  const [tituloInput, setTituloInput] = useState("");
  const [tipoInput, setTipoInput] = useState("comunicado");
  const [fechaInicioInput, setFechaInicioInput] = useState("");
  const [fechaExpInput, setFechaExpInput] = useState("");
  const [archivoPreview, setArchivoPreview] = useState<string | null>(null);
  const [mostrarModalSubirAviso, setMostrarModalSubirAviso] = useState(false);
const [archivoModalUrl, setArchivoModalUrl] = useState<any>(null); // <--- Agrégalo aquí con tus demás estados
    const [listaAnuncios, setListaAnuncios] = useState<any[]>([]);

  const handlePublicarAnuncio = () => {
    if (!tituloInput.trim() || !fechaExpInput) {
      alert("Por favor completa el título y la fecha de vigencia.");
      return;
    }

    const inputArchivo = document.querySelector('input[type="file"]') as HTMLInputElement;
    const archivoReal = inputArchivo?.files?.[0];

    const guardarDatosFinales = (base64Url: string, nombreDoc: string) => {
      const nuevoAviso = {
        id: Date.now(),
        titulo: tituloInput,
        tipo: tipoInput,
        fechaInicio: fechaInicioInput,
        fechaExpiracion: fechaExpInput,
        archivo: nombreDoc,
        archivoUrl: base64Url
      };

      const anunciosActuales = JSON.parse(localStorage.getItem('lista_anuncios') || '[]');
      localStorage.setItem('lista_anuncios', JSON.stringify([nuevoAviso, ...anunciosActuales]));

      // Disparamos evento de sincronización en tiempo real
      window.dispatchEvent(new Event("storage"));

      alert("¡Anuncio y archivo publicados correctamente en tiempo real!");
      setMostrarModalSubirAviso(false);
      setTituloInput("");
      setFechaInicioInput("");
      setFechaExpInput("");
      setArchivoPreview(null);
    };

    if (archivoReal) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const resultadoBase64 = e.target?.result as string;
        guardarDatosFinales(resultadoBase64, archivoReal.name);
      };
      reader.readAsDataURL(archivoReal);
    } else {
      guardarDatosFinales("", "Documento_Oficial");
    }
  };

  useEffect(() => {
    const cargarAnunciosGlobales = () => {
      const guardados = localStorage.getItem('lista_anuncios');
      if (guardados) {
        try {
          setListaAnuncios(JSON.parse(guardados));
        } catch (e) {
          console.error("Error al cargar anuncios:", e);
        }
      }
    };
    cargarAnunciosGlobales();
    window.addEventListener("storage", cargarAnunciosGlobales);
    return () => window.removeEventListener("storage", cargarAnunciosGlobales);
  }, []);

  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
const [mostrarMarcoNormativo, setMostrarMarcoNormativo] = useState(false);
const [mostrarAvisos, setMostrarAvisos] = useState(false);
  useEffect(() => {
    // Verificamos si existe el usuario logueado
    const data = localStorage.getItem('usuario');
    if (!data) {
      router.push('/'); // Si no está logueado, regresa al login xd
    } else {
      setUsuario(JSON.parse(data));
    }
  }, [router]);

  // Función para determinar si el rol está permitido según el usuario logueado
  const esRolPermitido = (tipoRol: string) => {
    if (!usuario) return false;
    
    const curp = usuario.curp || '';
    const nombre = (usuario.nombre || '').toUpperCase();
    const apellidoPaterno = (usuario.apellidoPaterno || usuario.primer_apellido || '').toUpperCase();
    const apellidoMaterno = (usuario.apellidoMaterno || '').toUpperCase();

    // 1. Súper Administrador / Acceso Total (CURP de ejemplo o nombre Súper)
    if (curp === 'PACA040220HMCCHLA3' || nombre === 'SÚPER') {
      return true;
    }

    // 2. Si ingresa el Superior Jerárquico (CURP empieza con EEE o apellido 'Jerárquico')
    if (curp.startsWith('EEE') || apellidoPaterno === 'JERÁRQUICO' || apellidoMaterno === 'JERARQUICO') {
      return tipoRol === 'jefe' || tipoRol === 'empleado';
    }

    // 3. Si ingresa la Subdirección de Recursos Humanos (CURP empieza con CCC o apellido 'Humanos')
    if (curp.startsWith('CCC') || apellidoMaterno === 'HUMANOS') {
      return tipoRol === 'empleado' || tipoRol === 'recursos';
    }

    // 4. Dirección General de Administración (CURP empieza con AAA o DGA)
    if (curp.startsWith('AAA') || apellidoMaterno === 'DGA') {
      return true;
    }

   // 5. Empleado (Ajustado para que permita su rol si la CURP empieza con DDD o su nombre contiene EMPLEADO)
    if (curp.startsWith('DDD') || nombre.includes('EMPLEADO')) {
      return tipoRol === 'empleado';
    }
    return false; // Por defecto si viene de BD general
  };

  const manejarClickRol = (tipoRol: string, ruta: string) => {
    if (!esRolPermitido(tipoRol)) {
      alert("Acceso restringido: No cuenta con los permisos necesarios para este rol.");
      return;
    }
    router.push(ruta);
  };

  // Corrección para evitar el "SÚPER UNDEFINED" mostrando el nombre correctamente
  const obtenerNombreCompleto = () => {
    if (!usuario) return 'Cargando...';
    const nombre = usuario.nombre || '';
    const apP = usuario.apellidoPaterno || usuario.primer_apellido || '';
    const apM = usuario.apellidoMaterno || '';
    return `${nombre} ${apP} ${apM}`.trim();
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] flex flex-col items-center p-4 font-sans text-gray-800">
      <div className="w-full max-w-5xl bg-white shadow-xl border border-gray-300 min-h-[650px] flex flex-col">
        
        {/* Encabezado Logos */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 px-8">
          <img src="/logo-sep.png" alt="SEP" className="max-h-20 w-auto" />
          <img src="/logo-usicamm.png" alt="USICAMM" className="max-h-16 w-auto" />
        </div>

        <div className="bg-[#691C32] py-2 px-4 text-center">
          <h1 className="text-white text-[11px] font-serif italic tracking-wide uppercase">
            Sistema Integral de Incidencias de Personal
          </h1>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-10 space-y-8">
          <div className="text-center">
            {/* Nombre corregido sin "SÚPER UNDEFINED" */}
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Bienvenido: {obtenerNombreCompleto()}
            </p>
            <h2 className="text-xl font-serif text-[#691C32] border-b-2 border-[#BC955C] pb-1">
              Seleccione su Perfil:
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
            
            {/* 1. SUPERIOR JERÁRQUICO */}
            {(() => {
              const permitido = esRolPermitido('jefe');
              return (
                <div 
                  onClick={() => manejarClickRol('jefe', '/jefe')}
                  className={`group relative p-10 border-2 rounded-xl transition-all flex flex-col items-center gap-4 shadow-sm cursor-pointer ${
                    permitido 
                      ? 'border-gray-100 hover:border-[#BC955C] hover:bg-gray-50 bg-white' 
                      : 'border-gray-300 bg-gray-100 grayscale opacity-60'
                  }`}
                >
                  {!permitido && (
                    <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-[9px] font-black text-rose-700 uppercase">Sin Acceso</span>
                    </div>
                  )}
                  <span className="text-5xl">👨‍💼</span>
                  <span className="font-bold text-[#691C32] text-[11px] tracking-widest uppercase">SUPERIOR JERÁRQUICO</span>
                </div>
              );
            })()}

            {/* 2. EMPLEADO */}
            {(() => {
              const permitido = esRolPermitido('empleado');
              return (
                <div 
                  onClick={() => manejarClickRol('empleado', '/empleado')}
                  className={`group relative p-10 border-2 rounded-xl transition-all flex flex-col items-center gap-4 shadow-sm cursor-pointer ${
                    permitido 
                      ? 'border-gray-100 hover:border-[#BC955C] hover:bg-gray-50 bg-white' 
                      : 'border-gray-300 bg-gray-100 grayscale opacity-60'
                  }`}
                >
                  {!permitido && (
                    <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-[9px] font-black text-rose-700 uppercase">Sin Acceso</span>
                    </div>
                  )}
                  <span className="text-5xl">🧑‍💻</span>
                  <span className="font-bold text-[#691C32] text-[11px] tracking-widest uppercase">EMPLEADO</span>
                </div>
              );
            })()}

            {/* 3. DIRECCIÓN GENERAL Y TITULARES DE ÁREA */}
            {(() => {
              const permitido = esRolPermitido('dga_titular');
              return (
                <div 
                  onClick={() => manejarClickRol('dga_titular', '/dga')}
                  className={`group relative p-10 border-2 rounded-xl transition-all flex flex-col items-center gap-4 shadow-sm text-center cursor-pointer ${
                    permitido 
                      ? 'border-gray-100 hover:border-[#BC955C] hover:bg-gray-50 bg-white' 
                      : 'border-gray-300 bg-gray-100 grayscale opacity-60'
                  }`}
                >
                  {!permitido && (
                    <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-[9px] font-black text-rose-700 uppercase">Sin Acceso</span>
                    </div>
                  )}
                  <span className="text-5xl">🏢</span>
                  <span className="font-bold text-[#691C32] text-[11px] tracking-widest uppercase leading-tight">DIRECCIÓN GENERAL Y <br/> TITULARES DE ÁREA</span>
                </div>
              );
            })()}

            {/* 4. DIRECCIÓN GENERAL DE ADMINISTRACIÓN */}
            {(() => {
              const permitido = esRolPermitido('dga');
              return (
                <div 
                  onClick={() => manejarClickRol('dga', '/direccion')}
                  className={`group relative p-10 border-2 rounded-xl transition-all flex flex-col items-center gap-4 shadow-sm text-center cursor-pointer ${
                    permitido 
                      ? 'border-gray-100 hover:border-[#BC955C] hover:bg-gray-50 bg-white' 
                      : 'border-gray-300 bg-gray-100 grayscale opacity-60'
                  }`}
                >
                  {!permitido && (
                    <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-[9px] font-black text-rose-700 uppercase">Sin Acceso</span>
                    </div>
                  )}
                  <span className="text-5xl">💼</span>
                  <span className="font-bold text-[#691C32] text-[11px] tracking-widest uppercase leading-tight">DIRECCIÓN GENERAL DE <br/> ADMINISTRACIÓN</span>
                </div>
              );
            })()}

            {/* 5. SUBDIRECCIÓN DE RECURSOS HUMANOS Y ORGANIZACIÓN */}
            {(() => {
              const permitido = esRolPermitido('recursos');
              return (
                <div 
                  onClick={() => manejarClickRol('recursos', '/recursos')}
                  className={`group relative p-10 border-2 rounded-xl transition-all flex flex-col items-center gap-4 shadow-sm text-center cursor-pointer ${
                    permitido 
                      ? 'border-gray-100 hover:border-[#BC955C] hover:bg-gray-50 bg-white' 
                      : 'border-gray-300 bg-gray-100 grayscale opacity-60'
                  }`}
                >
                  {!permitido && (
                    <div className="absolute inset-0 bg-white/70 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <span className="text-3xl mb-1">🔒</span>
                      <span className="text-[9px] font-black text-rose-700 uppercase">Sin Acceso</span>
                    </div>
                  )}
                  <span className="text-5xl">📂</span>
                  <span className="font-bold text-[#691C32] text-[11px] tracking-widest uppercase leading-tight">SUBDIRECCIÓN DE <br/> RECURSOS HUMANOS Y Organización</span>
                </div>
              );
            })()}

          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { localStorage.removeItem('usuario'); router.push('/'); }} 
              className="text-[9px] font-bold text-gray-400 hover:text-red-700 underline uppercase"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="p-8 bg-white mt-auto">
          <div className="border-t-2 border-[#691C32] pt-3 max-w-sm text-left">
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración y Finanzas</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Subdirección de Recursos Humanos y Organización</p>
          </div>
          
        </div>
        
{/* BOTONES INSTITUCIONALES (AVISOS Y NORMATIVIDAD) */}

      <div className="flex justify-end items-center gap-2 pb-1 pr-1">
    {/* BOTÓN 1: AVISOS INSTITUCIONALES */}
    <button
      type="button"
      onClick={() => setMostrarAvisos(true)}
      className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-xl hover:shadow-amber-900/40 border border-amber-400/60 hover:border-amber-300 transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
      title="Consultar Avisos Institucionales Importantes"
    >
      {/* Destello metálico al pasar el cursor */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>

      {/* Indicador pulsante */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-300 to-yellow-500 shadow-[0_0_6px_#f59e0b]"></span>
      </span>

      <span className="text-xs group-hover:scale-110 transition-transform">📢</span>
      <span className="group-hover:text-amber-200 transition-colors font-extrabold tracking-widest">
        Avisos
      </span>
      
      {/* Tag Notificación */}
      <span className="bg-gradient-to-r from-amber-500 to-amber-700 text-[8px] text-white font-black px-1.5 rounded-md uppercase leading-none py-0.5 shadow-inner border border-amber-300/40">
        Nuevos
      </span>
    </button>

    {/* VENTANA FLOTANTE MODAL: TABLERO DE ANUNCIOS NUEVOS Y COMUNICADOS */}
    {mostrarAvisos && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fadeIn transition-all">
        <div className="bg-white/95 w-full max-w-4xl border-2 border-amber-500/60 shadow-[0_25px_60px_-15px_rgba(180,83,9,0.4)] rounded-2xl overflow-hidden flex flex-col max-h-[88vh] backdrop-saturate-150">
          
          {/* Encabezado Institucional del Tablero de Anuncios */}
          <div className="relative bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 px-6 py-4 text-white flex justify-between items-center border-b-4 border-amber-500 shadow-md">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-[2px] shadow-lg shadow-black/40">
                <div className="w-full h-full bg-amber-950 rounded-[10px] flex items-center justify-center text-xl shadow-inner">
                  📢
                </div>
              </div>
              <div>
                <h2 className="text-[10px] font-black tracking-widest uppercase text-amber-300 bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/30 inline-block">
Unidad del Sistema para la Carrera de las Maestras y los Maestros                </h2>
                <p className="text-xs font-black text-white uppercase tracking-wide mt-0.5">
                  Tablero Oficial de Anuncios Nuevos  Y Circulares
                </p>
              </div>
            </div>

            <button 
              type="button" 
              onClick={() => setMostrarAvisos(false)}
              className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-red-600/80 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border border-white/20 hover:border-red-400 cursor-pointer shadow-md active:scale-90"
              title="Cerrar ventana"
            >
              ✕
            </button>
          </div>

          {/* CUERPO DEL TABLERO DE AVISOS INSTITUCIONALES */}
          <div className="p-6 space-y-6 overflow-y-auto text-xs leading-relaxed text-gray-700 bg-gradient-to-b from-slate-50 to-amber-50/20 flex-1">
            {(() => {
              const hoy = new Date().toISOString().split('T')[0];
              
              const eliminadosAlv = JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('anuncios_eliminados_alv') || '[]' : '[]');

              const vigentes = listaAnuncios.filter(a => {
                if (eliminadosAlv.includes(a.id)) return false;
                return !a.fechaExpiracion || a.fechaExpiracion >= hoy;
              });

              if (vigentes.length === 0) {
                return (
                  <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-wider">
                    No hay avisos o comunicados vigentes en este momento.
                  </div>
                );
              }

              const eliminarAnuncioPermanente = (idAnuncio: number) => {
                if (confirm("¿Deseas eliminar este aviso permanentemente? Ya no volverá a aparecer.")) {
                  const nuevaListaNegra = [...eliminadosAlv, idAnuncio];
                  localStorage.setItem('anuncios_eliminados_alv', JSON.stringify(nuevaListaNegra));
                  setListaAnuncios(prev => prev.filter(a => a.id !== idAnuncio));
                }
              };

              return vigentes.map((anuncio) => (
                <div key={anuncio.id} className="relative bg-white border border-gray-200 p-4 rounded-2xl shadow-xs space-y-3 hover:border-amber-500 transition-all">
                  
                  {/* BOTÓN TACHECITO PARA ELIMINAR PERMANENTEMENTE */}
                  <button 
                    type="button"
                    onClick={() => eliminarAnuncioPermanente(anuncio.id)}
                    className="absolute top-3 right-3 w-7 h-7 bg-gray-100 hover:bg-red-600 hover:text-white text-gray-500 rounded-full flex items-center justify-center font-black text-xs transition-all cursor-pointer shadow-xs"
                    title="Eliminar este anuncio para siempre"
                  >
                    ✕
                  </button>

                  {/* Cabecera del Aviso */}
                  <div className="flex justify-between items-start pr-8">
                    <span className="text-[9px] font-black bg-amber-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      ⚡ {anuncio.tipo ? anuncio.tipo.toUpperCase() : "COMUNICADO"}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900">
                      Vigencia: {anuncio.fechaExpiracion || 'Indefinida'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-gray-900 text-sm mt-1 uppercase">
                    {anuncio.titulo}
                  </h3>

                  {/* VISOR DE ARCHIVO ADJUNTO CON OJITO 👁️ Y DESCARGA */}
                  {anuncio.archivo && anuncio.archivo !== "Documento_Oficial" && (
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📎</span>
                        <div>
                          <p className="font-bold text-gray-800 text-[11px]">{anuncio.archivo}</p>
                          <p className="text-[9px] text-gray-400 uppercase">Documento adjunto por Jefatura</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* BOTÓN OJITO PARA VER EL DOCUMENTO */}
                        <button 
                          type="button" 
                          onClick={() => {
                            if (anuncio.archivoUrl && anuncio.archivoUrl.startsWith('data:')) {
                              try {
                                const arr = anuncio.archivoUrl.split(',');
                                const mimeMatch = arr[0].match(/:(.*?);/);
                                const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
                                const bstr = atob(arr[1]);
                                let n = bstr.length;
                                const u8arr = new Uint8Array(n);
                                while (n--) {
                                  u8arr[n] = bstr.charCodeAt(n);
                                }
                                const blob = new Blob([u8arr], { type: mime });
                                const blobUrl = URL.createObjectURL(blob);
                                setArchivoModalUrl({ url: blobUrl, nombre: anuncio.archivo, raw: anuncio.archivoUrl });
                              } catch (e) {
                                setArchivoModalUrl({ url: anuncio.archivoUrl, nombre: anuncio.archivo, raw: anuncio.archivoUrl });
                              }
                            } else if (anuncio.archivoUrl) {
                              setArchivoModalUrl({ url: anuncio.archivoUrl, nombre: anuncio.archivo, raw: anuncio.archivoUrl });
                            } else {
                              alert("Este anuncio anterior no cuenta con el archivo en Base64. Publica un nuevo aviso para visualizarlo en tiempo real.");
                            }
                          }}
                          className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-[10px] font-black uppercase transition-all shadow-xs cursor-pointer flex items-center gap-1"
                          title="Ver documento en modal"
                        >
                          👁️ Ver
                        </button>

                        {/* BOTÓN DESCARGAR DIRECTO */}
                        <button 
                          type="button" 
                          onClick={() => {
                            if (anuncio.archivoUrl) {
                              const link = document.createElement('a');
                              link.href = anuncio.archivoUrl;
                              link.download = anuncio.archivo || 'documento_oficial';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            } else {
                              alert("No hay archivo disponible para descargar en este anuncio antiguo.");
                            }
                          }}
                          className="px-3 py-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-black hover:to-black text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-md cursor-pointer"
                        >
                          📥 Descargar
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ));
            })()}
          </div>

          {/* Pie del Modal */}
          <div className="bg-white px-6 py-3.5 flex justify-between items-center border-t border-gray-200 shadow-inner">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Servidor de Anuncios Oficial SEP | 2026
            </span>
            <button 
              type="button" 
              onClick={() => setMostrarAvisos(false)}
              className="bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-900 hover:to-black text-white px-7 py-2 text-xs font-black uppercase rounded-xl transition-all cursor-pointer shadow-md"
            >
              Cerrar Anuncios ✓
            </button>
          </div>

        </div>
      </div>
    )}

    {/* SUB-MODAL SECUNDARIO: VISOR INTEGRADO DE DOCUMENTOS (PDF / IMAGEN) */}
    {archivoModalUrl && (
      <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
        <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border-4 border-amber-500">
          
          {/* Barra superior del visor */}
          <div className="bg-amber-900 text-white px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-base">📄</span>
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-200">
                Visualizador de Documento: {archivoModalUrl.nombre}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = archivoModalUrl.raw || archivoModalUrl.url;
                  link.download = archivoModalUrl.nombre;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase shadow-md transition-all cursor-pointer"
              >
                📥 Descargar Archivo
              </button>
              <button
                type="button"
                onClick={() => setArchivoModalUrl(null)}
                className="bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all cursor-pointer"
                title="Cerrar visor"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Contenedor del Visor (iframe para PDF / img para imágenes) */}
          <div className="flex-1 bg-gray-900 relative flex items-center justify-center p-2">
            {archivoModalUrl.nombre.match(/\.(jpg|jpeg|png|webp|gif)$/i) || (archivoModalUrl.raw && archivoModalUrl.raw.startsWith('data:image/')) ? (
              <img 
                src={archivoModalUrl.url} 
                alt="Vista previa" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : (
              <iframe 
                src={archivoModalUrl.url} 
                className="w-full h-full rounded-lg border-0 bg-white"
                title="Visor de documento"
              />
            )}
          </div>

        </div>
      </div>
    )}
           
          {/* BOTÓN 2: NORMATIVIDAD USICAMM */}
          <button
            type="button"
            onClick={() => setMostrarMarcoNormativo(true)}
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#691C32] via-[#521326] to-[#3d0e1c] text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md hover:shadow-xl hover:shadow-[#691C32]/40 border border-[#BC955C]/60 hover:border-[#BC955C] transition-all duration-300 active:scale-95 cursor-pointer overflow-hidden"
            title="Consultar Disposiciones Marco USICAMM"
          >
            {/* Destello metálico al pasar el cursor */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>

            {/* Indicador pulsante interactivo */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-amber-300 to-yellow-500 shadow-[0_0_6px_#f59e0b]"></span>
            </span>

            <span className="text-xs group-hover:scale-110 transition-transform">⚖️</span>
            <span className="group-hover:text-amber-200 transition-colors font-extrabold tracking-widest">
              Normatividad
            </span>
            
            {/* Badge de Ciclo Oficial Metalizado */}
            <span className="bg-gradient-to-r from-[#BC955C] to-[#987540] text-[8px] text-white font-black px-1.5 rounded-md uppercase leading-none py-0.5 shadow-inner border border-amber-200/40">
              2026-2027
            </span>
          </button>

        </div>
      </div>

      {/* VENTANA FLOTANTE MODAL: MARCO NORMATIVO OFICIAL USICAMM 2026-2027 */}
      {mostrarMarcoNormativo && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fadeIn transition-all">
          <div className="bg-white/95 w-full max-w-4xl border-2 border-[#BC955C]/60 shadow-[0_25px_60px_-15px_rgba(105,28,50,0.5)] rounded-2xl overflow-hidden flex flex-col max-h-[88vh] backdrop-saturate-150">
            
            {/* Encabezado Institucional Premium (Guinda SEP y Dorado) */}
            <div className="relative bg-gradient-to-r from-[#691C32] via-[#4A1322] to-[#2D0A14] px-6 py-4 text-white flex justify-between items-center border-b-4 border-[#BC955C] shadow-md">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BC955C] to-[#691C32] p-[2px] shadow-lg shadow-black/40">
                  <div className="w-full h-full bg-[#4A1322] rounded-[10px] flex items-center justify-center text-xl shadow-inner">
                    ⚖️
                  </div>
                </div>
                <div>
                  <h2 className="text-[10px] font-black tracking-widest uppercase text-amber-300 bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/30 inline-block">
                    Secretaría de Educación Pública — SEP
                  </h2>
                  <p className="text-xs font-black text-white uppercase tracking-wide mt-0.5">
                    Disposiciones Marco y Lineamientos Oficiales — USICAMM 2026-2027
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => setMostrarMarcoNormativo(false)}
                className="relative z-10 text-white/80 hover:text-white bg-white/10 hover:bg-red-600/80 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 border border-white/20 hover:border-red-400 cursor-pointer shadow-md active:scale-90"
                title="Cerrar ventana"
              >
                ✕
              </button>
            </div>

            {/* Contenido Completo de la Normativa */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs leading-relaxed text-gray-700 bg-gradient-to-b from-slate-50 to-amber-50/20 flex-1">
              
              {/* Aviso Institucional */}
              <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-l-4 border-[#BC955C] p-4 rounded-r-xl shadow-xs border border-amber-200/60">
                <div className="flex items-start gap-3">
                  <span className="text-amber-700 text-base mt-0.5">📌</span>
                  <div>
                    <p className="font-black text-gray-900 uppercase tracking-wide text-xs">
                      Aviso Institucional de Cumplimiento Obligatorio & Auditable
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      Compendio normativo vigente que regula los procesos de admisión, promoción, reconocimiento, licencias, cambios de adscripción e incidencias del personal docente y administrativo de educación básica y media superior.
                    </p>
                  </div>
                </div>
              </div>

              {/* Acordeón de Artículos y Lineamientos de la USICAMM */}
              <div className="space-y-3">
                
                {/* 1. LGSMM */}
                <details className="group bg-white border border-gray-200 rounded-xl shadow-xs p-4 open:border-[#691C32] open:ring-2 open:ring-[#691C32]/15 open:shadow-xl transition-all duration-300 hover:border-[#BC955C]">
                  <summary className="font-black text-gray-800 group-open:text-[#691C32] uppercase cursor-pointer flex justify-between items-center select-none text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#691C32] to-[#4A1322] text-amber-300 flex items-center justify-center text-[10px] font-black shadow-md">
                        01
                      </span>
                      <span>Art. 3o. Constitucional & Ley General del Sistema para la Carrera (USICAMM)</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-100 group-open:bg-[#691C32] group-open:text-white flex items-center justify-center text-[10px] transition-all duration-300 group-open:rotate-180 shadow-xs">▼</span>
                  </summary>
                  <div className="mt-3 text-gray-600 border-t border-gray-100 pt-3 text-[11px] leading-relaxed pl-8 space-y-2">
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Asignación de Plazas (Art. 39, 40 y 52 LGSMM):</strong> Regula la asignación transparente de plazas vacantes definitivas y temporales mediante listas ordenadas de resultados validadas por la Federación.</span>
                    </p>
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Nombramiento Definitivo (Código 95):</strong> Requiere la prestación ininterrumpida del servicio durante seis meses y un día, sin nota desfavorable en el expediente personal.</span>
                    </p>
                  </div>
                </details>

                {/* 2. Principios Rectores */}
                <details className="group bg-white border border-gray-200 rounded-xl shadow-xs p-4 open:border-[#691C32] open:ring-2 open:ring-[#691C32]/15 open:shadow-xl transition-all duration-300 hover:border-[#BC955C]">
                  <summary className="font-black text-gray-800 group-open:text-[#691C32] uppercase cursor-pointer flex justify-between items-center select-none text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#691C32] to-[#4A1322] text-amber-300 flex items-center justify-center text-[10px] font-black shadow-md">
                        02
                      </span>
                      <span>Principios Rectores e Imparcialidad Administrativa (Acuerdos 2026-2027)</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-100 group-open:bg-[#691C32] group-open:text-white flex items-center justify-center text-[10px] transition-all duration-300 group-open:rotate-180 shadow-xs">▼</span>
                  </summary>
                  <div className="mt-3 text-gray-600 border-t border-gray-100 pt-3 text-[11px] leading-relaxed pl-8 space-y-2">
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span>Todos los trámites de permisos e incidencias operan strictly bajo los principios de <strong>legalidad, certeza, imparcialidad, objetividad, transparencia y equidad de género</strong>.</span>
                    </p>
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span>Queda prohibida cualquier regularización, excepción o trámite extemporáneo fuera de las plataformas oficiales aprobadas por la USICAMM.</span>
                    </p>
                  </div>
                </details>

                {/* 3. Control de Incidencias */}
                <details className="group bg-white border border-gray-200 rounded-xl shadow-xs p-4 open:border-[#691C32] open:ring-2 open:ring-[#691C32]/15 open:shadow-xl transition-all duration-300 hover:border-[#BC955C]">
                  <summary className="font-black text-gray-800 group-open:text-[#691C32] uppercase cursor-pointer flex justify-between items-center select-none text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#691C32] to-[#4A1322] text-amber-300 flex items-center justify-center text-[10px] font-black shadow-md">
                        03
                      </span>
                      <span>Lineamientos para el Control de Incidencias y Candados de Fechas</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-100 group-open:bg-[#691C32] group-open:text-white flex items-center justify-center text-[10px] transition-all duration-300 group-open:rotate-180 shadow-xs">▼</span>
                  </summary>
                  <div className="mt-3 text-gray-600 border-t border-gray-100 pt-3 text-[11px] leading-relaxed pl-8 space-y-2">
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Límite de Captura:</strong> Candado informático restrictivo programado a un máximo de 3 incidencias mensuales por usuario en el sistema.</span>
                    </p>
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Restricción de Días Inhábiles:</strong> Queda prohibido seleccionar sábados o domingos. Toda fecha reportada en fin de semana emitirá una alerta por <em>Error en Congruencia de Fechas</em>.</span>
                    </p>
                  </div>
                </details>

                {/* 4. Validaciones ISSSTE & OIC */}
                <details className="group bg-white border border-gray-200 rounded-xl shadow-xs p-4 open:border-[#691C32] open:ring-2 open:ring-[#691C32]/15 open:shadow-xl transition-all duration-300 hover:border-[#BC955C]">
                  <summary className="font-black text-gray-800 group-open:text-[#691C32] uppercase cursor-pointer flex justify-between items-center select-none text-xs transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-gradient-to-br from-[#691C32] to-[#4A1322] text-amber-300 flex items-center justify-center text-[10px] font-black shadow-md">
                        04
                      </span>
                      <span>Validación ISSSTE & Responsabilidades Administrativas (LGA)</span>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-gray-100 group-open:bg-[#691C32] group-open:text-white flex items-center justify-center text-[10px] transition-all duration-300 group-open:rotate-180 shadow-xs">▼</span>
                  </summary>
                  <div className="mt-3 text-gray-600 border-t border-gray-100 pt-3 text-[11px] leading-relaxed pl-8 space-y-2">
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Incapacidad Médica:</strong> Las licencias por salud requieren certificados con Folio Oficial expedidos por el ISSSTE.</span>
                    </p>
                    <p className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                      <span className="text-[#691C32] font-black">✦</span>
                      <span><strong>Causales de Anulación & OIC:</strong> Proporcionar información falsa anula la solicitud y se remite ante el Órgano Interno de Control bajo la Ley General de Responsabilidades Administrativas.</span>
                    </p>
                  </div>
                </details>

              </div>
            </div>

            {/* Pie del Modal */}
            <div className="bg-white px-6 py-4 flex justify-between items-center border-t border-gray-200 shadow-inner">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Plataforma Oficial Verificada USICAMM 2026-2027
              </span>
              <button 
                type="button" 
                onClick={() => setMostrarMarcoNormativo(false)}
                className="bg-gradient-to-r from-[#691C32] to-[#4A1322] hover:from-[#521326] hover:to-[#310915] text-white px-7 py-2.5 text-xs font-black uppercase rounded-xl shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-95 border border-amber-300/30"
              >
                Entendido / Cerrar Ventana ✓
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PIE DE PÁGINA INFERIOR */}
      <div className="w-full max-w-5xl bg-gray-50 border-t border-gray-200 py-2.5 px-6 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
        <span>USICAMM - Sistema de Control Interno</span>
        <span>SEP | 2026</span>
      </div>
    </main>
  );
}
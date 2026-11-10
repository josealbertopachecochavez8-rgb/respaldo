'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DgaPage() {
  const router = useRouter();
  
  // Tema institucional / Color de Fondo
  const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('PENDIENTE');

  // Fuente de verdad sincronizada con localStorage
  const [incidencias, setIncidencias] = useState<any[]>([]);

  // Cargar incidencias institucionales enfocadas estrictamente en Trabajo a Distancia
  useEffect(() => {
    const cargarIncidencias = () => {
      const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
      
      const incidenciasFormateadas = guardadas
        .filter((item: any) => {
          const tipo = (item.incidencia || item.tipo || '').toUpperCase();
          return tipo.includes('TRABAJO A DISTANCIA');
        })
        .map((item: any) => ({
          id: item.folioDigital || item.id || 'ID-0000',
          nombre: item.nombreEmpleado || item.nombre || 'SERVIDOR PÚBLICO',
          tipo: 'TRABAJO A DISTANCIA',
          obs: item.justificacion || item.obs || 'Guardia y cumplimiento de funciones desde domicilio autorizado.',
          estatus: item.estatus || 'PENDIENTE'
        }));

      setIncidencias(incidenciasFormateadas.length > 0 ? incidenciasFormateadas : [
        { 
          id: 'TD-2026-014', 
          nombre: 'LIC. MARÍA ELENA SÁNCHEZ RAMÍREZ', 
          tipo: 'TRABAJO A DISTANCIA', 
          obs: 'Guardia operativa y análisis de dictámenes técnicos bajo modalidad a distancia.', 
          estatus: 'PENDIENTE' 
        },
        { 
          id: 'TD-2026-015', 
          nombre: 'MTRO. CARLOS ALBERTO MENDOZA VILLA', 
          tipo: 'TRABAJO A DISTANCIA', 
          obs: 'Seguimiento a plataformas digitales institucionales desde domicilio asignado.', 
          estatus: 'AUTORIZADO' 
        },
        { 
          id: 'TD-2026-016', 
          nombre: 'DRA. SOFÍA GUADALUPE NAVARRO PÉREZ', 
          tipo: 'TRABAJO A DISTANCIA', 
          obs: 'Atención de asuntos normativos prioritarios de manera remota.', 
          estatus: 'RECHAZADO' 
        }
      ]);
    };

    cargarIncidencias();
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'blue' : 'light'));

  const manejarAccion = (id: string, accion: 'AUTORIZAR' | 'RECHAZAR') => {
    const nuevoEstatus = accion === 'AUTORIZAR' ? 'AUTORIZADO' : 'RECHAZADO';
    
    const actualizadas = incidencias.map(item => {
      if (item.id === id) {
        return { ...item, estatus: nuevoEstatus };
      }
      return item;
    });
    setIncidencias(actualizadas);

    const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    const localActualizado = guardadas.map((item: any) => {
      if ((item.folioDigital || item.id) === id) {
        return { ...item, estatus: nuevoEstatus };
      }
      return item;
    });
    localStorage.setItem("base_incidencias", JSON.stringify(localActualizado));

    alert(`Se ha ${nuevoEstatus.toLowerCase()} enviado.`);
  };

  // Reporte estadístico institucional en PDF exclusivo de Trabajo a Distancia
  const descargarPdfEstadistico = () => {
    const resumen: { [key: string]: { autorizados: number; rechazados: number; pendientes: number } } = {};

    incidencias.forEach(item => {
      const persona = item.nombre || 'DESCONOCIDO';
      if (!resumen[persona]) {
        resumen[persona] = { autorizados: 0, rechazados: 0, pendientes: 0 };
      }
      const est = (item.estatus || '').toUpperCase();
      if (est.includes('AUTORIZ') || est.includes('ACEPT')) {
        resumen[persona].autorizados += 1;
      } else if (est.includes('RECHAZ')) {
        resumen[persona].rechazados += 1;
      } else {
        resumen[persona].pendientes += 1;
      }
    });

    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert("Habilita las ventanas emergentes para descargar el reporte institucional.");
      return;
    }

    let htmlContenido = `
      <html>
        <head>
          <title>Dictamen Estadístico - Trabajo a Distancia (DGA)</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 30px; color: #111; }
            h2, h3 { text-align: center; color: #691C32; margin: 5px 0; }
            p { text-align: center; font-size: 11px; color: #444; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #999; padding: 8px 12px; text-align: left; font-size: 11px; }
            th { background-color: #691C32; color: white; text-transform: uppercase; }
            .firma { margin-top: 80px; text-align: center; font-weight: bold; font-size: 11px; }
          </style>
        </head>
        <body>
          <h2>SECRETARÍA DE EDUCACIÓN PÚBLICA</h2>
          <table>
            <thead>
              <tr>
                <th>Servidor Público (Funcionario)</th>
                <th>Autorizados</th>
                <th>Rechazados</th>
                <th>Pendientes</th>
              </tr>
            </thead>
            <tbody>
    `;

    Object.keys(resumen).forEach(persona => {
      htmlContenido += `
        <tr>
          <td><b>${persona}</b></td>
          <td>${resumen[persona].autorizados}</td>
          <td>${resumen[persona].rechazados}</td>
          <td>${resumen[persona].pendientes}</td>
        </tr>
      `;
    });

    htmlContenido += `
            </tbody>
          </table>
          <div class="firma">
            ATENTAMENTE<br><br><br>
            ___________________________________________________<br>
            ING. JOSÉ ALBERTO PACHECO CHÁVEZ<br>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    ventana.document.write(htmlContenido);
    ventana.document.close();
  };

  const isDark = theme !== 'light';

  // Filtro exclusivo para Trabajo a Distancia y estados correspondientes
  const incidenciasFiltradas = incidencias.filter(item => {
    const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) || item.id.toLowerCase().includes(busqueda.toLowerCase());
    
    // Restricción estricta de competencia del DGA: ÚNICAMENTE TRABAJO A DISTANCIA
    const esTrabajoADistancia = item.tipo.toUpperCase().includes('TRABAJO A DISTANCIA');

    let coincideEstado = true;
    if (estado !== 'VER TODO') {
      coincideEstado = item.estatus.toUpperCase() === estado.toUpperCase();
    }

    return coincideBusqueda && esTrabajoADistancia && coincideEstado;
  });

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 font-sans ${
      theme === 'light' ? 'bg-gray-100/60' : theme === 'dark' ? 'bg-black' : 'bg-[#0f172a]'
    }`}>
      
      {/* Botón de Cambiar Tema */}
      <div className="max-w-7xl mx-auto flex justify-end mb-3">
        <button 
          onClick={toggleTheme} 
          className={`text-xl p-2 rounded-full border-2 transition-transform hover:scale-110 bg-white/80 shadow-sm ${
            isDark ? 'border-white text-white bg-slate-800' : 'border-gray-200'
          }`}
        >
          {theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💙'}
        </button>
      </div>

      <div className={`max-w-7xl mx-auto rounded-3xl shadow-2xl p-6 md:p-10 border flex flex-col justify-between min-h-[85vh] transition-colors duration-300 ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-100 text-gray-800'
      }`}>
        
        <div>
          {/* ENCABEZADO INSTITUCIONAL */}
          <div className={`flex justify-between items-center pb-6 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <img src="/logo-sep.png" alt="Educación" className={`h-10 object-contain ${isDark ? 'invert' : ''}`} />
            </div>

            <div className="text-center">
              <h1 className="text-xs md:text-sm font-black tracking-widest uppercase">
                Sistema Integral de Validación Institucional
              </h1>
              <p className="text-[10px] font-bold text-[#691C32] tracking-wider uppercase mt-0.5">
                Módulo Exclusivo: Autorización de Trabajo a Distancia 
              </p>
            </div>

            <div className="flex items-center gap-4">
              <img src="/logo-usicamm.png" alt="USICAMM" className={`h-9 object-contain ${isDark ? 'invert' : ''}`} />
              
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/roles')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                  <div className={`relative w-11 h-11 flex items-center justify-center rounded-xl border shadow-sm group-hover:border-[#BC955C] transition-all duration-500 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}>
                    <span className="text-xl group-hover:scale-125 transition-transform duration-500">◀️</span>
                  </div>
                  <span className="text-[7px] font-black text-slate-400 group-hover:text-[#BC955C] uppercase tracking-[0.2em]">Regresar</span>
                </button>

                <button onClick={() => router.push('/')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                  <div className={`relative w-11 h-11 flex items-center justify-center rounded-xl border shadow-sm group-hover:border-red-500 transition-all duration-500 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}>
                    <span className="text-xl group-hover:translate-x-1 transition-transform duration-500">🚪</span>
                  </div>
                  <span className="text-[7px] font-black text-slate-400 group-hover:text-red-500 uppercase tracking-[0.2em]">Salir</span>
                </button>
              </div>
            </div>
          </div>

          {/* BARRA DE FILTROS Y ACCIONES */}
          <div className={`my-6 p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/70 border-slate-100'
          }`}>
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Servidor Público</label>
              <input
                type="text"
                placeholder="BUSCAR POR NOMBRE O FOLIO..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                }`}
              />
            </div>

            <div className="w-56">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Filtrar por Estatus</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="VER TODO">📂 VER TODO</option>
                <option value="PENDIENTE">⏳ PENDIENTE</option>
                <option value="AUTORIZADO">✔️ AUTORIZADO</option>
                <option value="RECHAZADO">❌ RECHAZADO</option>
              </select>
            </div>

            <div className="self-end">
              <button
                onClick={descargarPdfEstadistico}
                className="bg-[#691C32] hover:bg-[#521526] text-white font-black text-xs px-4 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>📄</span> DESCARGAR INFORME ESTADÍSTICO (PDF)
              </button>
            </div>
          </div>

          {/* TABLA DE REGISTROS DE TRABAJO A DISTANCIA */}
          <div className={`overflow-x-auto rounded-2xl border p-2 ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/40 border-gray-100'}`}>
            <table className="w-full text-left text-[11px] uppercase border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 font-extrabold tracking-wider">
                  <th className="px-4 py-2">Folio Digital</th>
                  <th className="px-4 py-2">Servidor Público</th>
                  <th className="px-4 py-2">Modalidad</th>
                  <th className="px-4 py-2">Estatus Institucional</th>
                  <th className="px-4 py-2">Justificación / Descripción</th>
                  <th className="px-4 py-2 text-center">Acciones DGA</th>
                </tr>
              </thead>
              <tbody>
                {incidenciasFiltradas.length > 0 ? (
                  incidenciasFiltradas.map((item) => (
                    <tr key={item.id} className={`rounded-xl shadow-sm transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                      <td className="px-4 py-4 font-black rounded-l-xl text-[#691C32]">{item.id}</td>
                      <td className="px-4 py-4 font-bold">{item.nombre}</td>
                      <td className="px-4 py-4 font-bold">
                        <span className="bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 px-2 py-1 rounded text-[10px]">
                          {item.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-md ${
                          item.estatus === 'AUTORIZADO' || item.estatus === 'ACEPTADO' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.estatus === 'RECHAZADO' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.estatus}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-semibold normal-case ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>{item.obs}</td>
                      <td className="px-4 py-4 rounded-r-xl">
                        <div className="flex justify-center gap-2">
                          {item.estatus === 'PENDIENTE' ? (
                            <>
                              <button
                                onClick={() => manejarAccion(item.id, 'AUTORIZAR')}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                AUTORIZAR
                              </button>
                              <button
                                onClick={() => manejarAccion(item.id, 'RECHAZAR')}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                RECHAZAR
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 italic">Dictaminado</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`text-center py-8 font-bold rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-400'}`}>
                      No se encontraron solicitudes de trabajo a distancia bajo el criterio seleccionado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE DE PÁGINA INSTITUCIONAL */}
        <div className={`flex flex-col sm:flex-row justify-between items-end mt-12 pt-4 border-t text-[10px] font-black uppercase text-[#691C32] tracking-wider ${
          isDark ? 'border-slate-800' : 'border-gray-100'
        }`}>
          <div className="space-y-0.5 border-t-2 border-[#691C32] pt-2">
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración </p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección de Administración y Finanzas</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Subdirección de Recursos Humanos y Organización</p>
          </div>

          <div className={`mt-4 sm:mt-0 pb-1 border-b-2 font-extrabold text-xs tracking-normal ${
            isDark ? 'border-slate-100 text-white' : 'border-slate-800 text-slate-900'
          }`}>
            ING. JOSÉ ALBERTO PACHECO CHÁVEZ
          </div>
        </div>

      </div>
    </div>
  );
}
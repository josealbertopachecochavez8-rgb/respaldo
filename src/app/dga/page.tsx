'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DgaPage() {
  const router = useRouter();
  
  // Tema / Color de Fondo
  const [theme, setTheme] = useState<'light' | 'dark' | 'blue'>('light');
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('PENDIENTES');

  // Fuente de verdad sincronizada con localStorage
  const [incidencias, setIncidencias] = useState<any[]>([]);

  // Cargar incidencias guardadas al montar el componente
  useEffect(() => {
    const cargarIncidencias = () => {
      const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
      
      const incidenciasFormateadas = guardadas.map((item: any) => ({
        id: item.folioDigital || item.id || 'ID-0000',
        nombre: item.nombreEmpleado || item.nombre || 'SERVIDOR PÚBLICO',
        tipo: item.incidencia || item.tipo || 'COMISIÓN',
        obs: item.justificacion || item.obs || 'Sin descripción',
        clasificacion: item.clasificacion || 'ORDINARIA',
        estatus: item.estatus || 'PENDIENTE'
      }));

      setIncidencias(incidenciasFormateadas.length > 0 ? incidenciasFormateadas : [
        { id: 'ID-8829', nombre: 'PACHECO CHÁVEZ JOSE ALBERTO', tipo: 'COMISIÓN DE ENTRADA', obs: 'Comisión oficial en SEP Central', clasificacion: 'ORDINARIA', estatus: 'PENDIENTE' },
        { id: 'ID-9012', nombre: 'GÓMEZ RUIZ MARÍA ELENA', tipo: 'COMISIÓN DE SALIDA', obs: 'Traslado a unidad administrativa', clasificacion: 'ORDINARIA', estatus: 'PENDIENTE' },
        { id: 'ID-5521', nombre: 'ARENAS MARTÍNEZ ETHEL', tipo: 'COMISIÓN TODO EL DIA', obs: 'Supervisión de sede de examen', clasificacion: 'EXTRAORDINARIA', estatus: 'PENDIENTE' }
      ]);
    };

    cargarIncidencias();
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'blue' : 'light'));

  const manejarAccion = (id: string, accion: 'AUTORIZAR' | 'RECHAZAR') => {
    const nuevoEstatus = accion === 'AUTORIZAR' ? 'AUTORIZADO' : 'RECHAZADO';
    
    // Actualizamos en memoria local del componente
    const actualizadas = incidencias.map(item => {
      if (item.id === id) {
        return { ...item, estatus: nuevoEstatus };
      }
      return item;
    });
    setIncidencias(actualizadas);

    // Actualizamos en localStorage y notificamos simulación al empleado
    const guardadas = JSON.parse(localStorage.getItem("base_incidencias") || "[]");
    const localActualizado = guardadas.map((item: any) => {
      if ((item.folioDigital || item.id) === id) {
        return { ...item, estatus: nuevoEstatus };
      }
      return item;
    });
    localStorage.setItem("base_incidencias", JSON.stringify(localActualizado));

    alert(`Se ha ${nuevoEstatus.toLowerCase()} la comisión y se ha notificado al empleado .`);
  };

  const isDark = theme !== 'light';

  // Filtrado compuesto (Búsqueda + Estado seleccionado)
  const incidenciasFiltradas = incidencias.filter(item => {
    const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) || item.id.toLowerCase().includes(busqueda.toLowerCase());
    
    // Filtrado de comisiones exclusivas para DGA (Entrada, Salida, Todo el día)
    const esComisionDGA = 
      item.tipo.includes('COMISIÓN DE ENTRADA') || 
      item.tipo.includes('COMISIÓN DE SALIDA') || 
      item.tipo.includes('COMISIÓN TODO EL DIA') || 
      item.tipo.includes('COMISIÓN TODO EL DÍA');

    let coincideEstado = true;
    if (estado === 'PENDIENTES') {
      coincideEstado = item.estatus === 'PENDIENTE' || item.estatus === 'PENDIENTES';
    } else if (estado === 'ACEPTADOS' || estado === 'AUTORIZADOS') {
      coincideEstado = item.estatus === 'AUTORIZADO' || item.estatus === 'ACEPTADO';
    } else if (estado === 'RECHAZADOS') {
      coincideEstado = item.estatus === 'RECHAZADO';
    } else if (estado === 'VER TODO') {
      coincideEstado = true;
    }

    return coincideBusqueda && esComisionDGA && coincideEstado;
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
          {/* ENCABEZADO */}
          <div className={`flex justify-between items-center pb-6 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <img src="/logo-sep.png" alt="Educación" className={`h-10 object-contain ${isDark ? 'invert' : ''}`} />
            </div>

            <h1 className="text-sm md:text-base font-black tracking-wide text-center uppercase">
              Sistema Integral de Incidencias de Personal 
            </h1>

            <div className="flex items-center gap-4">
              <img src="/logo-usicamm.png" alt="USICAMM" className={`h-9 object-contain ${isDark ? 'invert' : ''}`} />
              
              {/* BOTONES REGRESAR Y SALIR CON FUNCIONALIDAD DE ROUTER */}
              <div className="flex items-center gap-3">
                <button onClick={() => router.push('/roles')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                  <div className={`relative w-11 h-11 flex items-center justify-center rounded-xl border shadow-sm group-hover:border-[#BC955C] group-hover:shadow-[0_0_15px_rgba(188,149,92,0.2)] transition-all duration-500 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}>
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-slate-300 group-hover:border-[#BC955C]"></div>
                    <span className="text-xl group-hover:scale-125 transition-transform duration-500">◀️</span>
                  </div>
                  <span className="text-[7px] font-black text-slate-400 group-hover:text-[#BC955C] uppercase tracking-[0.2em]">Regresar</span>
                </button>

                <button onClick={() => router.push('/')} className="group relative flex flex-col items-center gap-1 transition-all duration-300">
                  <div className={`relative w-11 h-11 flex items-center justify-center rounded-xl border shadow-sm group-hover:border-red-500 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all duration-500 ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                  }`}>
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-slate-300 group-hover:border-red-500"></div>
                    <span className="text-xl group-hover:translate-x-1 transition-transform duration-500">🚪</span>
                  </div>
                  <span className="text-[7px] font-black text-slate-400 group-hover:text-red-500 uppercase tracking-[0.2em]">Salir</span>
                </button>
              </div>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS ACTUALIZADA */}
          <div className={`my-6 p-6 rounded-2xl border flex flex-wrap items-center justify-between gap-4 ${
            isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50/70 border-slate-100'
          }`}>
            <div className="flex-1 min-w-[250px]">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Persona</label>
              <input
                type="text"
                placeholder="BUSCAR POR NOMBRE O ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                }`}
              />
            </div>

            {/* LISTA DESPLEGABLE DE ESTADOS SOLICITADA */}
            <div className="w-64">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Filtrar por Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none ${
                  isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                <option value="VER TODO">📂 VER TODO</option>
                <option value="PENDIENTES">⏳ PENDIENTES</option>
                <option value="AUTORIZADOS">✅ AUTORIZADOS</option>
                <option value="RECHAZADOS">❌ RECHAZADOS</option>
              </select>
            </div>
          </div>

          {/* TABLA DE INCIDENCIAS */}
          <div className={`overflow-x-auto rounded-2xl border p-2 ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/40 border-gray-100'}`}>
            <table className="w-full text-left text-[11px] uppercase border-separate border-spacing-y-2">
              <thead>
                <tr className="text-gray-400 font-extrabold tracking-wider">
                  <th className="px-4 py-2">ID Incidencia</th>
                  <th className="px-4 py-2">Persona servidora pública</th>
                  <th className="px-4 py-2">Motivo</th>
                  <th className="px-4 py-2">Estatus</th>
                  <th className="px-4 py-2">Descripcion</th>
                  <th className="px-4 py-2 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {incidenciasFiltradas.length > 0 ? (
                  incidenciasFiltradas.map((item) => (
                    <tr key={item.id} className={`rounded-xl shadow-sm transition-all ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}`}>
                      <td className="px-4 py-4 font-black rounded-l-xl">{item.id}</td>
                      <td className="px-4 py-4 font-bold">{item.nombre}</td>
                      <td className="px-4 py-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="text-[#691C32]">{item.tipo}</span>
                          <span className={`text-[8px] px-2 py-0.5 rounded font-black ${
                            item.clasificacion === 'EXTRAORDINARIA' ? 'bg-amber-100 text-amber-800' : 'bg-blue-000 text-blue-800'
                          }`}>
                            
                          </span>
                        </div>
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
                          {item.estatus === 'PENDIENTE' || item.estatus === 'PENDIENTES' ? (
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
                            <span className="text-[10px] font-bold text-gray-400 italic"></span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className={`text-center py-8 font-bold rounded-xl ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-gray-400'}`}>
                      No hay comisiones de DGA que coincidan con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PIE DE PÁGINA */}
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
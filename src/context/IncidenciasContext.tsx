'use client';
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
// 1. Definimos el tipo de la incidencia (ajústalo si tus datos tienen más campos)
interface Incidencia {
  id: string;
  nombre: string;
  tipo: string;
  obs: string;
  estado: string;
}
// 2. Creamos el contexto
interface IncidenciasContextType {
  incidencias: Incidencia[];
  setIncidencias: React.Dispatch<React.SetStateAction<Incidencia[]>>;
}
const IncidenciasContext = createContext<IncidenciasContextType | undefined>(undefined);
// 3. Creamos el Provider
export const IncidenciasProvider = ({ children }: { children: ReactNode }) => {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);

  // CARGA: Al abrir la app, recuperamos de localStorage
  useEffect(() => {
    const guardados = localStorage.getItem('base_incidencias');
    if (guardados) {
      try {
        setIncidencias(JSON.parse(guardados));
      } catch (e) {
        console.error("Error al leer localStorage", e);
      }
    }
  }, []);
  // PERSISTENCIA: Cada vez que cambie "incidencias", guardamos en localStorage
  useEffect(() => {
    localStorage.setItem('base_incidencias', JSON.stringify(incidencias));
  }, [incidencias]);
  return (
    <IncidenciasContext.Provider value={{ incidencias, setIncidencias }}>
      {children}
    </IncidenciasContext.Provider>
  );
};
// 4. Hook personalizado para usarlo fácilmente
export const useIncidencias = () => {
  const context = useContext(IncidenciasContext);
  if (!context) {
    throw new Error('useIncidencias debe usarse dentro de un IncidenciasProvider');
  }
  return context;
};
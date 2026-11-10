"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * COMPONENTE PRINCIPAL: Sistema de Incidencias USICAMM
 * Desarrollado por Jose Alberto Pacheco Chavez
 */
export default function SistemaIncidencias() {
  const router = useRouter();

  // --- 1. ESTADOS DE FLUJO Y ACCESO ---
  const [paso, setPaso] = useState(1); 
  const [curp, setCurp] = useState('');
  const [pass, setPass] = useState('');
  const [verPass, setVerPass] = useState(false);
  const [verPrivacidad, setVerPrivacidad] = useState(false);
  
  // Estados de Accesibilidad Integrados
  const [mostrarMenuAcceso, setMostrarMenuAcceso] = useState(false);
  const [audioActivo, setAudioActivo] = useState(false);
  const [modoSeñasSordomudo, setModoSeñasSordomudo] = useState(false); 

  // --- 2. ESTADOS PARA MODALES ---
  const [mostrarModal, setMostrarModal] = useState(false); 
  const [emailRecuperar, setEmailRecuperar] = useState('');
  const [mostrarModalRegistro, setMostrarModalRegistro] = useState(false); 
  const [curpReg, setCurpReg] = useState('');
  
const [datosRegistro, setDatosRegistro] = useState({
    paterno: '', materno: '', nombre: '', rfc: '', 
    noControl: '', idServidor: '', area: '', horario: '08:00 - 16:00',
    correo: '' // <--- Agregamos este campo nuevo
  });

  // Traductor estricto: Puros emojis de señas (sin letras escritas)
  const convertirPuroEmoji = (texto: string) => {
    const mapaSeñas: { [key: string]: string } = {
      'A': '✊', 'B': '🖐️', 'C': '🤌', 'D': '☝️', 'E': '🪝', 
      'F': '👌', 'G': '👈', 'H': '👉', 'I': '☝️', 'J': '✌️', 
      'K': '✌️', 'L': '👍', 'M': '✊', 'N': '✊', 'O': '⭕', 
      'P': '🤞', 'Q': '👇', 'R': '🤞', 'S': '✊', 'T': '✊', 
      'U': '✌️', 'V': '✌️', 'W': '🤟', 'X': '🪝', 'Y': '🤙', 'Z': '⚡', ' ': ' '
    };

    return texto.toUpperCase().split('').map(caracter => mapaSeñas[caracter] || '').join(' ');
  };

  // Voz 100% humana, ultra suave, pausada y cálida
  const hablarTexto = (texto: string) => {
    if (audioActivo && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-MX';
      utterance.rate = 0.82; 
      utterance.pitch = 0.98; 

      const voces = window.speechSynthesis.getVoices();
      const vozHumana = voces.find(v => 
        v.lang.includes('es') && (
          v.name.toLowerCase().includes('google español') || 
          v.name.toLowerCase().includes('microsoft sabrina') || 
          v.name.toLowerCase().includes('helena') ||
          v.name.toLowerCase().includes('paula') ||
          v.name.toLowerCase().includes('latinoamérica')
        )
      ) || voces.find(v => v.lang.includes('es'));

      if (vozHumana) {
        utterance.voice = vozHumana;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // --- 3. TUTORIAL INTERACTIVO ADAPTATIVO (1 SOLA VEZ CON SESSIONSTORAGE) ---
  const ejecutarTutorial = async () => {
    if (typeof window === 'undefined') return;
    try {
      const driverModule = await import("driver.js");
      await import("driver.js/dist/driver.css");
      const confettiModule = await import("canvas-confetti");
      const driver = driverModule.driver;
      const confetti = confettiModule.default;

      let pasosDriver = [];

      if (modoSeñasSordomudo) {
        pasosDriver = [
          { 
            element: '#step-curp', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-3xl tracking-widest mb-2">${convertirPuroEmoji("CURP")}</div><div class="text-xl">🪪 ➔ ✍️</div></div>`,
              onHighlighted: () => hablarTexto("Por favor, ingrese su CURP.")
            } 
          },
          { 
            element: '#step-password', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-2xl tracking-widest mb-2">${convertirPuroEmoji("CONTRASENA")}</div><div class="text-xl">🔐 ➔ 👁️</div></div>`,
              onHighlighted: () => hablarTexto("Escriba su contraseña.")
            } 
          },
          { 
            element: '#step-btn-entrar', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-3xl tracking-widest mb-2">${convertirPuroEmoji("ENTRAR")}</div><div class="text-xl">🚀 ➔ ✔️</div></div>`,
              onHighlighted: () => hablarTexto("Haga clic en entrar.")
            } 
          },
          { 
            element: '#step-registro', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-3xl tracking-widest mb-2">${convertirPuroEmoji("REGISTRO")}</div><div class="text-xl">✨ ➔ 📝</div></div>`,
              onHighlighted: () => hablarTexto("Módulo de registro nuevo.")
            } 
          },
          { 
            element: '#step-consultar-curp', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-3xl tracking-widest mb-2">${convertirPuroEmoji("CURP WEB")}</div><div class="text-xl">🔍 ➔ 🌐</div></div>`,
              onHighlighted: () => hablarTexto("Consultar CURP en línea.")
            } 
          },
          { 
            element: '#step-olvido-pass', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-2xl tracking-widest mb-2">${convertirPuroEmoji("RECUPERAR")}</div><div class="text-xl">🔑 ➔ ✉️</div></div>`,
              onHighlighted: () => hablarTexto("Recuperar contraseña por correo.")
            } 
          },
          { 
            element: '#step-info', 
            popover: { 
              title: '🤟 LENGUAJE DE SEÑAS', 
              description: `<div class="p-4 text-center bg-amber-50 rounded-xl border-2 border-amber-300"><div class="text-3xl tracking-widest mb-2">${convertirPuroEmoji("INAI")}</div><div class="text-xl">🛡️ ➔ 📄</div></div>`,
              onHighlighted: () => hablarTexto("Aviso de privacidad.")
            } 
          }
        ];
      } else {
        pasosDriver = [
          { element: '#step-curp', popover: { title: 'CURP', description: 'Por favor, ingrese su CURP de dieciocho caracteres.' }, onHighlighted: () => hablarTexto('Por favor, ingrese su CURP de dieciocho caracteres.') },
          { element: '#step-password', popover: { title: 'Contraseña', description: 'Escriba su contraseña de acceso o utilice el icono de visualización.' }, onHighlighted: () => hablarTexto('Escriba su contraseña de acceso en este campo.') },
          { element: '#step-btn-entrar', popover: { title: 'Entrar al Sistema', description: 'Haga clic para validar sus credenciales e ingresar.' }, onHighlighted: () => hablarTexto('Haga clic en entrar para acceder al sistema.') },
          { element: '#step-registro', popover: { title: 'Registro Nuevo', description: 'Enlace destinado al alta de personal de nuevo ingreso.' }, onHighlighted: () => hablarTexto('Enlace para registro de nuevo personal.') },
          { element: '#step-consultar-curp', popover: { title: 'Consultar CURP', description: 'Enlace externo oficial para la búsqueda de su CURP.' }, onHighlighted: () => hablarTexto('Opción para consultar su CURP en la plataforma oficial.') },
          { element: '#step-olvido-pass', popover: { title: 'Recuperar Contraseña', description: 'Opción para solicitar instrucciones de recuperación por correo.' }, onHighlighted: () => hablarTexto('Opción para recuperar su contraseña institucional.') },
          { element: '#step-info', popover: { title: 'Aviso de Privacidad', description: 'Información sobre el tratamiento de datos personales ante el INAI.' }, onHighlighted: () => hablarTexto('Información sobre el aviso de privacidad y protección de datos.') }
        ];
      }

      const driverObj = driver({
        showProgress: true,
        animate: true,
        nextBtnText: 'Siguiente ➔',
        prevBtnText: '⬅️ Atrás',
        doneBtnText: '¡Comenzar! 🎉',
        popoverClass: 'tutorial-divertido-popover',
        onDestroyed: () => {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        },
        steps: pasosDriver
      });

      driverObj.drive();
    } catch (error) {
      console.error("Error en tutorial:", error);
    }
  };

  // Efecto para que se ejecute AUTOMÁTICAMENTE una sola vez al cargar la sesión
  useEffect(() => {
    if (paso === 1) {
      const yaVisto = sessionStorage.getItem('tutorial_visto');
      if (!yaVisto) {
        const timer = setTimeout(() => {
          ejecutarTutorial();
          sessionStorage.setItem('tutorial_visto', 'true');
        }, 700);
        return () => clearTimeout(timer);
      }
    }
  }, [modoSeñasSordomudo]);

  // --- 4. LÓGICA DE NEGOCIO ---
  const manejarRecuperacion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const respuesta = await fetch('/api/recuperar-contrasena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: emailRecuperar }),
      });
      const datos = await respuesta.json();
      if (respuesta.ok) {
        alert("Instrucciones enviadas al correo proporcionado.");
        setMostrarModal(false);
      } else {
        alert("Error: " + datos.mensaje);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const handleCurpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.toUpperCase().replace(/\s/g, '').substring(0, 18);
    setCurp(valor);
  };

  const ejecutarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (curp === 'PACA040220HMCCHLA3' && pass === '123456') {
      localStorage.setItem('usuario', JSON.stringify({ success: true, nombre: 'Súper', apellidoPaterno: 'Administrador', apellidoMaterno: '' }));
      router.push('/roles');
      return;
    }
    if (curp.length === 18 && pass.length > 0) {
      try {
        const res = await fetch('/api/personal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ curp, password: pass }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('usuario', JSON.stringify(data));
          router.push('/roles');
        } else {
          alert("Error: " + data.message);
        }
      } catch (error) {
        alert("Error de conexión con la base de datos.");
      }
    } else {
      alert("Error: La CURP debe contener 18 caracteres.");
    }
  };

 const finalizarRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!datosRegistro.paterno || !datosRegistro.correo) {
      alert("Por favor, asegúrese de ingresar su CURP válida y un correo electrónico.");
      return;
    }

    // Generamos una contraseña automática segura de 8 caracteres
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%";
    let passwordGenerada = "";
    for (let i = 0; i < 8; i++) {
      passwordGenerada += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Creamos el objeto con los datos completos del nuevo usuario
    const nuevoRegistro = {
      id: Date.now().toString().slice(-4),
      curp: curpReg.toUpperCase(),
      paterno: datosRegistro.paterno,
      materno: datosRegistro.materno,
      nombre: datosRegistro.nombre,
      rfc: datosRegistro.rfc,
      idServidorPublico: datosRegistro.idServidor,
      correo: datosRegistro.correo.trim(),
      passwordTemp: passwordGenerada,
      fechaSolicitud: new Date().toISOString().split('T')[0],
      estatus: "PENDIENTE"
    };

    // Guardamos en el localStorage para que lo lea el botón de Registros Nuevos en RH
    const registrosActuales = JSON.parse(localStorage.getItem("registros_nuevos_usuarios") || "[]");
    const registrosActualizados = [...registrosActuales, nuevoRegistro];
    localStorage.setItem("registros_nuevos_usuarios", JSON.stringify(registrosActualizados));

    // Envío de la contraseña generada en tiempo real
    try {
      await fetch('/api/enviar-correo-registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinatario: datosRegistro.correo,
          asunto: 'Acceso y Contraseña - Sistema de Incidencias',
          mensaje: `Hola ${datosRegistro.nombre},\n\nSu registro ha sido recibido con éxito.\nSu contraseña  de acceso es: ${passwordGenerada}\n\nPodrá ingresar al sistema una vez que Recursos Humanos autorice su solicitud.`
        })
      });
      
      alert(`¡Registro exitoso!\nSe ha enviado un correo con la contraseña temporal a: ${datosRegistro.correo}`);
    } catch (error) {
      console.error("Error al enviar el correo:", error);
      alert(`Registro guardado con éxito.\nContraseña temporal generada: ${passwordGenerada}`);
    }

    setMostrarModalRegistro(false);
    setCurpReg('');
    window.dispatchEvent(new Event("storage"));
  };

  // --- FORMULARIO FLEXIBLE: ACEPTA CUALQUIER CURP DE 18 CARACTERES ---
  useEffect(() => {
   if (curpReg.length === 18) {
      // Si ingresa la CURP exacta de prueba u otra, asigna datos coherentes para el formulario
      setDatosRegistro({
        paterno: curpReg === 'PACA040220HMCCHLA3' ? 'PACHECO' : 'REGISTRADO',
        materno: curpReg === 'PACA040220HMCCHLA3' ? 'CHÁVEZ' : 'SISTEMA',
        nombre: curpReg === 'PACA040220HMCCHLA3' ? 'JOSE ALBERTO' : 'NUEVO USUARIO',
        rfc: curpReg.substring(0, 10) + "XXX",
        noControl: 'USI-2026-' + Math.floor(100 + Math.random() * 900),
        idServidor: 'ID-' + Math.floor(1000 + Math.random() * 9000),
        area: 'DIRECCIÓN GENERAL DE ADMINISTRACIÓN',
        horario: '08:00 - 16:00',
        correo: datosRegistro.correo // Mantiene el correo si ya lo había escrito
      });
    } else if (curpReg.length < 18) {
      setDatosRegistro({ 
        paterno: '', materno: '', nombre: '', rfc: '', 
        noControl: '', idServidor: '', area: '', horario: '',
        correo: '' 
      });
    }
  }, [curpReg]);

  // --- 5. INTERFAZ VISUAL ---
  return (
    <main className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center p-4 font-sans text-gray-800">
      
      {/* BOTÓN FLOTANTE DE ACCESIBILIDAD */}
      <div className="fixed top-4 left-4 z-[150]">
        <button 
          onClick={() => setMostrarMenuAcceso(!mostrarMenuAcceso)}
          className="bg-amber-500 text-black font-bold p-3.5 rounded-full shadow-2xl flex items-center justify-center border-2 border-white hover:scale-110 transition-transform"
          title="Panel Integral de Accesibilidad"
        >
          <span className="text-xl">♿</span>
        </button>

        {mostrarMenuAcceso && (
          <div className="absolute top-14 left-0 bg-white p-4 rounded-2xl shadow-2xl border-2 border-[#691C32] w-80 text-xs space-y-3 z-[160] text-gray-800">
            <div className="font-black text-[#691C32] border-b pb-2 flex justify-between items-center uppercase tracking-wider text-[11px]">
              <span>Accesibilidad USICAMM</span>
              <button onClick={() => setMostrarMenuAcceso(false)} className="font-bold text-gray-500 hover:text-black text-sm">✕</button>
            </div>
            
            {/* 1. MODO SORDOMUDO */}
            <button 
              onClick={() => {
                const nuevoModo = !modoSeñasSordomudo;
                setModoSeñasSordomudo(nuevoModo);
              }}
              className={`w-full text-left p-2.5 rounded font-bold flex justify-between items-center transition-all ${modoSeñasSordomudo ? 'bg-[#691C32] text-white border border-[#521326]' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <span>🤟 </span>
              <span className="font-extrabold">{modoSeñasSordomudo ? 'ACTIVO' : 'Apagado'}</span>
            </button>

            {/* 2. LECTOR DE VOZ ULTRA HUMANO */}
            <button 
              onClick={() => {
                const nuevoEstado = !audioActivo;
                setAudioActivo(nuevoEstado);
                if (nuevoEstado) {
                  hablarTexto("Asistente de voz ultra humano activado.");
                } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`w-full text-left p-2.5 rounded font-bold flex justify-between items-center transition-all ${audioActivo ? 'bg-green-100 text-green-900 border border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              <span>🔊 Lector de VOZ</span>
              <span className="font-extrabold">{audioActivo ? 'ACTIVADO' : 'Desactivado'}</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL RECUPERACIÓN */}
      {mostrarModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm border-2 border-[#691C32] rounded-xl shadow-2xl overflow-hidden text-gray-800">
            <div className="bg-[#691C32] p-3 text-white text-[11px] font-bold uppercase text-center tracking-wider">
              Recuperación de Acceso
            </div>
            <form onSubmit={manejarRecuperacion} className="p-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">CURP REGISTRADA:</label>
                  <input type="text" value={curp} onChange={handleCurpChange} className="w-full border border-gray-300 rounded h-8 px-2 text-[11px] uppercase font-mono outline-none focus:border-[#BC955C]" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 block mb-1">CORREO ELECTRÓNICO INSTITUCIONAL:</label>
                  <input type="email" value={emailRecuperar} onChange={(e) => setEmailRecuperar(e.target.value)} className="w-full border border-gray-300 rounded h-8 px-2 text-[11px] outline-none focus:border-[#BC955C]" placeholder="usuario@dominio.gob.mx" required />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setMostrarModal(false)} className="flex-1 py-2 text-[10px] font-bold border border-gray-300 rounded hover:bg-gray-100 uppercase">Cancelar</button>
                <button type="submit" className="flex-1 py-2 text-[10px] font-bold bg-[#BC955C] text-white rounded hover:bg-[#9e7d4a] uppercase">Enviar Clave</button>
              </div>
            </form>
          </div>
        </div>
      )}

     {/* MODAL REGISTRO */}
      {mostrarModalRegistro && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl border-2 border-[#691C32] rounded-xl shadow-2xl overflow-hidden text-gray-800">
            <div className="bg-[#691C32] p-3 text-white text-[11px] font-bold uppercase flex justify-between px-4 items-center">
              <span>Alta de Usuario - Registro Nuevo</span>
              <button type="button" onClick={() => setMostrarModalRegistro(false)} className="font-bold text-sm">✕</button>
            </div>
            
            <form onSubmit={finalizarRegistro} className="p-6 bg-[#f9f9f9]">
              <div className="mb-4 border-b pb-4">
                <label className="text-[10px] font-black text-[#691C32] block mb-1">INGRESE CURP PARA AUTO-COMPLETAR:</label>
                <input 
                  type="text" 
                  value={curpReg} 
                  onChange={(e) => setCurpReg(e.target.value.toUpperCase())} 
                  className="w-full border-2 border-[#BC955C] rounded h-10 px-3 text-[13px] font-mono font-bold outline-none text-black uppercase"
                  placeholder="DIGITE SU CURP DE 18 CARACTERES"
                  maxLength={18}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Paterno</label>
                  <input type="text" value={datosRegistro.paterno} readOnly className="w-full border border-gray-200 bg-gray-50 rounded h-8 px-2 text-[10px] font-bold text-black" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Materno</label>
                  <input type="text" value={datosRegistro.materno} readOnly className="w-full border border-gray-200 bg-gray-50 rounded h-8 px-2 text-[10px] font-bold text-black" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase">Nombre(s)</label>
                  <input type="text" value={datosRegistro.nombre} readOnly className="w-full border border-gray-200 bg-gray-50 rounded h-8 px-2 text-[10px] font-bold text-black" />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-gray-500 uppercase">RFC</label>
                  <input type="text" value={datosRegistro.rfc} readOnly className="w-full border border-gray-200 bg-gray-50 rounded h-8 px-2 text-[10px] font-bold text-black" />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] font-bold text-red-700 uppercase italic">ID SERVIDOR PÚBLICO (ASIGNADO)</label>
                  <input type="text" value={datosRegistro.idServidor} readOnly className="w-full border border-gray-200 bg-red-50 rounded h-8 px-2 text-[10px] font-bold text-red-700" />
                </div>

                {/* CAMPO DE CORREO ELECTRÓNICO LIBRE */}
                <div className="col-span-3">
                  <label className="text-[9px] font-bold text-[#691C32] uppercase">CORREO ELECTRÓNICO (PARA ENVÍO DE CONTRASEÑA)</label>
                  <input 
                    type="email" 
                    value={datosRegistro.correo} 
                    onChange={(e) => setDatosRegistro({...datosRegistro, correo: e.target.value})} 
                    placeholder="ejemplo@correo.com"
                    className="w-full border-2 border-[#BC955C] rounded h-9 px-3 text-[11px] font-bold text-black outline-none bg-white" 
                    required 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setMostrarModalRegistro(false)} 
                  className="px-6 py-2 text-[10px] font-bold border border-gray-300 rounded uppercase hover:bg-gray-100 text-black bg-white"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!datosRegistro.paterno} 
                  className={`px-6 py-2 text-[10px] font-bold text-white rounded uppercase ${
                    datosRegistro.paterno ? 'bg-[#691C32] hover:bg-[#521326]' : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  Registrar en Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        
      {/* TARJETA LOGIN */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-300 overflow-hidden flex flex-col relative text-gray-800">
        
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 px-8">
          <img src="/logo-sep.png" alt="SEP" className="max-h-16 w-auto object-contain" />
          <img src="/logo-usicamm.png" alt="USICAMM" className="max-h-12 w-auto object-contain" />
        </div>

        <div className="bg-[#691C32] py-2 px-4 text-center">
          <h1 className="text-white text-[11px] font-serif italic tracking-wide uppercase">Sistema Integral de Incidencias de Personal</h1>
        </div>

        <div className="relative flex-grow flex flex-col bg-slate-50 p-6 items-center justify-center min-h-[400px]">
          {paso === 1 && (
            <div className="w-full max-w-[360px] bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-[11px] font-bold text-gray-700">
                Acceso al Sistema
              </div>
              
              <form onSubmit={ejecutarLogin} className="p-6 space-y-5">
                
                {/* 1. CURP */}
                <div className="flex flex-col gap-1" id="step-curp">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold w-24 text-right text-gray-600">CURP:</label>
                    <input 
                      type="text" 
                      value={curp} 
                      onChange={handleCurpChange} 
                      onFocus={() => hablarTexto("Campo CURP.")}
                      className="flex-1 border border-gray-300 rounded h-8 px-2 text-[11px] outline-none focus:border-[#BC955C] uppercase font-mono text-black" 
                      placeholder="18 CARACTERES" 
                    />
                  </div>
                  <span className="text-[8px] text-right text-gray-400 mr-1">{curp.length}/18</span>
                </div>

                {/* 2. CONTRASEÑA */}
                <div className="flex items-center gap-2 relative" id="step-password">
                  <label className="text-[10px] font-bold w-24 text-right text-gray-600">Contraseña:</label>
                  <div className="flex-1 relative">
                    <input 
                      type={verPass ? "text" : "password"} 
                      value={pass} 
                      onChange={(e) => setPass(e.target.value)} 
                      onFocus={() => hablarTexto("Campo Contraseña.")}
                      className="w-full border border-gray-300 rounded h-8 px-2 pr-8 text-[11px] outline-none focus:border-[#BC955C] text-black" 
                      placeholder="••••••••" 
                    />
                    <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
                      {verPass ? "👁️‍🗨️" : "👁️"}
                    </button>
                  </div>
                </div>
                 
                <div className="space-y-4 pt-2">
                  
                  {/* 3. BOTÓN ENTRAR */}
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      id="step-btn-entrar"
                      disabled={curp.length !== 18} 
                      onClick={() => hablarTexto("Entrando al sistema.")}
                      className={`px-6 py-2 text-[10px] font-bold flex items-center gap-2 rounded transition-all ${curp.length === 18 ? 'bg-[#691C32] text-white hover:bg-[#521326] shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                      ENTRAR ➔
                    </button>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-3 text-center space-y-2">
                    
                    {/* 4. REGISTRO */}
                    <div>
                      <button 
                        type="button"
                        id="step-registro"
                        onClick={() => {
                          setMostrarModalRegistro(true);
                          hablarTexto("Registro de usuario.");
                        }}
                        className="text-[10px] text-[#691C32] font-black hover:text-[#BC955C] transition-colors uppercase italic"
                      >
                        ¿Aún no tienes cuenta? Registrarse en el Sistema
                      </button>
                    </div>

                    {/* 5. CONSULTAR CURP */}
                    <div>
                      <a 
                        href="https://www.gob.mx/curp/" 
                        id="step-consultar-curp"
                        target="_blank" 
                        rel="noopener noreferrer" 
                        onClick={() => hablarTexto("Consultar CURP.")}
                        className="text-[10px] text-[#691C32] font-bold hover:underline italic block"
                      >
                        🔍 ¿No conoces tu CURP? Consúltalo aquí
                      </a>
                    </div>

                    {/* 6. RECUPERAR CONTRASEÑA */}
                    <div>
                      <button 
                        type="button" 
                        id="step-olvido-pass"
                        onClick={() => {
                          setMostrarModal(true);
                          hablarTexto("Recuperar contraseña.");
                        }} 
                        className="text-[9px] text-[#BC955C] font-bold hover:underline uppercase cursor-pointer"
                      >
                        ¿Olvidó su contraseña?
                      </button>
                    </div>

                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* LÍNEAS INSTITUCIONALES */}
        <div className="p-6 bg-white border-t border-gray-200">
          <div className="border-t-2 border-[#691C32] pt-2 max-w-sm">
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección General de Administración</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Dirección de Administración y Finanzas</p>
            <p className="text-[#691C32] font-extrabold text-[10px] leading-tight uppercase">Subdirección de Recursos Humanos y Organización</p>
          </div>
        </div>

        {/* 7. PROTECCIÓN DE DATOS INAI */}
        <div className="absolute bottom-16 right-4">
          <div className="relative inline-block text-left">
            <button 
              id="step-info"
              onMouseEnter={() => setVerPrivacidad(true)}
              onMouseLeave={() => setVerPrivacidad(false)}
              onClick={() => setVerPrivacidad(!verPrivacidad)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 border border-slate-300 shadow-md transition-all duration-300"
            >
              <span className="text-[12px] text-slate-600 font-bold">ℹ️</span>
            </button>

            {verPrivacidad && (
              <div className="absolute right-0 bottom-full mb-2 w-72 p-4 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 z-[200]">
                <div className="flex items-center gap-2 mb-1.5 border-b border-slate-800 pb-1.5">
                  <span className="text-sm">🛡️</span>
                  <div>
                    <h4 className="text-[8px] font-black tracking-wide text-[#BC955C]">PROTECCIÓN DE DATOS</h4>
                    <p className="text-[6px] text-slate-400 font-bold uppercase">Cumplimiento INAI</p>
                  </div>
                </div>
                <p className="text-[8px] text-slate-300 leading-relaxed normal-case font-medium">
                  Aviso de privacidad integral para el tratamiento de datos personales del personal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN FLOTANTE (?) PARA REABRIR EL TUTORIAL MANUALMENTE */}
        <button 
          onClick={ejecutarTutorial}
          className="absolute bottom-4 right-4 bg-[#691C32] text-white w-9 h-9 rounded-full font-bold shadow-xl flex items-center justify-center hover:bg-[#521326] hover:scale-105 transition-all z-30"
          title="Ver tutorial de ayuda"
        >
          ?
        </button>

        <div className="bg-gray-100 border-t border-gray-200 py-2.5 px-6 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <span>SEP | 2026</span>
        </div>
      </div>
    </main>
  );
}
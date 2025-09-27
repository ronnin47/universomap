import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo,useRef } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

import { io } from "socket.io-client";

import { API_URL } from "./config";

import { Info } from "./info";

const socket = io(API_URL); 

// 🔹 Límites del mapa
const bounds = [
  [0, 0],
  [800, 1000],
];

const iconosBase = {
  // 🌍 Mundo / Lugares / Mapas
  puntero:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRDGcwDvbcWZRhzdtg8mpIpckeykcpj84n9w&s",
  mundo: "🌍",
  personaje: "🧑",
  posada: "🛏️",
  brujula: "🧭",
  montaña: "⛰️",
  volcán: "🌋",
  río: "🌊",
  isla: "🏝️",
  bosque: "🌲",
  árbol: "🌳",
  hoja: "🍂",
  hojaCaida: "🍁",
  portal: "🌀",
  ciudad: "🏛️",
  puerto: "⚓",
  casa: "🏠",
  hogar: "🏡",
  pueblo: "🏘️",
  villa: "🏚️",
  castillo: "🏰",
  fuerte: "🏯",
  templo: "⛩️",
  iglesia: "⛪",
  academia: "🎓",
 
  mercado: "🏪",
  torre: "🗼",
  fábrica: "🏭",
  taberna: "🍺",
  cuartel: "🛡️",
  dragón: "🐉",
  serpiente: "🐍",
  monstruo: "👹",
  demonio: "👿",
  peligro: "💀",
  sol: "☀️",
  estrella: "⭐",
  estrellaBrillante: "🌟",
  cometa: "☄️",
  meteorito: "🌠",
  relámpago: "⚡",
  nieve: "❄️",
  portal: "🌌",
  rojo: "🔴",
  naranja: "🟠",
  amarillo: "🟡",
  verde: "🟢",
  azul: "🔵",
  morado: "🟣",
  blanco: "⚪",
  negro: "⚫",
  marrón: "🟤",
  romboAzul: "🔷",
  romboNaranja: "🔶",
  romboPequeñoAzul: "🔹",
  romboPequeñoNaranja: "🔸",
  triánguloArriba: "🔺",
  triánguloAbajo: "🔻",
  cuadradoBlanco: "🔳",
  cuadradoNegro: "🔲",
  estrellaDecorativa: "✴️",
  diamanteDecorativo: "💠",
  círculoDecorativo: "⭕",
  triánguloDecorativo: "🔺",
  corazón: "❤️",
  corazónRoto: "💔",
  chispa: "✨",
  flechaArriba: "⬆️",
  flechaAbajo: "⬇️",
  flechaIzquierda: "⬅️",
  flechaDerecha: "➡️",
  flechaDiagonalArribaDerecha: "↗️",
  flechaDiagonalAbajoDerecha: "↘️",
  flechaDiagonalArribaIzquierda: "↖️",
  flechaDiagonalAbajoIzquierda: "↙️",
  dobleFlechaHorizontal: "↔️",
  dobleFlechaVertical: "↕️",
  triánguloArribaPequeño: "🔼",
  triánguloAbajoPequeño: "🔽",
  signoPregunta: "❓",
  signoExclamacion: "❗",
  banderaBlanca: "🏳️",
  banderaNegra: "🏴",
  banderaPirata: "🏴‍☠️",
  moneda: "💰",
  joya: "💎",
  pergamino: "📜",
  libro: "📖",
  ánfora: "🏺",
  llave: "🗝️",
  campana: "🛎️",
  lámpara: "🪔",
  vela: "🕯️",
  piezaPuzzle: "🧩",
  herramienta: "🛠️",
  martilloYClavo: "⚒️",
  espadaCruzada: "⚔️",
  advertencia: "⚠️",
  prohibido: "🚫",
  noEntrar: "⛔",
  fuego: "🔥",
  agua: "💧",
  hielo: "🧊",
  veneno: "☠️",
  biohazard: "☣️",
  radiación: "☢️",
  pergaminoRoto: "📜",
  numero0: "0️⃣",
  numero1: "1️⃣",
  numero2: "2️⃣",
  numero3: "3️⃣",
  numero4: "4️⃣",
  numero5: "5️⃣",
  numero6: "6️⃣",
  numero7: "7️⃣",
  numero8: "8️⃣",
  numero9: "9️⃣",
  cero: "0️⃣",
  uno: "1️⃣",
  dos: "2️⃣",
  tres: "3️⃣",
  cuatro: "4️⃣",
  cinco: "5️⃣",
  seis: "6️⃣",
  siete: "7️⃣",
  ocho: "8️⃣",
  nueve: "9️⃣",
};




// 🔹 Función para crear icono desde URL o emoji
const crearIcono = (iconoUrl, tipo, tamano = 32) => {
  const icono = iconoUrl || iconosBase[tipo] || "❓";

  if (
    typeof icono === "string" &&
    (icono.startsWith("http") || icono.endsWith(".svg") || icono.endsWith(".png") || icono.endsWith(".jpg"))
  ) {
    return new L.DivIcon({
      html: `<div class="token-redondo" style="width:${tamano}px; height:${tamano}px;"><img src="${icono}" /></div>`,
      className: "",
      iconSize: [tamano, tamano],
      iconAnchor: [tamano / 2, tamano / 2],
      popupAnchor: [0, -tamano / 2],
    });
  }

  return new L.DivIcon({
    html: `<span class="token-emoji" style="font-size:${tamano}px">${icono}</span>`,
    className: "",
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
    popupAnchor: [0, -tamano / 2],
  });
};




export function CuadriculaMapa({ bounds, paso = 50, visible }) {
  const map = useMapEvent("zoom", () => {});
  const [rectangles, setRectangles] = useState([]);
  const [toast, setToast] = useState(null); // { x, y, left, top }

  useEffect(() => {
    if (!visible) {
      rectangles.forEach((rect) => rect.remove());
      setRectangles([]);
      return;
    }

    const rects = [];
    const [yMin, xMin] = bounds[0];
    const [yMax, xMax] = bounds[1];

    for (let y = yMin; y < yMax; y += paso) {
      for (let x = xMin; x < xMax; x += paso) {
        const rectBounds = [[y, x], [y + paso, x + paso]];
const rect = L.rectangle(rectBounds, {
  color: "#ffffff",        // borde blanco brillante
  weight: 0.5,               // borde más grueso
  fillColor: "#ffffff33",  // blanco semi-transparente para brillo sutil
  fillOpacity: 0.15,       // muy transparente
  dashArray: "3 3",        // línea punteada para efecto futurista
}).addTo(map);



        rect.on("click", (e) => {
          // Alterna opacidad
          rect.setStyle({ fillOpacity: rect.options.fillOpacity === 0 ? 0.2 : 0 });

          // Coordenadas X,Y (centro del cuadrante)
          const centroX = (x + (x + paso)) / 2;
          const centroY = (y + (y + paso)) / 2;

          // Convertir lat/lng a posición de pantalla
          const point = map.latLngToContainerPoint(e.latlng);

          setToast({
            x: centroX.toFixed(0),
            y: centroY.toFixed(0),
            left: point.x,
            top: point.y,
          });

          // Desaparece en 2 segundos
          setTimeout(() => setToast(null), 2000);
        });

        rects.push(rect);
      }
    }

    setRectangles(rects);

    return () => rects.forEach((r) => r.remove());
  }, [visible, bounds, paso, map]);

  return (
    <>
      {toast && (
        <div
          style={{
            position: "absolute",
            left: toast.left,
            top: toast.top,
            transform: "translate(-50%, -100%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            fontFamily: "monospace",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          X: {toast.x}, Y: {toast.y}
        </div>
      )}
    </>
  );
}

 
// 🔹 Escala los íconos según zoom y agrega clic derecho para eliminar
function EscalarIconos({ locaciones, posiciones, setPosiciones, usuario, setLocaciones, abrirModalEliminar }) {
  const map = useMapEvent("zoom", () => {
    const zoom = map.getZoom();
    const factor = Math.max(1, 1 + (zoom - 1) * 0.85);

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options._locacion) {
        const loc = layer.options._locacion;
        const nuevoTamano = loc.tamano * factor;
        layer.setIcon(crearIcono(loc.iconoUrl, loc.tipo, nuevoTamano));
      }
    });
  });

  const navigate = useNavigate();

  return locaciones.map((loc) => {
    const posicion = posiciones[loc.id] || [bounds[1][0]/2, bounds[1][1]/2];

    return (
      <Marker
        key={loc.id}
        position={posicion}
        draggable={
          (usuario === "narrador") || 
          (usuario !== "narrador" && loc.tipo === "personaje")
        }
        icon={crearIcono(loc.iconoUrl, loc.tipo, loc.tamano)}
        eventHandlers={{
          dragend: async (e) => {
            if ((usuario === "narrador") || (usuario !== "narrador" && loc.tipo === "personaje")) {
              const { lat, lng } = e.target.getLatLng();
              setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
              setLocaciones(prev =>
                prev.map(m => m.id === loc.id ? { ...m, coords_x: lng, coords_y: lat } : m)
              );

               // Emitimos al servidor
                socket.emit("moverLocacion", { id: loc.id, coords_x: lng, coords_y: lat });

              try {
                const response = await axios.post(
                  `${API_URL}/actualizarCoordenadas`,
                  { id: loc.id, coords_x: lng, coords_y: lat }
                );
                if (!response.data.ok) console.log("Error al actualizar coordenadas:", response.data.error);
              } catch (error) {
                console.log("❌ Error en la actualización de coordenadas:", error.message);
              }
            }
          },
         
            dblclick: () => {
              if (loc.tipo == "personaje") {
                navigate(`/personaje/${loc.id}`);
                console.log("Pao por personaje antes de salir")
              }else{
                navigate(`/mapaMundo/${loc.id}`);
              }
            }
          ,
          contextmenu: () => {
            if (usuario === "narrador") abrirModalEliminar(loc);
          }
        }}
        _locacion={loc}
      >
       <Popup 
       closeOnClick={true} 
       className="!p-0">
       <div className="space-y-3 w-48">
       <h2 className="text-xl font-bold text-gray-200 text-center drop-shadow-md">{loc.nombre}</h2>
       {(loc.imagenPre || loc.imagenMapaMundi) && (
       <img
        src={loc.imagenPre || loc.imagenMapaMundi}
        alt="Mapa miniatura"
        className="w-full h-24 object-cover rounded-md border border-gray-700 shadow-inner"
       />
       )}
       <p className="text-gray-300 text-sm leading-snug line-clamp-4 overflow-hidden">
          {loc.descripcion}
       </p>
       </div>
       </Popup>
      </Marker>
    );
  });
}

// 🔹 Detecta clic derecho para abrir modal
function RightClickMenu({ abrirModal }) {
  useMapEvent("contextmenu", (e) => {
    abrirModal(e.latlng);
  });
  return null;
}

// 🔹 Componente principal
export const MapaMundo = ({ usuario, locaciones, setLocaciones,historialMapas,setHistorialMapas  }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mundo = locaciones.find((l) => l.id === parseInt(id)) || {};
const [mostrarCuadricula, setMostrarCuadricula] = useState(false);
  const locacionesDelMundo = useMemo(() => 
    locaciones.filter(l => l.capa === 1 && l.mundo === mundo.id),
    [locaciones, mundo.id]
  );
/*
console.log(`Estamos en el mapa:${mundo.nombre} 
             Su id es:${mundo.id} `)
*/
  const imagenBase="https://res.cloudinary.com/dzul1hatw/image/upload/v1755123685/imagenBase_wcjism.jpg";


 useEffect(() => {
  const agregarAlHistorial = () => {
    setHistorialMapas(prev => {
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
  };

  agregarAlHistorial();
}, [id, setHistorialMapas]);

const [modalInfoVisible, setModalInfoVisible] = useState(false);


// Cada vez que cambie `mundo`, reiniciamos `camposMundo` con sus valores
useEffect(() => {
  if (mundo) {
    setCamposMundo({
      nombre: mundo.nombre || "",
      descripcion: mundo.descripcion || "",
      imagenMapa: mundo.imagenMapaMundi || "",
      tipo: mundo.tipo || "",
      icono: mundo.iconoUrl || "",
      tamano: mundo.tamano || 0,
      capa: mundo.capa || 0,
      x: mundo.coords_x || 0,
      y: mundo.coords_y || 0,
      imagenPre:mundo.imagenPre || "",
    });
  }
}, [mundo]);


useEffect(() => {
  socket.on("actualizarPersonajeMapa", ({ id, coords_x, coords_y, mundo }) => {
    setLocaciones(prev =>
      prev.map(m =>
        m.id === id ? { ...m, coords_x, coords_y, mundo } : m
      )
    );
    setPosiciones(prev => ({ ...prev, [id]: [coords_y, coords_x] }));
  });

  return () => socket.off("actualizarPersonajeMapa");
}, []);


useEffect(() => {
  socket.on("locacionMovida", ({ id, coords_x, coords_y }) => {
    setPosiciones(prev => ({ ...prev, [id]: [coords_y, coords_x] }));
    setLocaciones(prev =>
      prev.map(m => m.id === id ? { ...m, coords_x, coords_y } : m)
    );
  });

  return () => {
    socket.off("locacionMovida");
  };
}, []);

 const irAtras = () => {
  setHistorialMapas(prev => {
    if (prev.length > 1) {
      const nuevo = [...prev];
      nuevo.pop();
      const anterior = nuevo[nuevo.length - 1];

      // navegamos después de actualizar estado
      setTimeout(() => navigate(`/mapaMundo/${anterior}`), 0);

      return nuevo;
    } else {
      setTimeout(() => navigate("/mapaUniverso"), 0);
      return [];
    }
  });
};


  const locacionesCapa0 = locaciones.filter((loc) => loc.capa === 1 && loc.mundo === mundo.id);

  const [posiciones, setPosiciones] = useState({});
  useEffect(() => {
    const nuevasPosiciones = locacionesDelMundo.reduce((acc, loc) => {
      if (loc.coords_x != null && loc.coords_y != null) {
        acc[loc.id] = [parseFloat(loc.coords_y), parseFloat(loc.coords_x)];
      }
      return acc;
    }, {});
    setPosiciones(nuevasPosiciones);
  }, [locacionesDelMundo]);




  const [camposMundo, setCamposMundo] = useState({});
  const [mostrarModalMundo, setMostrarModalMundo] = useState(false);
  const referenciaModalMundo = useRef();

  // Cerrar modal al hacer click afuera
  useEffect(() => {
    const clickAfuera = (event) => {
      if (referenciaModalMundo.current && !referenciaModalMundo.current.contains(event.target)) {
        setMostrarModalMundo(false);
      }
    };
    if (mostrarModalMundo) {
      document.addEventListener("mousedown", clickAfuera);
    }
    return () => document.removeEventListener("mousedown", clickAfuera);
  }, [mostrarModalMundo]);
  

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
    tamano: "",
    iconoUrl: "",
    imagenPre:"",
  });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "puntero", descripcion: "", imagenMapaMundi: "", tamano: "", iconoUrl: "",imagenPre:"", });
    setPosicionClick([latlng.lat, latlng.lng]);
    setModalVisible(true);
  };

  const guardarLocacionMundo = async () => {
    if (!posicionClick) return;
    const nuevaLocacion = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi || imagenBase,
      iconoUrl: formData.iconoUrl || null,
      coords_x: posicionClick[1],
      coords_y: posicionClick[0],
      tamano: Number(formData.tamano) || 25,
      icono: iconosBase[formData.tipo] || "❓",
      capa: 1,
      mundo: mundo.id,
      imagenPre:formData.imagenPre || imagenBase
    };
    try {
      const response = await axios.post(`${API_URL}/guardarLocacionMundo`, nuevaLocacion);
      if (response.data.ok) {
        const locGuardada = response.data.locacion;
        setLocaciones(prev => [...prev, locGuardada]);
        setPosiciones(prev => ({ ...prev, [locGuardada.id]: [locGuardada.coords_y, locGuardada.coords_x] }));
        setModalVisible(false);
      } else console.log("Error al guardar locación:", response.data.error);
    } catch (error) {
      console.log("❌ Error en el POST:", error.message);
    }
  };

  const cargarMapa = () => {
    if (formData.imagenMapaMundi.trim()) {
      setLocaciones(prev =>
        prev.map(m => m.id === mundo.id ? { ...m, imagenMapaMundi: formData.imagenMapaMundi } : m)
      );
    }
  };

  const [modalEliminarVisible, setModalEliminarVisible] = useState(false);
  const [locacionSeleccionada, setLocacionSeleccionada] = useState(null);

  const abrirModalEliminar = (loc) => {
    setLocacionSeleccionada(loc);
    setModalEliminarVisible(true);
  };

  const eliminarLocacion = async () => {
    if (!locacionSeleccionada) return;
    try {
      await axios.delete(`${API_URL}/eliminarLocacion/${locacionSeleccionada.id}`);
      setLocaciones(prev => prev.filter(l => l.id !== locacionSeleccionada.id));
      setModalEliminarVisible(false);
    } catch (error) {
      console.log("❌ Error eliminando locación:", error.message);
    }
  };

  if (!mundo.id) return <div>Mundo no encontrado</div>;










  return (
   <div className="p-4 bg-gradient-to-b from-gray-600 via-gray-900 to-black h-screen flex flex-col">


   
<div className="mb-3">
  {/* Encabezado con título y botones */}
  <div className="flex justify-between items-center">
    {/* Título del mundo */}
    <h1 className="text-2xl font-bold text-white tracking-tight">
      {mundo.nombre}
    </h1>

    {/* Contenedor de botones */}
    <div className="flex items-center gap-2">
      {/* Botón Mostrar/Ocultar cuadrícula */}
      <button
        className="px-3 py-1.5 text-sm font-medium text-white rounded-md border border-white/50 bg-transparent hover:bg-white/10 transition-all duration-300"
        onClick={() => setMostrarCuadricula(prev => !prev)}
      >
        {mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
      </button>

      {/* Botón Volver */}
      <button
        onClick={irAtras}
        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white font-medium rounded-md shadow-md hover:bg-blue-700 hover:shadow-md transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>Volver</span>
      </button>
    </div>
  </div>
</div>
     
      


  {/* 🔹 Contenedor principal: mapa y mini-mapas */}
  <div className="w-full h-[60vh] p-1 flex gap-5" >
    {/* Mapa principal */}
    <div className="flex-1 card bg-base-200 shadow-xl rounded-2xl  overflow-hidden">
      <MapContainer
        center={[bounds[1][0] / 2, bounds[1][1] / 2]}
        zoom={1}
        minZoom={1}
        maxZoom={5}
        scrollWheelZoom
        crs={L.CRS.Simple}
        className="w-full h-full rounded-2xl"
        maxBounds={bounds}
        maxBoundsViscosity={1}

        style={{border:"1px solid white"}}
        
      >
        <ImageOverlay url={mundo.imagenMapaMundi || ""} bounds={bounds} />

                   {/* 🔹 Aquí va la cuadrícula */}
          {mostrarCuadricula && <CuadriculaMapa bounds={bounds} paso={10} visible={mostrarCuadricula} />}
        <EscalarIconos
          locaciones={locacionesDelMundo}
          posiciones={posiciones}
          setPosiciones={setPosiciones}
          usuario={usuario}
          setLocaciones={setLocaciones}
          abrirModalEliminar={abrirModalEliminar}
        />
        {usuario === "narrador" && <RightClickMenu abrirModal={abrirModal} />}
      </MapContainer>
    </div>

    {/* Panel lateral mini-mapas */}
    <div className="flex flex-col gap-3 w-32 overflow-y-auto p-3 h-[60vh]">
      {locacionesCapa0
        .filter((loc) => loc.tipo !== "personaje")
        .map((loc) => (
          <div
            key={loc.id}
            className="flex-shrink-0 cursor-pointer text-center borderHover"
            onClick={() => {
              if (loc.tipo !== "personaje") {
                navigate(`/mapaMundo/${loc.id}`);
              }
            }}
          >
            <img
              src={loc.imagenMapaMundi || imagenBase}
              alt={loc.nombre}
              className="w-24 h-16 object-cover rounded-lg border border-white/50"
              style={{ border: "1px solid white" }}
            />
            <span className="text-white text-sm block mt-1">{loc.nombre}</span>
          </div>
        ))}
    </div>
  </div>

  {/* 🔹 Descripción debajo de todo */}
  <div className="w-8/9 mt-2 p-4">
    <p className="text-gray-100 text-sm leading-snug">{mundo.descripcion}</p>
  </div>
   






      
{/* Contenedor para centrar */}

{usuario==="narrador" ?(
  <div className="flex justify-end mb-4 mt-6">
  {/* Botón para abrir modal */}
  <button
    className="px-2 py-1.5 w-28 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:scale-105 transform transition duration-300"
    onClick={() => setMostrarModalMundo(true)}
  >
    Editar Mapa
  </button>
</div>

):(<></>)}


{/* Modal */}
{mostrarModalMundo && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center  bg-opacity-50 backdrop-blur-sm"
    onClick={() => setMostrarModalMundo(false)}
  >
    <div
      ref={referenciaModalMundo}
      className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-lg w-full relative animate-fadeIn"
      onClick={(e) => e.stopPropagation()} // Evita cerrar al hacer click dentro
    >
      {/* Botón de cierre */}
      <button
        className="absolute top-3 right-3 text-2xl font-bold text-white hover:text-red-500"
        onClick={() => setMostrarModalMundo(false)}
      >
        &times;
      </button>

      {/* Formulario */}
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-white mb-3">Editar Mapa</h2>

        <input
          type="text"
          placeholder="Nombre del mundo"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.nombre ?? mundo.nombre}
          onChange={(e) => setCamposMundo({ ...camposMundo, nombre: e.target.value })}
        />

        <textarea
          placeholder="Descripción"
          className="textarea textarea-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.descripcion ?? mundo.descripcion}
          onChange={(e) => setCamposMundo({ ...camposMundo, descripcion: e.target.value })}
        />

         <input
          type="text"
          placeholder="URL de imagen de presentacion"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.imagenPre ?? mundo.imagenPre}
          onChange={(e) => setCamposMundo({ ...camposMundo, imagenPre: e.target.value })}
        />

        <input
          type="text"
          placeholder="URL de imagen del mapa"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.imagenMapa ?? mundo.imagenMapaMundi}
          onChange={(e) => setCamposMundo({ ...camposMundo, imagenMapa: e.target.value })}
        />

        <input
          type="text"
          placeholder="Tipo de mundo"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.tipo ?? mundo.tipo}
          onChange={(e) => setCamposMundo({ ...camposMundo, tipo: e.target.value })}
        />

        <input
          type="text"
          placeholder="URL del icono"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.icono ?? mundo.iconoUrl}
          onChange={(e) => setCamposMundo({ ...camposMundo, icono: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Tamaño"
            className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
            value={camposMundo.tamano ?? mundo.tamano}
            onChange={(e) => setCamposMundo({ ...camposMundo, tamano: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Capa"
            className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
            value={camposMundo.capa ?? mundo.capa}
            onChange={(e) => setCamposMundo({ ...camposMundo, capa: Number(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Coordenada X"
            className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
            value={camposMundo.x ?? mundo.coords_x}
            onChange={(e) => setCamposMundo({ ...camposMundo, x: Number(e.target.value) })}
          />

          <input
            type="number"
            placeholder="Coordenada Y"
            className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
            value={camposMundo.y ?? mundo.coords_y}
            onChange={(e) => setCamposMundo({ ...camposMundo, y: Number(e.target.value) })}
          />
        </div>

        <button
  className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
  onClick={async () => {
    try {
      const response = await axios.put(
        `${API_URL}/actualizarMundo/${mundo.id}`,
        {
          nombre: camposMundo.nombre || mundo.nombre,
          descripcion: camposMundo.descripcion || mundo.descripcion,
          imagenMapaMundi: camposMundo.imagenMapa || mundo.imagenMapaMundi,
          tipo: camposMundo.tipo || mundo.tipo,
          iconoUrl: camposMundo.icono || mundo.iconoUrl,
          tamano: camposMundo.tamano || mundo.tamano,
          coords_x: camposMundo.x || mundo.coords_x,
          coords_y: camposMundo.y || mundo.coords_y,
          capa: camposMundo.capa || mundo.capa,
          imagenPre: camposMundo.imagenPre || imagenBase,
        }
      );

      if (response.data.ok) {
        setLocaciones((prev) =>
          prev.map((m) =>
            m.id === mundo.id ? { ...m, ...response.data.mundo } : m
          )
        );
        setMostrarModalMundo(false); // 🔹 Cierra modal al guardar
      } else {
        console.log("Error al actualizar mundo:", response.data.error);
      }
    } catch (error) {
      console.log("❌ Error en la actualización de mundo:", error.message);
    }
  }}
>
  Guardar cambios
</button>
      </div>

    </div>
  </div>
)}

    

{/* Modal creación locación */}
{modalVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-[9999]">
    <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-96 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Nueva Locación</h2>

      <input
        type="text"
        placeholder="URL de la imagen del mapa"
        className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.imagenMapaMundi}
        onChange={(e) => setFormData({ ...formData, imagenMapaMundi: e.target.value })}
      />

       <input
        type="text"
        placeholder="URL de presentacion"
        className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.imagenPre}
        onChange={(e) => setFormData({ ...formData, imagenPre: e.target.value })}
      />

      <input
        type="text"
        placeholder="Nombre"
        className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.nombre}
        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
      />

      <select
        className="select select-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.tipo}
        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
      >
        {Object.keys(iconosBase).map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="URL del icono (opcional)"
        className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.iconoUrl}
        onChange={(e) => setFormData({ ...formData, iconoUrl: e.target.value })}
      />

      <select
        className="select select-bordered w-full bg-gray-700 text-white border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
        value={formData.tamano || ""}
        onChange={(e) => setFormData({ ...formData, tamano: Number(e.target.value) })}
      >
        <option value="" disabled>Selecciona tamaño...</option>
        <option value="5">Diminuto</option>
        <option value="15">Pequeño</option>
        <option value="25">Mediano</option>
        <option value="50">Grande</option>
        <option value="75">Enorme</option>
        <option value="100">Descomunal</option>
      </select>

      <textarea
        placeholder="Descripción"
        className="textarea textarea-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-4"
        value={formData.descripcion}
        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
      />

      <div className="flex justify-end gap-2">
        <button
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={guardarLocacionMundo}
        >
          Guardar
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => setModalVisible(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

{/* Modal eliminar locación */}
{modalEliminarVisible && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-[1002]">
    <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-80 overflow-auto">
      <h2 className="text-xl font-bold mb-4 text-red-600">Eliminar Locación</h2>
      <p className="text-white">
        ¿Seguro que quieres eliminar <strong>{locacionSeleccionada?.nombre}</strong>?
      </p>
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={eliminarLocacion}
        >
          Eliminar
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => setModalEliminarVisible(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}



<Info 
locacionId={mundo.id}
usuario={usuario}
/>
   


    </div>
  );
};

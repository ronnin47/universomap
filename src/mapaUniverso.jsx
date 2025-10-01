import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent, Pane  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "./config";


///const imagenMapa ="https://img.freepik.com/foto-gratis/nubes-al-estilo-anime_23-2151071684.jpg?semt=ais_incoming&w=740&q=80"
const imagenMapa ="https://i.pinimg.com/originals/ef/90/15/ef90155f5e5af847b7eea15e496958bd.gif"

const bounds = [
  [0, 0],
  [1000, 1200],
];



const iconosBase = {
   puntero:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRDGcwDvbcWZRhzdtg8mpIpckeykcpj84n9w&s",
  mundo: "https://res.cloudinary.com/dzul1hatw/image/upload/v1758479696/mundoA_mawo4o.svg",
  personaje: "🧑",
  mitama:"/mitamaDorada.svg",
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
  barco:"🛳️",
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
  weight: 1,               // borde más grueso
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




// 🔹 Función para crear icono desde URL o emoji
const crearIcono = (loc,iconoUrl, tipo, tamano = 32) => {
  const icono = iconoUrl || iconosBase[tipo] || "❓";
        //console.log("",loc.nombre)



        if (
    (typeof icono === "string" &&
    (icono.startsWith("http") || icono.endsWith(".svg") || icono.endsWith(".png") || icono.endsWith(".jpg"))) && (loc.nombre==="Estrella Amateratsu")
  ) {


    //console.log("ES ESTRELLA AMATERATSU")
  
    return new L.DivIcon({
      html: `
        <div class="token-redondo estrellaBrillante" style="width:${tamano}px; height:${tamano}px;">
          <img src="${icono}" />
        </div>
      `,
      className: "", // muy importante: para no heredar estilos de leaflet
      iconSize: [tamano, tamano],
      iconAnchor: [tamano / 2, tamano / 2],
      popupAnchor: [0, -tamano / 2],
    });
    
  }

  // Si es URL de imagen
  if (
    typeof icono === "string" &&
    (icono.startsWith("http") || icono.endsWith(".svg") || icono.endsWith(".png") || icono.endsWith(".jpg"))
  ) {
    return new L.DivIcon({
      html: `
        <div class="token-redondo" style="width:${tamano}px; height:${tamano}px;">
          <img src="${icono}" />
        </div>
      `,
      className: "", // muy importante: para no heredar estilos de leaflet
      iconSize: [tamano, tamano],
      iconAnchor: [tamano / 2, tamano / 2],
      popupAnchor: [0, -tamano / 2],
    });
  }


 /*
//veremos en el futuro
// Si es la Estrella Amateratsu → icono brillante
  if (loc.nombre =="Estrella Amateratsu") {

    return new L.DivIcon({
      className: "icono-amateratsu",
      html: `<span class="token-emoji estrella-brillante" style="font-size:${tamano}px">${icono}</span>`,
      iconSize: [tamano, tamano],
      iconAnchor: [tamano / 2, tamano / 2],
      popupAnchor: [0, -tamano / 2],
    });
  }
*/
  // Si es emoji
  return new L.DivIcon({
    html: `<span class="token-emoji" style="font-size:${tamano}px">${icono}</span>`,
    className: "", 
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
    popupAnchor: [0, -tamano / 2],
  });
};

function EscalarIconos({
  usuario,
  locaciones,
  posiciones,
  setPosiciones,
  esNarrador,
  setLocaciones,
  abrirModal,
}) {
  const map = useMapEvent("zoom", () => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options._locacion) {
        const loc = layer.options._locacion;
        // Usamos loc.tamanoBase para mantener el tamaño original
        const zoomFactor = map.getZoom();
        const nuevoTamano = (loc.tamanoBase || loc.tamano) * zoomFactor;
        layer.setIcon(crearIcono(loc, loc.iconoUrl, loc.tipo, nuevoTamano));
      }
    });
  });

  const navigate = useNavigate();

  return locaciones
    .filter((loc) => loc.capa === 0)
    .map((loc) => {
      const pos = posiciones[loc.id];
      if (!pos) return null;

      // Aseguramos que cada loc tenga su tamanoBase
      if (!loc.tamanoBase) loc.tamanoBase = loc.tamano;

      return (
        <Marker
          key={`marker-${loc.id}`}
          position={pos}
          icon={crearIcono(loc, loc.iconoUrl, loc.tipo, loc.tamanoBase * map.getZoom())}
          draggable={esNarrador}
          _locacion={loc}
          eventHandlers={{
            dragend: async (e) => {
              if (usuario === "narrador") {
                const { lat, lng } = e.target.getLatLng();
                setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
                setLocaciones((prev) =>
                  prev.map((m) =>
                    m.id === loc.id ? { ...m, coords_x: lng, coords_y: lat } : m
                  )
                );

                try {
                  await axios.post(`${API_URL}/actualizarCoordenadas`, {
                    id: loc.id,
                    coords_x: lng,
                    coords_y: lat,
                  });
                } catch (error) {
                  console.log("❌ Error en la actualización de coordenadas:", error.message);
                }
              }
            },
            dblclick: () => {
              if (loc.tipo !== "personaje") navigate(`/mapaMundo/${loc.id}`);
            },
            contextmenu: () => {if (usuario === "narrador") abrirModal({ tipo: "eliminar", locacion: loc })},
          }}
        >
          <Popup closeOnClick className="!p-0">
            <div className="space-y-3 w-48">
              <h2 className="text-xl font-bold text-blue-400 text-center drop-shadow-md">
                {loc.nombre}
              </h2>
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

// 🔹 Captura clic derecho en el mapa vacío
function RightClickMenu({ abrirModal }) {
  useMapEvent("contextmenu", (e) => {
    abrirModal({ tipo: "crear", latlng: e.latlng });
  });
  return null;
}

// 🔹 Mapa Universo
export const MapaUniverso = ({ usuario, locaciones, setLocaciones }) => {
  const [mostrarCuadricula, setMostrarCuadricula] = useState(false);
  const esNarrador = usuario === "narrador";
  const [posiciones, setPosiciones] = useState({});
  const [modalData, setModalData] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "mundoA",
    descripcion: "",
    imagenMapaMundi: "",
    iconoUrl: "",
    tamano: 15,
    imagenPre: "",
  });

  const navigate = useNavigate();


  const imagenBase="https://res.cloudinary.com/dzul1hatw/image/upload/v1755123685/imagenBase_wcjism.jpg";



  useEffect(() => {
    const nuevasPosiciones = locaciones.reduce((acc, loc) => {
      if (loc.coords_x !== undefined && loc.coords_y !== undefined) {
        acc[loc.id] = [loc.coords_y, loc.coords_x];
      }
      return acc;
    }, {});
    setPosiciones(nuevasPosiciones);
  }, [locaciones]);

  const abrirModal = (data) => {
    setModalData(data);
    if (data.tipo === "crear") {
      setFormData({
        nombre: "",
        tipo: "puntero",
        descripcion: "",
        imagenMapaMundi: "",
        iconoUrl: "",
        tamano: 15,
        imagenPre:"",
      });
    }
  };

  const guardarLocacion = async () => {
    if (!modalData?.latlng) return;
    const nuevaLocacion = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi || imagenBase,
      iconoUrl: formData.iconoUrl || null,
      coords_x: modalData.latlng.lng,
      coords_y: modalData.latlng.lat,
      tamano: formData.tamano,
      capa: 0,
      imagenPre: formData.imagenPre || imagenBase,
    };
    try {
      const response = await axios.post(`${API_URL}/guardarLocacion`, nuevaLocacion);
      if (response.data.ok) {
        const locGuardada = response.data.locacion;
        setLocaciones([...locaciones, locGuardada]);
        setPosiciones({
          ...posiciones,
          [locGuardada.id]: [locGuardada.coords_y, locGuardada.coords_x],
        });
        setModalData(null);
      } else {
        console.log("Error al guardar locación:", response.data.error);
      }
    } catch (error) {
      console.log("❌ Error en el POST:", error.message);
    }
  };

  const eliminarLocacion = async (locacion) => {
    try {
      await axios.delete(`${API_URL}/eliminarLocacion/${locacion.id}`);
      setLocaciones((prev) => prev.filter((l) => l.id !== locacion.id));
      setModalData(null);
    } catch (error) {
      console.log("❌ Error eliminando locación:", error.message);
    }
  };

  const locacionesCapa0 = locaciones.filter((loc) => loc.capa === 0);

  return (
    <div className="w-full h-[50vh] p-1">


   <button
  className="relative inline-flex items-center justify-center px-3 py-1.5 mb-2 text-sm font-medium text-white rounded-md group bg-transparent border border-white/50 transition-all duration-300 hover:bg-white/10 hover:shadow-[0_0_10px_#00f8ff]"
  onClick={() => setMostrarCuadricula((prev) => !prev)}
>
  <span className="absolute inset-0 w-full h-full rounded-md bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-20"></span>
  <span className="relative">
    {mostrarCuadricula ? "Ocultar cuadrícula" : "Mostrar cuadrícula"}
  </span>
</button>


      <div className="w-full h-[60vh] p-1 flex gap-5">
        {/* 🔹 Mapa principal */}
        <div className="flex-1 card bg-base-200 shadow-xl rounded-2xl overflow-hidden">
          <MapContainer
            center={[bounds[1][0] / 2, bounds[1][1] / 2]}
            zoom={1}
            minZoom={1}
            maxZoom={5}
            scrollWheelZoom
            crs={L.CRS.Simple}
            className="w-full h-full"
            maxBounds={bounds}
            maxBoundsViscosity={1}
          >
            <ImageOverlay 
            url={imagenMapa} 
            bounds={bounds}
            />


           

             {/* 🔹 Aquí va la cuadrícula */}
  {mostrarCuadricula && <CuadriculaMapa bounds={bounds} paso={10} visible={mostrarCuadricula} />}

            <EscalarIconos
              locaciones={locaciones}
              posiciones={posiciones}
              setPosiciones={setPosiciones}
              esNarrador={esNarrador}
              setLocaciones={setLocaciones}
              abrirModal={abrirModal}
              usuario={usuario}
            />
            {esNarrador && <RightClickMenu abrirModal={abrirModal} />}
          </MapContainer>
        </div>

                {/* 🔹 Panel lateral con mini mapas */}
        <div className="flex flex-col gap-3 w-32 overflow-y-auto  p-3">
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
                  style={{border:"0.5px solid gray"}}
                />
                <span className="text-white text-sm block mt-1">{loc.nombre}</span>
              </div>
            ))}
        </div>
      </div>

     {/* 🔹 Modal Crear */}
{modalData?.tipo === "crear" && (
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
          onClick={guardarLocacion}
        >
          Guardar
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => setModalData(null)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

{/* 🔹 Modal Eliminar */}
{modalData?.tipo === "eliminar" && (
  <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-[9999]">
    <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-96 overflow-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Eliminar Locación</h2>
      <p className="text-white">¿Seguro que quieres eliminar <b>{modalData.locacion.nombre}</b>?</p>
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => eliminarLocacion(modalData.locacion)}
        >
          Eliminar
        </button>
        <button
          className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
          onClick={() => setModalData(null)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

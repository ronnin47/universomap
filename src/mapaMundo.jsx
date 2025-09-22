import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// 🔹 Límites del mapa
const bounds = [
  [0, 0],
  [800, 1000],
];

const iconosBase = {
  // 🌍 Mundo / Lugares / Mapas
  mundo: "🌍",
  personaje: "🧑",
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
  posada: "🛏️",
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

// 🔹 Escala los íconos según zoom y agrega clic derecho para eliminar
function EscalarIconos({ locaciones, posiciones, setPosiciones, usuario, setLocacionesGlobal, abrirModalEliminar }) {
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
        draggable={usuario === "narrador"}
        icon={crearIcono(loc.iconoUrl, loc.tipo, loc.tamano)}
        eventHandlers={{
          dragend: async (e) => {
            if (usuario === "narrador") {
              const { lat, lng } = e.target.getLatLng();
              setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
              setLocacionesGlobal(prev =>
                prev.map(m => m.id === loc.id ? { ...m, coords_x: lng, coords_y: lat } : m)
              );
              try {
                const response = await axios.post(
                  "http://localhost:10000/actualizarCoordenadas",
                  { id: loc.id, coords_x: lng, coords_y: lat }
                );
                if (!response.data.ok) console.log("Error al actualizar coordenadas:", response.data.error);
              } catch (error) {
                console.log("❌ Error en la actualización de coordenadas:", error.message);
              }
            }
          },
         
            dblclick: () => {
              if (loc.tipo !== "personaje") {
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
        <Popup className="bg-base-100 text-base-content p-4 rounded-2xl shadow-xl border border-base-300 max-w-xs">
          <div className="space-y-2">
            <h2 className="font-bold text-xl text-primary border-b border-base-300 pb-1 break-words">{loc.nombre}</h2>
            {loc.imagenMapaMundi && (
              <div className="w-40 h-24 overflow-hidden rounded-md border shadow-sm">
                <img src={loc.imagenMapaMundi} alt="Mapa miniatura" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-sm leading-relaxed text-base-content/80 break-words max-w-full">{loc.descripcion}</p>
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
export const MapaMundo = ({ usuario, locaciones, setLocaciones }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mundo = locaciones.find((l) => l.id === parseInt(id)) || {};

  const locacionesDelMundo = useMemo(() => 
    locaciones.filter(l => l.capa === 1 && l.mundo === mundo.id),
    [locaciones, mundo.id]
  );

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

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
    tamano: "",
    iconoUrl: "",
  });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "ciudad", descripcion: "", imagenMapaMundi: "", tamano: "", iconoUrl: "" });
    setPosicionClick([latlng.lat, latlng.lng]);
    setModalVisible(true);
  };

  const guardarLocacionMundo = async () => {
    if (!posicionClick) return;
    const nuevaLocacion = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi,
      iconoUrl: formData.iconoUrl || null,
      coords_x: posicionClick[1],
      coords_y: posicionClick[0],
      tamano: formData.tamano,
      icono: iconosBase[formData.tipo] || "❓",
      capa: 1,
      mundo: mundo.id,
    };
    try {
      const response = await axios.post("http://localhost:10000/guardarLocacionMundo", nuevaLocacion);
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
      await axios.delete(`http://localhost:10000/eliminarLocacion/${locacionSeleccionada.id}`);
      setLocaciones(prev => prev.filter(l => l.id !== locacionSeleccionada.id));
      setModalEliminarVisible(false);
    } catch (error) {
      console.log("❌ Error eliminando locación:", error.message);
    }
  };

  if (!mundo.id) return <div>Mundo no encontrado</div>;

  return (
    <div className="p-4 bg-gradient-to-b from-gray-200 to-black-500 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">{mundo.nombre}</h1>
        <p className="mt-2 text-white">{mundo.descripcion}</p>
      </div>

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
            className="w-full h-[60vh] rounded-2xl"
            maxBounds={bounds}   
            maxBoundsViscosity={1} 
          >
            <ImageOverlay url={mundo.imagenMapaMundi || ""} bounds={bounds} />
            <EscalarIconos
              locaciones={locacionesDelMundo}
              posiciones={posiciones}
              setPosiciones={setPosiciones}
              usuario={usuario}
              setLocacionesGlobal={setLocaciones}
              abrirModalEliminar={abrirModalEliminar}
            />
            {usuario === "narrador" && <RightClickMenu abrirModal={abrirModal} />}
          </MapContainer>
        </div>

        {/* 🔹 Panel lateral con mini mapas */}
         <div className="flex flex-col gap-3 w-32 overflow-y-auto  p-3">
          {locacionesCapa0.filter((loc) => loc.tipo !== "personaje").map((loc) => (
            <div
              key={loc.id}
            className="flex-shrink-0 cursor-pointer text-center borderHover"
              
                onClick={() => {
                if (loc.tipo !== "personaje") {
                  navigate(`/mapaZona/${loc.id}`);
                }
              }}
            >
              <img
                src={loc.imagenMapaMundi || "/placeholder-map.png"}
                alt={loc.nombre}
                className="w-24 h-16 object-cover rounded-lg border border-white/50"
              />
              <span className="text-white text-sm block mt-1">{loc.nombre}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="URL de imagen del mapa principal"
          className="input input-bordered flex-1"
          value={formData.imagenMapaMundi}
          onChange={(e) =>
            setFormData({ ...formData, imagenMapaMundi: e.target.value })
          }
        />
        <button className="btn btn-primary" onClick={cargarMapa}>
          Cargar mapa
        </button>
      </div>

      {/* Modal creación locación */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Locación</h2>
            <input
              type="text"
              placeholder="URL de la imagen del mapa"
              className="input input-bordered w-full mb-3"
              value={formData.imagenMapaMundi}
              onChange={(e) =>
                setFormData({ ...formData, imagenMapaMundi: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Nombre"
              className="input input-bordered w-full mb-3"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
            <select
              className="select select-bordered w-full mb-3"
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
              className="input input-bordered w-full mb-3"
              value={formData.iconoUrl}
              onChange={(e) => setFormData({ ...formData, iconoUrl: e.target.value })}
            />
            <select
              className="select select-bordered w-full mb-3"
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
              className="textarea textarea-bordered w-full mb-4"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" onClick={guardarLocacionMundo}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => setModalVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar locación */}
      {modalEliminarVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h2 className="text-xl font-bold mb-4">Eliminar Locación</h2>
            <p>¿Seguro que quieres eliminar <strong>{locacionSeleccionada?.nombre}</strong>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-error" onClick={eliminarLocacion}>Eliminar</button>
              <button className="btn btn-ghost" onClick={() => setModalEliminarVisible(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // 🏰 Construcciones / Ciudades / Lugares
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



  
  // 🐉 Criaturas / Animales / Personajes
  dragón: "🐉",
  serpiente: "🐍",
  persona: "🧑",
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


  
  // 🟢 Colores / Formas / Señales
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
  
  // 💎 Objetos / Recursos / Inventario

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

  
  // 🏁 Señales / Advertencias / Tráfico
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
// 🔹 Escala los íconos según zoom y permite eliminar
function EscalarIconos({ locaciones, posiciones, setPosiciones, usuario, setLocacionesGlobal, abrirModalEliminar }) {
  const map = useMapEvent("zoom", () => {
    const zoom = map.getZoom();
    const factor = Math.max(1, 1 + (zoom - 1) * 0.85);

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options._locacion) {
        const loc = layer.options._locacion;
        const nuevoTamano = loc.tamano * factor;

        const icono = new L.DivIcon({
          html: `<span style="font-size:${nuevoTamano}px">${iconosBase[loc.tipo] || "❓"}</span>`,
          iconSize: [nuevoTamano, nuevoTamano],
          iconAnchor: [nuevoTamano / 2, nuevoTamano / 2],
        });

        layer.setIcon(icono);
      }
    });
  });

  const navigate = useNavigate();

  return locaciones.map((loc) => {
    const iconoInicial = new L.DivIcon({
      html: `<span style="font-size:${loc.tamano}px">${iconosBase[loc.tipo] || "❓"}</span>`,
      iconSize: [loc.tamano, loc.tamano],
      iconAnchor: [loc.tamano / 2, loc.tamano / 2],
    });

    const posicion = posiciones[loc.id] || [bounds[1][0] / 2, bounds[1][1] / 2];

    return (
      <Marker
        key={loc.id}
        position={posicion}
        draggable={usuario === "narrador"}
        eventHandlers={{
          dragend: async (e) => {
            if (usuario === "narrador") {
              const { lat, lng } = e.target.getLatLng();
              setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
              setLocacionesGlobal((prev) =>
                prev.map((m) => (m.id === loc.id ? { ...m, coords_x: lng, coords_y: lat } : m))
              );
              try {
                const response = await axios.post("http://localhost:10000/actualizarCoordenadas", {
                  id: loc.id,
                  coords_x: lng,
                  coords_y: lat,
                });
                if (!response.data.ok) {
                  console.log("Error al actualizar coordenadas:", response.data.error);
                }
              } catch (error) {
                console.log("❌ Error en la actualización de coordenadas:", error.message);
              }
            }
          },
          //dblclick: () => navigate(`/mapaLocal/${loc.id}`),
          contextmenu: () => {
            if (usuario === "narrador") abrirModalEliminar(loc);
          },
        }}
        icon={iconoInicial}
        _locacion={loc}
      >
        <Popup className="bg-base-100 text-base-content p-4 rounded-2xl shadow-xl border border-base-300 max-w-xs">
          <div className="space-y-2">
            <h2 className="font-bold text-xl text-primary border-b border-base-300 pb-1 break-words">
              {loc.nombre}
            </h2>
            <p className="text-sm leading-relaxed text-base-content/80 break-words max-w-full">
              {loc.descripcion}
            </p>
          </div>
        </Popup>
      </Marker>
    );
  });
}

// 🔹 Detecta clic derecho para abrir modal de creación
function RightClickMenu({ abrirModal }) {
  useMapEvent("contextmenu", (e) => {
    abrirModal(e.latlng);
  });
  return null;
}

// 🔹 Componente principal
export const MapaLocal = ({ usuario, locaciones, setLocaciones }) => {
  const { id } = useParams(); // id de la ciudad (capa 3)
  const ciudad = locaciones.find((l) => l.id === parseInt(id)) || {};

  // 🔹 Memoizamos locaciones de zona
  const locacionesDeZona = useMemo(
    () => locaciones.filter((l) => l.capa === 3 && l.mundo === ciudad.id),
    [locaciones, ciudad.id]
  );

  // 🔹 Estado de posiciones
  const [posiciones, setPosiciones] = useState({});

  useEffect(() => {
    const nuevasPosiciones = locacionesDeZona.reduce((acc, loc) => {
      if (loc.coords_x != null && loc.coords_y != null) {
        acc[loc.id] = [parseFloat(loc.coords_y), parseFloat(loc.coords_x)];
      }
      return acc;
    }, {});
    setPosiciones(nuevasPosiciones);
  }, [locacionesDeZona]);

  // 🔹 Modal creación locación
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
    tamano: 25,
  });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "ciudad", descripcion: "", imagenMapaMundi: "", tamano: 25 });
    setPosicionClick([latlng.lat, latlng.lng]);
    setModalVisible(true);
  };

  const guardarLocacionZona = async () => {
    if (!posicionClick) return;

    const nuevaLocacion = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi,
      coords_x: posicionClick[1],
      coords_y: posicionClick[0],
      tamano: formData.tamano,
      icono: iconosBase[formData.tipo] || "❓",
      capa: 3,
      mundo: ciudad.id,
    };

    try {
      const response = await axios.post("http://localhost:10000/guardarLocacionMundo", nuevaLocacion);
      if (response.data.ok) {
        const locGuardada = response.data.locacion;
        setLocaciones((prev) => [...prev, locGuardada]);
        setPosiciones((prev) => ({ ...prev, [locGuardada.id]: [locGuardada.coords_y, locGuardada.coords_x] }));
        setModalVisible(false);
      } else {
        console.log("Error al guardar locación:", response.data.error);
      }
    } catch (error) {
      console.log("❌ Error en el POST:", error.message);
    }
  };

  const cargarMapa = () => {
    if (formData.imagenMapaMundi.trim()) {
      setLocaciones((prev) =>
        prev.map((m) => (m.id === ciudad.id ? { ...m, imagenMapaMundi: formData.imagenMapaMundi } : m))
      );
    }
  };

  // 🔹 Modal eliminación
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
      setLocaciones((prev) => prev.filter((l) => l.id !== locacionSeleccionada.id));
      setModalEliminarVisible(false);
    } catch (error) {
      console.log("❌ Error eliminando locación:", error.message);
    }
  };

  if (!ciudad.id) return <div>Ciudad no encontrada</div>;

  return (
       <div className="p-4 bg-gradient-to-b from-violet-200 to-black-500 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">{ciudad.nombre}</h1>
        <p className="mt-2 text-white">{ciudad.descripcion}</p>
      </div>

      <div className="flex-1 relative">
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
          <ImageOverlay url={ciudad.imagenMapaMundi || ""} bounds={bounds} />
          <EscalarIconos
            locaciones={locacionesDeZona}
            posiciones={posiciones}
            setPosiciones={setPosiciones}
            usuario={usuario}
            setLocacionesGlobal={setLocaciones}
            abrirModalEliminar={abrirModalEliminar}
          />
          {usuario === "narrador" && <RightClickMenu abrirModal={abrirModal} />}
        </MapContainer>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="URL de imagen del mapa principal"
          className="input input-bordered flex-1"
          value={formData.imagenMapaMundi}
          onChange={(e) => setFormData({ ...formData, imagenMapaMundi: e.target.value })}
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
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            <select
              className="select select-bordered w-full mb-3"
              value={formData.tamano || 25}
              onChange={(e) => setFormData({ ...formData, tamano: Number(e.target.value) })}
            >
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
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" onClick={guardarLocacionZona}>
                Guardar
              </button>
              <button className="btn btn-ghost" onClick={() => setModalVisible(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar locación */}
      {modalEliminarVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h2 className="text-xl font-bold mb-4">Eliminar Locación</h2>
            <p>
              ¿Seguro que quieres eliminar <strong>{locacionSeleccionada?.nombre}</strong>?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-error" onClick={eliminarLocacion}>
                Eliminar
              </button>
              <button className="btn btn-ghost" onClick={() => setModalEliminarVisible(false)}>
                Cancelar
              </button>
             
            </div>
          </div>
        </div>


       
      )}
     
    </div>
  );
};

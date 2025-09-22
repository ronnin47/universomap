import { useState, useEffect } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const imagenMapa =
  "https://e0.pxfuel.com/wallpapers/879/583/desktop-wallpaper-pastel-plain-light-blue-background-light-blue-pastel.jpg";

const bounds = [
  [0, 0],
  [1000, 1200],
];

const iconosBase = {
    mundo: "🌍",
  mundoA: "https://res.cloudinary.com/dzul1hatw/image/upload/v1758479696/mundoA_mawo4o.svg",
  pj:"https://res.cloudinary.com/dzul1hatw/image/upload/v1758155598/personajes/personaje_1175.jpg",
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

  // Si es emoji
  return new L.DivIcon({
    html: `<span class="token-emoji" style="font-size:${tamano}px">${icono}</span>`,
    className: "", 
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
    popupAnchor: [0, -tamano / 2],
  });
};

// 🔹 Escalar iconos y permitir moverlos
function EscalarIconos({ locaciones, posiciones, setPosiciones, esNarrador, setLocaciones, abrirModal }) {
  const map = useMapEvent("zoom", () => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options._locacion) {
        const loc = layer.options._locacion;
        const nuevoTamano = loc.tamano * map.getZoom();
        layer.setIcon(crearIcono(loc.iconoUrl, loc.tipo, nuevoTamano));
      }
    });
  });

  const navigate = useNavigate();

  return locaciones
    .filter((loc) => loc.capa === 0)
    .map((loc) => {
      const pos = posiciones[loc.id];
      if (!pos) return null;

      return (
        <Marker
          key={`marker-${loc.id}`}
          position={pos}
          icon={crearIcono(loc.iconoUrl, loc.tipo, loc.tamano)}
          draggable={esNarrador}
          eventHandlers={{
            dragend: async (e) => {
              const { lat, lng } = e.target.getLatLng();
              setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
              if (esNarrador && setLocaciones) {
                setLocaciones((prev) =>
                  prev.map((l) =>
                    l.id === loc.id ? { ...l, coords_x: lng, coords_y: lat } : l
                  )
                );
              }
              try {
                await axios.post("http://localhost:10000/actualizarCoordenadas", {
                  id: loc.id,
                  coords_x: lng,
                  coords_y: lat,
                });
                console.log(`Locación ${loc.id} actualizada en DB`);
              } catch (error) {
                console.error("❌ Error al actualizar coordenadas:", error.message);
              }
            },

             dblclick: () => {
              if (loc.tipo !== "personaje") {
                navigate(`/mapaMundo/${loc.id}`);
              }
            },
       
            contextmenu: () => abrirModal({ tipo: "eliminar", locacion: loc }),
          }}
          _locacion={loc}
        >
          <Popup className="bg-base-100 text-base-content p-4 rounded-2xl shadow-xl border border-base-300 max-w-xs">
            <div className="space-y-2">
              <h2 className="font-bold text-xl text-primary border-b border-base-300 pb-1 break-words">
                {loc.nombre}
              </h2>
              {loc.imagenMapaMundi && (
                <div className="w-40 h-24 overflow-hidden rounded-md border shadow-sm">
                  <img
                    src={loc.imagenMapaMundi}
                    alt="Mapa miniatura"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm leading-relaxed text-base-content/80 break-words max-w-full">
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
  });

  const navigate = useNavigate();

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
        tipo: "mundoA",
        descripcion: "",
        imagenMapaMundi: "",
        iconoUrl: "",
        tamano: 15,
      });
    }
  };

  const guardarLocacion = async () => {
    if (!modalData?.latlng) return;
    const nuevaLocacion = {
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi,
      iconoUrl: formData.iconoUrl || null,
      coords_x: modalData.latlng.lng,
      coords_y: modalData.latlng.lat,
      tamano: formData.tamano,
      capa: 0,
    };
    try {
      const response = await axios.post("http://localhost:10000/guardarLocacion", nuevaLocacion);
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
      await axios.delete(`http://localhost:10000/eliminarLocacion/${locacion.id}`);
      setLocaciones((prev) => prev.filter((l) => l.id !== locacion.id));
      setModalData(null);
    } catch (error) {
      console.log("❌ Error eliminando locación:", error.message);
    }
  };

  const locacionesCapa0 = locaciones.filter((loc) => loc.capa === 0);

  return (
    <div className="w-full h-[50vh] p-1">
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
            <ImageOverlay url={imagenMapa} bounds={bounds} />
            <EscalarIconos
              locaciones={locaciones}
              posiciones={posiciones}
              setPosiciones={setPosiciones}
              esNarrador={esNarrador}
              setLocaciones={setLocaciones}
              abrirModal={abrirModal}
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
                  src={loc.imagenMapaMundi || "/placeholder-map.png"}
                  alt={loc.nombre}
                  className="w-24 h-16 object-cover rounded-lg border border-white/50"
                />
                <span className="text-white text-sm block mt-1">{loc.nombre}</span>
              </div>
            ))}
        </div>
      </div>

      {/* 🔹 Modal Crear */}
      {modalData?.tipo === "crear" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Locación</h2>

            <input
              type="text"
              placeholder="URL de la imagen del mapa"
              className="input input-bordered w-full mb-3"
              value={formData.imagenMapaMundi}
              onChange={(e) => setFormData({ ...formData, imagenMapaMundi: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" onClick={guardarLocacion}>Guardar</button>
              <button className="btn btn-ghost" onClick={() => setModalData(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Modal Eliminar */}
      {modalData?.tipo === "eliminar" && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Eliminar Locación</h2>
            <p>¿Seguro que quieres eliminar <b>{modalData.locacion.nombre}</b>?</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-error" onClick={() => eliminarLocacion(modalData.locacion)}>Eliminar</button>
              <button className="btn btn-ghost" onClick={() => setModalData(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

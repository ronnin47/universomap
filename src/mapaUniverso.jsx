import { useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

const imagenMapa =
  "https://e0.pxfuel.com/wallpapers/879/583/desktop-wallpaper-pastel-plain-light-blue-background-light-blue-pastel.jpg";
const bounds = [
  [0, 0],
  [800, 1000],
];

const iconosBase = {
  mundo: "🌍",
  ciudad: "🏛️",
  puerto: "⚓",
  aldea: "🏘️",
  villa: "🏠",
  templo: "⛩️",
  torre: "🗼",
  posada: "🛏️",
  academia: "🎓",
  castillo: "🏰",
  plaza: "🏟️",
  armeria: "⚔️",
  luna: "🌙",
  nidoDragon: "🐉",
  tierraNubando: "☁️",
  hereria: "🔨", // parece que repetiste herreria/hereria
  sol: "☀️",
};

// 🔹 Escalar iconos y permitir moverlos
function EscalarIconos({ locaciones, posiciones, setPosiciones, esNarrador, setLocaciones }) {
  const map = useMapEvent("zoom", () => {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && layer.options._locacion) {
        const loc = layer.options._locacion;
        const nuevoTamano = loc.tamano * map.getZoom();
        const nuevoIcono = new L.DivIcon({
          html: `<span style="font-size:${nuevoTamano}px">${loc.icono || "❓"}</span>`,
          className: "leaflet-div-icon",
          iconSize: [nuevoTamano, nuevoTamano],
          iconAnchor: [nuevoTamano / 2, nuevoTamano / 2],
          popupAnchor: [0, -nuevoTamano / 2],
        });
        layer.setIcon(nuevoIcono);
      }
    });
  });

  const navigate = useNavigate();

  return locaciones.map((loc) => {
    const icono = new L.DivIcon({
      html: `<span style="font-size:${loc.tamano}px">${loc.icono || "❓"}</span>`,
      className: "leaflet-div-icon", // <- evita el fondo blanco
      iconSize: [loc.tamano, loc.tamano],
      iconAnchor: [loc.tamano / 2, loc.tamano / 2],
      popupAnchor: [0, -loc.tamano / 2],
    });

    return (
      <Marker
        key={loc.id}
        position={posiciones[loc.id]}
        icon={icono}
        draggable={esNarrador}
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));
            if (esNarrador && setLocaciones) {
              setLocaciones((prev) =>
                prev.map((l) =>
                  l.id === loc.id ? { ...l, coords: [lng, lat] } : l
                )
              );
            }
          },
          dblclick: () =>
            navigate(`/mapaMundo/${loc.id}`, { state: { locacion: loc } }),
        }}
        _locacion={loc}
      >
        <Popup className="bg-base-100 text-base-content p-4 rounded-xl shadow-lg border border-base-300">
          <h2 className="font-bold text-lg text-primary">{loc.nombre}</h2>
          <p className="text-sm">{loc.descripcion}</p>
        </Popup>
      </Marker>
    );
  });
}

// 🔹 Captura clic derecho para crear locaciones
function RightClickMenu({ abrirModal }) {
  useMapEvent("contextmenu", (e) => abrirModal(e.latlng));
  return null;
}

// 🔹 Mapa Universo
export const MapaUniverso = ({ usuario, locaciones, setLocaciones }) => {
  const esNarrador = usuario === "narrador";

  const [posiciones, setPosiciones] = useState(
    locaciones.reduce((acc, loc) => {
      if (loc?.coords?.length === 2) acc[loc.id] = [loc.coords[1], loc.coords[0]];
      return acc;
    }, {})
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", tipo: "ciudad", descripcion: "" });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "ciudad", descripcion: "" });
    setPosicionClick([latlng.lat, latlng.lng]);
    setModalVisible(true);
  };

  const guardarLocacion = () => {
    const nuevoId = Date.now();
    const nuevaLocacion = {
      id: nuevoId,
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      coords: [posicionClick[1], posicionClick[0]],
      tamano: 25,
      icono: iconosBase[formData.tipo] || "❓",
    };
    setLocaciones([...locaciones, nuevaLocacion]);
    setPosiciones({ ...posiciones, [nuevoId]: posicionClick });
    setModalVisible(false);
  };

  return (
    <div className="w-full h-[70vh] p-1">
      <div className="card bg-base-200 shadow-xl rounded-2xl overflow-hidden h-full">
        <MapContainer
          center={[bounds[1][0] / 2, bounds[1][1] / 2]}
          zoom={1}
          minZoom={1}
          maxZoom={5}
          scrollWheelZoom
          crs={L.CRS.Simple}
          className="w-full h-full rounded-2xl"
        >
          <ImageOverlay url={imagenMapa} bounds={bounds} />
          <EscalarIconos
            locaciones={locaciones}
            posiciones={posiciones}
            setPosiciones={setPosiciones}
            esNarrador={esNarrador}
            setLocaciones={setLocaciones}
          />
          {esNarrador && <RightClickMenu abrirModal={abrirModal} />}
        </MapContainer>
      </div>

      {/* Modal DaisyUI */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
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

            <textarea
              placeholder="Descripción"
              className="textarea textarea-bordered w-full mb-4"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <button className="btn btn-primary" onClick={guardarLocacion}>
                Guardar
              </button>
              <button className="btn btn-ghost" onClick={() => setModalVisible(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

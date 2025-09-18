// MapaMundo.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// 🔹 Límites del mapa
const bounds = [
  [0, 0],
  [800, 1000],
];

// 🔹 Iconos para tipos de locaciones
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
  hereria: "🔨",
  sol: "☀️",
};

// 🔹 Escala los íconos según zoom
function EscalarIconos({ locaciones, posiciones, setPosiciones, usuario, setLocacionesGlobal }) {
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

    return (
      <Marker
        key={loc.id}
        position={posiciones[loc.id]}
        draggable={usuario === "narrador"}
        eventHandlers={{
          dragend: (e) => {
            if (usuario === "narrador") {
              const { lat, lng } = e.target.getLatLng();
              setPosiciones((prev) => ({
                ...prev,
                [loc.id]: [lat, lng],
              }));
              setLocacionesGlobal((prev) =>
                prev.map((mundo) => ({
                  ...mundo,
                  locaciones: (mundo.locaciones || []).map((l) =>
                    l.id === loc.id ? { ...l, coords: [lng, lat] } : l
                  ),
                }))
              );
            }
          },
          dblclick: () => {
            navigate(`/mapaZona/${loc.id}`);
          },
        }}
        icon={iconoInicial}
        _locacion={loc}
      >
        <Popup>
          <h2 className="font-bold">{loc.nombre}</h2>
          <p>{loc.descripcion}</p>
          {loc.imagenMapaMundi && (
            <img
              src={loc.imagenMapaMundi}
              alt="Mapa miniatura"
              className="w-40 h-24 object-cover mt-2 rounded-md border"
            />
          )}
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
  const mundo = locaciones.find((l) => l.id === parseInt(id));
  if (!mundo) return <div>Mundo no encontrado</div>;

  const [locacionesDelMundo, setLocacionesDelMundo] = useState(mundo.locaciones || []);
  const [posiciones, setPosiciones] = useState(
    locacionesDelMundo.reduce((acc, loc) => {
      acc[loc.id] = [loc.coords[1], loc.coords[0]];
      return acc;
    }, {})
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
  });
  const [posicionClick, setPosicionClick] = useState(null);

  // 🔹 Abre modal para nueva locación
  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "ciudad", descripcion: "", imagenMapaMundi: "" });
    setPosicionClick([latlng.lat, latlng.lng]);
    setModalVisible(true);
  };

  // 🔹 Guarda locación en estado local + global
  const guardarLocacion = () => {
    const nuevoId = Date.now();
    const nuevaLocacion = {
      id: nuevoId,
      nombre: formData.nombre,
      tipo: formData.tipo,
      descripcion: formData.descripcion,
      imagenMapaMundi: formData.imagenMapaMundi,
      coords: [posicionClick[1], posicionClick[0]],
      tamano: 25,
    };

    setLocacionesDelMundo([...locacionesDelMundo, nuevaLocacion]);
    setLocaciones((prev) =>
      prev.map((m) =>
        m.id === mundo.id
          ? { ...m, locaciones: [...(m.locaciones || []), nuevaLocacion] }
          : m
      )
    );
    setPosiciones((prev) => ({ ...prev, [nuevoId]: posicionClick }));
    setModalVisible(false);
  };

  // 🔹 Cambia imagen del mapa principal
  const cargarMapa = () => {
    if (formData.imagenMapaMundi.trim()) {
      setLocaciones((prev) =>
        prev.map((m) =>
          m.id === mundo.id ? { ...m, imagenMapaMundi: formData.imagenMapaMundi } : m
        )
      );
    }
  };

  return (
    <div className="p-4 bg-gradient-to-b from-blue-200 to-blue-500 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">{mundo.nombre}</h1>
        <p className="mt-2 text-white">{mundo.descripcion}</p>
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
        >
          <ImageOverlay url={mundo.imagenMapaMundi || ""} bounds={bounds} />

          <EscalarIconos
            locaciones={locacionesDelMundo}
            posiciones={posiciones}
            setPosiciones={setPosiciones}
            usuario={usuario}
            setLocacionesGlobal={setLocaciones}
          />

          {usuario === "narrador" && <RightClickMenu abrirModal={abrirModal} />}
        </MapContainer>
      </div>

      {/* 🔹 Input para cargar mapa principal */}
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

      {/* 🔹 Modal Nueva Locación */}
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
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
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

// MapaZona.jsx
import { useParams } from "react-router-dom";
import { useState } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Definimos los límites del mapa
const bounds = [
  [0, 0],
  [800, 1000],
];

// Iconos según tipo de locación
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
// 🔹 Componente que escala los iconos según el zoom
function EscalarIconos({ locaciones, posiciones, setPosiciones, usuario, setLocacionesGlobal, zonaId }) {
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

              // Actualizamos posiciones locales
              setPosiciones((prev) => ({
                ...prev,
                [loc.id]: [lat, lng],
              }));

              // Actualizamos coordenadas en el estado global
              setLocacionesGlobal((prev) =>
                prev.map((m) => ({
                  ...m,
                  locaciones: m.locaciones.map((l) =>
                    l.id === zonaId
                      ? {
                          ...l,
                          sublocaciones: l.sublocaciones.map((s) =>
                            s.id === loc.id ? { ...s, coords: [lng, lat] } : s
                          ),
                        }
                      : l
                  ),
                }))
              );
            }
          },
        }}
        icon={iconoInicial}
        _locacion={loc}
      >
        <Popup>
          <h2 className="font-bold">{loc.nombre}</h2>
          <p>{loc.descripcion}</p>
        </Popup>
      </Marker>
    );
  });
}

// 🔹 Captura clic derecho
function RightClickMenu({ abrirModal }) {
  useMapEvent("contextmenu", (e) => {
    abrirModal(e.latlng);
  });
  return null;
}

export const MapaZona = ({ usuario, locaciones, setLocaciones }) => {
  const { id } = useParams(); // id de la locación (ej: ciudad)
  let zona = null;

  // Buscamos dentro de todas las locaciones globales
  for (const mundo of locaciones) {
    const encontrada = mundo.locaciones.find((l) => l.id === parseInt(id));
    if (encontrada) {
      zona = encontrada;
      break;
    }
  }

  if (!zona) return <div>Sitio no encontrado</div>;

  const [sublocaciones, setSublocaciones] = useState(zona.sublocaciones || []);
  const [posiciones, setPosiciones] = useState(
    (zona.sublocaciones || []).reduce((acc, loc) => {
      acc[loc.id] = [loc.coords[1], loc.coords[0]];
      return acc;
    }, {})
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", tipo: "barrio", descripcion: "" });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "barrio", descripcion: "" });
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
      tamano: 20,
    };

    // 1️⃣ Local
    setSublocaciones([...sublocaciones, nuevaLocacion]);

    // 2️⃣ Global
    setLocaciones((prev) =>
      prev.map((m) => ({
        ...m,
        locaciones: m.locaciones.map((l) =>
          l.id === zona.id ? { ...l, sublocaciones: [...(l.sublocaciones || []), nuevaLocacion] } : l
        ),
      }))
    );

    // 3️⃣ Posiciones
    setPosiciones((prev) => ({ ...prev, [nuevoId]: posicionClick }));
    setModalVisible(false);
  };
 console.log("",locaciones)
  return (
    <div className="p-4 bg-gradient-to-b from-green-200 to-green-500 h-screen flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-white">{zona.nombre}</h1>
        <p className="mt-2 text-white">{zona.descripcion}</p>
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
          <ImageOverlay url={zona.imagenMapaMundi || ""} bounds={bounds} />

          <EscalarIconos
            locaciones={sublocaciones}
            posiciones={posiciones}
            setPosiciones={setPosiciones}
            usuario={usuario}
            setLocacionesGlobal={setLocaciones}
            zonaId={zona.id}
          />

          {usuario === "narrador" && <RightClickMenu abrirModal={abrirModal} />}
        </MapContainer>
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nuevo escenario</h2>

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

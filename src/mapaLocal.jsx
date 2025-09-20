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
  persona: "🧑",
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

              // 🔹 Actualizamos posiciones locales
              setPosiciones((prev) => ({ ...prev, [loc.id]: [lat, lng] }));

              // 🔹 Actualizamos el estado global
              setLocacionesGlobal((prev) =>
                prev.map((m) => (m.id === loc.id ? { ...m, coords_x: lng, coords_y: lat } : m))
              );

              // 🔹 Guardamos cambios en la base de datos
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
         // dblclick: () => navigate(`/mapaLocal/${loc.id}`),
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

// 🔹 Detecta clic derecho para abrir modal
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

  // 🔹 Inicializamos posiciones cuando cambian las locaciones de zona
  useEffect(() => {
    const nuevasPosiciones = locacionesDeZona.reduce((acc, loc) => {
      if (loc.coords_x != null && loc.coords_y != null) {
        acc[loc.id] = [parseFloat(loc.coords_y), parseFloat(loc.coords_x)];
      }
      return acc;
    }, {});
    setPosiciones(nuevasPosiciones);
  }, [locacionesDeZona]);

  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
  });
  const [posicionClick, setPosicionClick] = useState(null);

  const abrirModal = (latlng) => {
    setFormData({ nombre: "", tipo: "ciudad", descripcion: "", imagenMapaMundi: "" });
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
      tamano: 20, // más pequeño que ciudad
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

  if (!ciudad.id) return <div>Ciudad no encontrada</div>;

  return (
    <div className="p-4 bg-gradient-to-b from-blue-200 to-blue-500 h-screen flex flex-col">
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

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/70 z-[9999]">
          <div className="bg-white rounded-xl shadow-xl p-6 w-96 overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Locación</h2>
{/*  <input
              type="text"
              placeholder="URL de la imagen del mapa"
              className="input input-bordered w-full mb-3"
              value={formData.imagenMapaMundi}
              onChange={(e) => setFormData({ ...formData, imagenMapaMundi: e.target.value })}
            />*/}
           

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
    </div>
  );
};

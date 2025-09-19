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
  hereria: "🔨",
  sol: "☀️",
};

// 🔹 Escalar iconos y permitir moverlos
function EscalarIconos({ locaciones, posiciones, setPosiciones, esNarrador, setLocaciones, abrirModal }) {
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

  return locaciones
    .filter((loc) => loc.capa === 0) // 🔹 Solo capa 0
    .map((loc) => {
      const pos = posiciones[loc.id];
      if (!pos) return null;

      const icono = new L.DivIcon({
        html: `<span style="font-size:${loc.tamano}px">${loc.icono || "❓"}</span>`,
        className: "leaflet-div-icon",
        iconSize: [loc.tamano, loc.tamano],
        iconAnchor: [loc.tamano / 2, loc.tamano / 2],
        popupAnchor: [0, -loc.tamano / 2],
      });

      return (
        <Marker
          key={`marker-${loc.id}`}
          position={pos}
          icon={icono}
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
            dblclick: () => navigate(`/mapaMundo/${loc.id}`, { state: { locacion: loc } }),
            contextmenu: () => abrirModal({ tipo: "eliminar", locacion: loc }),
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
    tipo: "ciudad",
    descripcion: "",
    imagenMapaMundi: "",
    tamano: 15,
  });

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
        tipo: "mundo",
        descripcion: "",
        imagenMapaMundi: "",
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
      coords_x: modalData.latlng.lng,
      coords_y: modalData.latlng.lat,
      tamano: formData.tamano,
      icono: iconosBase[formData.tipo] || "❓",
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
            abrirModal={abrirModal}
          />
          {esNarrador && <RightClickMenu abrirModal={abrirModal} />}
        </MapContainer>
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
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered w-full mb-3"
              value={formData.tamano || ""}
              onChange={(e) => setFormData({ ...formData, tamano: Number(e.target.value) })}
            >
              <option value="" disabled>
                Selecciona tamaño...
              </option>
              <option value="15">Diminuto (15)</option>
              <option value="25">Pequeño (25)</option>
              <option value="50">Mediano (50)</option>
              <option value="75">Grande (75)</option>
              <option value="100">Enorme (100)</option>
              <option value="160">Descomunal (160)</option>
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
              <button className="btn btn-ghost" onClick={() => setModalData(null)}>
                Cancelar
              </button>
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
              <button
                className="btn btn-error"
                onClick={() => eliminarLocacion(modalData.locacion)}
              >
                Eliminar
              </button>
              <button className="btn btn-ghost" onClick={() => setModalData(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

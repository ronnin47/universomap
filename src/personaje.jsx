import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo,useRef } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from "react-leaflet";

import axios from "axios";

import { Info } from "./info";

import { API_URL } from "./config";




// 🔹 Componente principal
export const Personaje = ({ usuario, locaciones, setLocaciones,historialMapas,setHistorialMapas  }) => {
  
    const { id } = useParams();
  
    const navigate = useNavigate();
  
    const mundo = locaciones.find((l) => l.id === parseInt(id)) || {};

    console.log("llego a componente personaje")
const imagenBase="https://res.cloudinary.com/dzul1hatw/image/upload/v1755123685/imagenBase_wcjism.jpg";

  

    const locacionesDelMundo = useMemo(() => 
    locaciones.filter(l => l.capa === 1 && l.mundo === mundo.id),
    [locaciones, mundo.id]
  );

 useEffect(() => {
  const agregarAlHistorial = () => {
    setHistorialMapas(prev => {
      if (prev[prev.length - 1] === id) return prev;
      return [...prev, id];
    });
  };

  agregarAlHistorial();
}, [id, setHistorialMapas]);




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
    });
  }
}, [mundo]);



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
  {/* Encabezado con título y botón */}
  <div className="flex justify-between items-center">
    <h1 className="text-2xl font-bold text-white tracking-tight">
      {mundo.nombre}
    </h1>

    <button
      onClick={irAtras}
      className="
        flex items-center gap-2 px-4 py-1.5
        bg-blue-600 text-white font-medium rounded-lg
        shadow-md hover:bg-blue-700 hover:shadow-lg
        transition-all duration-200
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-4 h-4"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span>Volver</span>
    </button>
  </div>

 
</div>

     
      

   
<div className="w-full flex gap-5 items-start p-4 bg-gray-800 rounded-2xl shadow-md">
  {/* Imagen a la izquierda */}
  <div className="flex-shrink-0 w-64 h-64 bg-gray-700 rounded-xl overflow-hidden flex items-center justify-center">
    {mundo.iconoUrl ? (
      <img src={mundo.iconoUrl} alt={mundo.nombre} className="w-full h-full object-cover" />
    ) : (
      <span className="text-8xl">{mundo.icono || "🌍"}</span>
    )}
  </div>

  {/* Descripción a la derecha */}
  <div className="flex-1 text-gray-100">

    <p className="text-base leading-relaxed">{mundo.descripcion}</p>
  </div>
</div>


       
      






      
{/* Contenedor para centrar */}

{usuario==="narrador" ?(
  <div className="flex justify-end mb-4 mt-6">
  {/* Botón para abrir modal */}
  <button
    className="w-40 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
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
          placeholder="URL de imagen presentacion en mapa"
          className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg"
          value={camposMundo.imagenMapa ?? mundo.imagenMapaMundi}
          onChange={(e) => setCamposMundo({ ...camposMundo, imagenMapa: e.target.value })}
        />

      
        <input
          type="text"
          placeholder="URL de imagen del icono de Pj"
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
                  imagenMapaMundi: camposMundo.imagenMapa || mundo.iconoUrl,
                  tipo: camposMundo.tipo || mundo.tipo,
                  iconoUrl: camposMundo.icono || mundo.iconoUrl,
                  tamano: camposMundo.tamano || mundo.tamano,
                  coords_x: camposMundo.x || mundo.coords_x,
                  coords_y: camposMundo.y || mundo.coords_y,
                  capa: camposMundo.capa || mundo.capa,
                }
              );

              if (response.data.ok) {
                setLocaciones((prev) =>
                  prev.map((m) => (m.id === mundo.id ? { ...m, ...response.data.mundo } : m))
                );
                //alert("Mundo actualizado correctamente");
                setMostrarModalMundo(false);
              }
            } catch (error) {
              console.log("❌ Error al actualizar mundo:", error.message);
            }
          }}
        >
          Guardar cambios
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

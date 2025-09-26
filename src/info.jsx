import { useState, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { API_URL } from "./config";


const MySwal = withReactContent(Swal);

export const Info = ({ locacionId, usuario }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [secciones, setSecciones] = useState([]);
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    imagenUrl: "",
  });
  const [imagenModal, setImagenModal] = useState(null); // Lightbox
  const [editandoSeccion, setEditandoSeccion] = useState(null); // Para editar

 

  // Cargar secciones existentes
  useEffect(() => {
    if (!locacionId) return;

    const cargarSecciones = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/obtenerInfo/${locacionId}`
        );
        if (response.data.ok) setSecciones(response.data.info);
      } catch (error) {
        console.log("❌ Error cargando secciones:", error.message);
      }
    };

    cargarSecciones();
  }, [locacionId]);

  const abrirModal = (seccion = null) => {
    if (seccion) {
      // Editar sección: precargamos datos
      setFormData({
        titulo: seccion.titulo,
        descripcion: seccion.descripcion,
        imagenUrl: seccion.imagenUrl,
      });
      setEditandoSeccion(seccion);
    } else {
      // Agregar sección
      setFormData({ titulo: "", descripcion: "", imagenUrl: "" });
      setEditandoSeccion(null);
    }
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setFormData({ titulo: "", descripcion: "", imagenUrl: "" });
    setEditandoSeccion(null);
    setModalVisible(false);
  };

  const agregarSeccion = (nueva) => {
    setSecciones((prev) => [...prev, nueva]);
  };

  // Guardar o actualizar sección
  const handleGuardar = async () => {
    if (editandoSeccion) {
      // UPDATE
      try {
        const response = await axios.put(
          `${API_URL}/actualizarInfo/${editandoSeccion.id}`,
          formData
        );
        if (response.data.ok) {
          setSecciones((prev) =>
            prev.map((sec) =>
              sec.id === editandoSeccion.id ? response.data.info : sec
            )
          );
          cerrarModal();
        } else {
          console.log("Error actualizando sección:", response.data.error);
        }
      } catch (error) {
        console.log("❌ Error en PUT:", error.message);
      }
    } else {
      // POST (Agregar)
      const nuevaSeccion = {
        locacion_id_fk: locacionId,
        ...formData,
      };
      try {
        const response = await axios.post(
          `${API_URL}/guardarInfo`,
          nuevaSeccion
        );
        if (response.data.ok) {
          agregarSeccion(response.data.info);
          cerrarModal();
        } else {
          console.log("Error al guardar sección:", response.data.error);
        }
      } catch (error) {
        console.log("❌ Error en POST:", error.message);
      }
    }
  };




// Eliminar con SweetAlert2
const handleEliminar = async (id) => {
  const result = await Swal.fire({
    title: '¿Seguro que deseas eliminar esta sección?',
    text: "Esta acción no se puede deshacer",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (result.isConfirmed) {
    try {
      const response = await axios.delete(`${API_URL}/eliminarInfo/${id}`);
      if (response.data.ok) {
        setSecciones((prev) => prev.filter((sec) => sec.id !== id));
        Swal.fire(
          '¡Eliminado!',
          'La sección ha sido eliminada.',
          'success'
        );
      } else {
        Swal.fire('Error', response.data.error, 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  }
};
  const abrirImagen = (url) => setImagenModal(url);
  const cerrarImagen = () => setImagenModal(null);

  return (
    <div className="flex flex-col pb-4 gap-6 mt-2">
    <div className="flex items-center justify-between mb-6  ">
  <h1 className="text-3xl font-extrabold text-white tracking-wide">
    Secciones
  </h1>

  {usuario === "narrador" && (
   <button
  className="px-2 py-1.5 w-28 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-md shadow-md hover:scale-105 transform transition duration-300"
  onClick={() => abrirModal()}
>
  + Sección
</button>
  )}
</div>

      {/* Mostrar secciones */}
      <div className="flex flex-col gap-4 pl-6 pr-6">
        {secciones.map((sec) => (
          <div
            key={sec.id}
            className="card  bg-gray-900 shadow-xl border border-gray-700 rounded-xl overflow-hidden transition-transform duration-300 hover:scale-102"
          >
            {sec.imagenUrl && (
              <figure
                className="cursor-pointer"
                onClick={() => abrirImagen(sec.imagenUrl)}
              >
                <img
                  src={sec.imagenUrl}
                  alt={sec.titulo}
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                />
              </figure>
            )}
            <div className="card-body p-4">
              <h3 className="card-title text-white text-xl font-bold">
                {sec.titulo}
              </h3>
              <p className="text-gray-300 text-sm mt-2">{sec.descripcion}</p>

              {usuario === "narrador" && (
                <div className="card-actions justify-end mt-4">
                  <button
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => abrirModal(sec)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline btn-accent"
                    onClick={() => handleEliminar(sec.id)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar/editar sección */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-[9999]">
          <div className="bg-gray-900 rounded-xl shadow-xl p-6 w-96 overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">
              {editandoSeccion ? "Editar sección" : "+ Agregar sección"}
            </h2>

            <input
              type="text"
              placeholder="Título"
              className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
              value={formData.titulo}
              onChange={(e) =>
                setFormData({ ...formData, titulo: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="URL de la imagen"
              className="input input-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-3"
              value={formData.imagenUrl}
              onChange={(e) =>
                setFormData({ ...formData, imagenUrl: e.target.value })
              }
            />

            <textarea
              placeholder="Descripción"
              className="textarea textarea-bordered w-full bg-gray-700 text-white placeholder-gray-400 border-gray-600 focus:border-purple-500 focus:ring focus:ring-purple-400/30 rounded-lg mb-4"
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
                onClick={handleGuardar}
              >
                Guardar
              </button>
              <button
                className="px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition duration-300"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lightbox para imagen */}
      {imagenModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-[9999] p-4"
          onClick={cerrarImagen}
        >
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imagenModal}
              alt="Vista previa"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <button
              onClick={cerrarImagen}
              className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

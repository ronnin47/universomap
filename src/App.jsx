import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Nav } from "./nav";
import { Pagina1 } from "./pagina1";
import { Pagina2 } from "./pagina2";
import { Home } from "./home";
import { Foot } from "./foot";
import { MapaUniverso } from "./mapaUniverso";
import { MapaMundo } from "./mapaMundo";
import { Personaje } from "./personaje";

import { io } from "socket.io-client";
import { API_URL } from "./config";
import axios from "axios";

export const App = () => {
  const [locaciones, setLocaciones] = useState([]);
  const [historialMapas, setHistorialMapas] = useState([]);
  const [usuario, setUsuario] = useState(null); // jugador o narrador
  const [modalOpen, setModalOpen] = useState(true);
   const [mostrarPass, setMostrarPass] = useState(false); // controla si aparece el input
  const [passInput, setPassInput] = useState("");
  const [error, setError] = useState("");

  // Consumir locaciones
  useEffect(() => {
    const consumirLocaciones = async () => {
      try {
        const response = await axios.get(`${API_URL}/consumirLocaciones`);
        setLocaciones(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.log("Error al consultar:", error.message);
      }
    };
    consumirLocaciones();
  }, []);

  // Conexión Socket.io
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al backend:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Error de conexión:", err.message);
    });

    socket.on("locacionMovida", (data) => {
      console.log("📦 Locación movida recibida:", data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Funciones del modal
  const seleccionarJugador = () => {
    setUsuario("jugador");
    setModalOpen(false);
  };

  const seleccionarNarrador = () => {
    if (passInput === "1q2w3e") {
      setUsuario("narrador");
      setModalOpen(false);
      setError("");
    } else {
      setError("Contraseña incorrecta");
    }
  };

  return (
    <>
{/* Modal de selección de rol */}
{modalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
    style={{
      backgroundImage: `url('https://i.pinimg.com/originals/ef/90/15/ef90155f5e5af847b7eea15e496958bd.gif')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}
  >
    <div className="bg-gray-900/80 backdrop-blur-sm text-white p-6 rounded-xl shadow-md w-72 text-center">
      <h2 className="text-lg font-semibold mb-4">Seleccione su rol</h2>

      <div className="flex flex-col gap-3">
        {/* Botón Jugador */}
        <button
          onClick={seleccionarJugador}
          className="btn btn-sm btn-outline btn-primary w-full"
        >
          Jugador
        </button>

        {/* Botón Narrador */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setMostrarPass(true)}
            className="btn btn-sm btn-outline btn-success w-full"
          >
            Narrador
          </button>

          {/* Input contraseña solo si tocó Narrador */}
          {mostrarPass && (
            <input
              type="password"
              placeholder="Contraseña"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="input input-sm input-bordered w-full text-black mt-2"
            />
          )}

          {mostrarPass && (
            <button
              onClick={seleccionarNarrador}
              className="btn btn-sm btn-outline btn-success w-full"
            >
              Confirmar
            </button>
          )}
        </div>

        {/* Error */}
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    </div>
  </div>
)}


      {/* Renderizar app solo si se definió usuario */}
      {usuario && (
        <Router>
          <div className="flex flex-col min-h-screen bg-base-200">
            <Nav />

            <div className="flex-1 flex flex-col min-h-0">
              <main className="flex-1 flex flex-col bg-black overflow-auto">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Home
                        usuario={usuario}
                        locaciones={locaciones}
                        setLocaciones={setLocaciones}
                      />
                    }
                  />
                  <Route path="/pagina1" element={<Pagina1 />} />
                  <Route path="/pagina2" element={<Pagina2 />} />
                  <Route
                    path="/mapaUniverso"
                    element={
                      <MapaUniverso
                        usuario={usuario}
                        locaciones={locaciones}
                        setLocaciones={setLocaciones}
                      />
                    }
                  />
                  <Route
                    path="/mapaMundo/:id"
                    element={
                      <MapaMundo
                        usuario={usuario}
                        locaciones={locaciones}
                        setLocaciones={setLocaciones}
                        historialMapas={historialMapas}
                        setHistorialMapas={setHistorialMapas}
                      />
                    }
                  />
                  <Route
                    path="/personaje/:id"
                    element={
                      <Personaje
                        usuario={usuario}
                        locaciones={locaciones}
                        setLocaciones={setLocaciones}
                        historialMapas={historialMapas}
                        setHistorialMapas={setHistorialMapas}
                      />
                    }
                  />
                </Routes>
              </main>
            </div>

            <Foot />
          </div>
        </Router>
      )}
    </>
  );
};




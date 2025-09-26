import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { Nav } from "./nav";
import { Pagina1 } from "./pagina1";
import { Pagina2 } from "./pagina2";
import { Home } from "./home";
import { Foot } from "./foot";
import { MapaUniverso } from "./mapaUniverso";
import { MapaMundo } from "./mapaMundo";
import {Personaje} from "./personaje";

import { io } from "socket.io-client";
import { API_URL } from "./config";


const socket = io(API_URL); 
//const socket = io('http://localhost:10000');

import axios from "axios";

export const App = () => {
  const [locaciones, setLocaciones] = useState([]);
  const usuario = "narrador";
  //const usuario="jugador"


   const [historialMapas, setHistorialMapas] = useState([]);
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

useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"], // fuerza conexión limpia
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



  /*
  useEffect(()=>{
    console.log("",locaciones)
  },[locaciones])
*/
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-base-200">
        <Nav />

        {/* Contenedor que empuja el footer */}
        <div className="flex-1 flex flex-col min-h-0">
          <main className="flex-1 flex flex-col bg-black overflow-auto">
            <Routes>
              <Route path="/" element={<Home usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones} />} />
              <Route path="/pagina1" element={<Pagina1 />} />
              <Route path="/pagina2" element={<Pagina2 />} />
              <Route path="/mapaUniverso" element={<MapaUniverso 
                    usuario={usuario} 
                    locaciones={locaciones} 
                    setLocaciones={setLocaciones}
                    />} />
              <Route path="/mapaMundo/:id" element={<MapaMundo 
                    usuario={usuario} 
                    locaciones={locaciones} 
                    setLocaciones={setLocaciones} 
                    historialMapas={historialMapas}
                    setHistorialMapas={setHistorialMapas}
                   />} />
               <Route path="/personaje/:id" element={<Personaje 
                    usuario={usuario} 
                    locaciones={locaciones} 
                    setLocaciones={setLocaciones} 
                    historialMapas={historialMapas}
                    setHistorialMapas={setHistorialMapas}
                   />} />
            
            </Routes>
          </main>
        </div>

        <Foot />
      </div>
    </Router>
  );
};







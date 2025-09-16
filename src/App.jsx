import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { Nav } from "./nav";
import { Pagina1 } from "./pagina1";
import { Pagina2 } from "./pagina2";
import { Home } from "./home";
import { Foot } from "./foot";
import { MapaUniverso } from "./mapaUniverso";
import { MapaMundo } from "./mapaMundo";
import { MapaZona } from "./mapaZona";


export const App=()=> {
  
const loc = [
  { 
    id: 1, 
    nombre: "Xoama", 
    coords: [400, 500], 
    tipo: "mundo", 
    tamano: 20, 
    descripcion: "Capital del universo Zen-Zen, ciudad principal y centro de comercio.", 
    icono: "🌍",
    imagenMapaMundi:"https://plus.unsplash.com/premium_photo-1681488098851-e3913f3b1908?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFwYXxlbnwwfHwwfHx8MA%3D%3D",
     locaciones: [
      { id: 101, nombre: "Plaza Central", coords: [300, 150], tipo: "ciudad", tamano: 15, descripcion: "Centro comercial y punto de encuentro.", icono: "🏛️" },
      { id: 102, nombre: "Puerto de Xoama", coords: [350, 250], tipo: "puerto", tamano: 15, descripcion: "Llegada de naves intercontinentales.", icono: "⚓" },
      { id: 103, nombre: "Distrito Sabio", coords: [350, 50], tipo: "barrio", tamano: 12, descripcion: "Residencia de los estudiosos del universo.", icono: "📚" },
    ]
  },
  { 
    id: 2, 
    nombre: "Xiang Ji", 
    coords: [200, 300], 
    tipo: "mundo", 
    tamano: 20, 
    descripcion: "Una isla flotante que flota entre las nubes, hogar de los sabios del cielo.", 
    icono: "🌍",
    imagenMapaMundi:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7GhTYorI6lxJusPoyBDFejMKVWDiaDpS4pA&s",
    locaciones: [
      { id: 201, nombre: "Templo del Viento", coords: [8, 12], tipo: "templo",tamano: 15, descripcion: "Donde los sabios meditan entre las nubes.", icono: "⛩️" },
      { id: 202, nombre: "Torre de Observación", coords: [2, 18], tipo: "torre",tamano: 15, descripcion: "Desde aquí se vigila todo el cielo.", icono: "🗼" },
      { id: 203, nombre: "Jardín Celeste", coords: [12, 6], tipo: "jardín",tamano: 15, descripcion: "Jardines flotantes con plantas raras.", icono: "🌿" },
    ]
  },
  { 
    id: 3, 
    nombre: "Sekishiki", 
    coords: [600, 700], 
    tipo: "mundo", 
    tamano: 14, 
    descripcion: "Puerto principal de llegada de naves intercontinentales.", 
    icono: "🌍",
    imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 301, nombre: "Muelles de Sekishiki", coords: [4, 10], tipo: "puerto", tamano: 15, descripcion: "Llegada y salida de barcos y naves.", icono: "⚓" },
      { id: 302, nombre: "Bazar Marítimo", coords: [7, 3], tipo: "mercado",tamano: 15, descripcion: "Mercado de mercancías importadas.", icono: "🛒" },
    ]
  },
  { 
    id: 4, 
    nombre: "Nadashi", 
    coords: [450, 550], 
    tipo: "mundo", 
    tamano: 23, 
    descripcion: "Ciudad principal y centro cultural del universo Zen-Zen.", 
    icono: "🌍",
     imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 401, nombre: "Castillo de Nadashi", coords: [6, 8], tipo: "castillo",tamano: 15, descripcion: "Residencia del gobernante local.", icono: "🏰" },
      { id: 402, nombre: "Plaza del Arte", coords: [10, 15], tipo: "plaza",tamano: 15, descripcion: "Lugar de exposiciones culturales.", icono: "🎨" },
    ]
  },
  { 
    id: 5, 
    nombre: "Pushan", 
    coords: [250, 350], 
    tipo: "mundo", 
    tamano: 70, 
    descripcion: "Isla flotante hogar de los sabios del cielo.", 
    icono: "🌍",
         imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 501, nombre: "Academia de Hechicería", coords: [15, 20], tipo: "escuela",tamano: 15, descripcion: "Entrenamiento de magos y estudiosos.", icono: "🏫" },
      { id: 502, nombre: "Lago de las Nubes", coords: [25, 10], tipo: "lago",tamano: 15, descripcion: "Lago místico flotando en el aire.", icono: "🌊" },
      { id: 503, nombre: "Mirador Estelar", coords: [5, 30], tipo: "torre",tamano: 15, descripcion: "Observatorio de estrellas.", icono: "🗼" },
    ]
  },
  { 
    id: 6, 
    nombre: "Zen Zen", 
    coords: [650, 650], 
    tipo: "mundo", 
    tamano: 10, 
    descripcion: "Puerto principal de llegada de naves intercontinentales.", 
    icono: "🌍",
         imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 601, nombre: "Puerto Zen", coords: [2, 3], tipo: "puerto",tamano: 15, descripcion: "Atracaderos de naves.", icono: "⚓" },
      { id: 602, nombre: "Distrito Comercial", coords: [5, 5], tipo: "mercado",tamano: 15, descripcion: "Centro de comercio y trueque.", icono: "🛒" },
    ]
  },
  { 
    id: 7, 
    nombre: "Saitama", 
    coords: [350, 450], 
    tipo: "mundo", 
    tamano: 26, 
    descripcion: "Ciudad de cultura y comercio avanzado.", 
    icono: "🌍",
         imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 701, nombre: "Forja de Saitama", coords: [6, 9], tipo: "taller",tamano: 15, descripcion: "Producción de armas y herramientas.", icono: "⚒️" },
      { id: 702, nombre: "Barrio Antiguo", coords: [12, 3], tipo: "barrio",tamano: 15, descripcion: "Calles históricas y mercados locales.", icono: "🏘️" },
    ]
  },
  { 
    id: 8, 
    nombre: "Nagara", 
    coords: [300, 400], 
    tipo: "mundo", 
    tamano: 30, 
    descripcion: "Isla flotante hogar de sabios y comerciantes.", 
    icono: "🌍",
         imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 801, nombre: "Templo del Agua", coords: [7, 14], tipo: "templo",tamano: 15, descripcion: "Centro de meditación y rituales acuáticos.", icono: "⛩️" },
      { id: 802, nombre: "Puerto de Nagara", coords: [10, 5], tipo: "puerto",tamano: 15, descripcion: "Llegada de naves flotantes.", icono: "⚓" },
    ]
  },
  { 
    id: 9, 
    nombre: "Mekai", 
    coords: [700, 600], 
    tipo: "mundo", 
    tamano: 50, 
    descripcion: "Puerto de gran tamaño con mercados y talleres.", 
    icono: "🌍",
         imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [
      { id: 901, nombre: "Gran Muelle", coords: [15, 10], tipo: "puerto",tamano: 15, descripcion: "Atracadero de grandes naves.", icono: "⚓" },
      { id: 902, nombre: "Mercado Mekai", coords: [5, 20], tipo: "mercado",tamano: 15, descripcion: "Venta de bienes importados.", icono: "🛒" },
      { id: 903, nombre: "Torre de Vigilancia", coords: [20, 5], tipo: "torre",tamano: 15, descripcion: "Observación y defensa del puerto.", icono: "🗼" },
    ]
  },
  { 
    id: 10, 
    nombre: "Estrella Amateratsu", 
    coords: [100, 200], 
    tipo: "sol", 
    tamano: 50, 
    descripcion: "Sol brillante y centro de energía del sistema.", 
    icono: "☀️",
     imagenMapaMundi:"https://media.istockphoto.com/id/1448525856/es/vector/mapa-del-mundo.jpg?s=612x612&w=0&k=20&c=BKXm57ec9wXwWtA_Yq8bIkkt40bXvblo4-4FeuNNRSo=",
    locaciones: [] // Los soles no necesitan locaciones internas
  },
];

const [locaciones,setLocaciones]=useState(loc)



const usuario="narrador"

  return (
    <>
    <Router>

       <div className="flex flex-col min-h-screen bg-base-200">
          <Nav></Nav>

         {/* Contenido dinámico */}
        <main className="flex-1 p-2 bg-black">

          <Routes>
            <Route path="/" element={<Home usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones} />} />
            <Route path="/pagina1" element={<Pagina1 />} />
            <Route path="/pagina2" element={<Pagina2 />} />
             <Route path="/mapaUniverso" element={<MapaUniverso usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones}/>} />
              <Route path="/mapaMundo/:id" element={<MapaMundo usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones} />} />
              <Route path="/mapaZona/:id" element={<MapaZona usuario={usuario} locaciones={locaciones} setLocaciones={setLocaciones}/>} />
          </Routes>
        
        </main>

        <Foot></Foot>
       </div>

    </Router>

    </>
  )
}



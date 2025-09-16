import { useState } from "react";
import { Link } from "react-router-dom";

export const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative navbar bg-gradient-to-r from-black via-gray-900 to-blue-950 shadow-2xl text-white px-4 py-4">

      {/* Logo */}
      <div className="flex-1">
        <Link 
          to="/" 
          className="text-2xl md:text-3xl font-extrabold text-purple-400 hover:text-purple-300 hover:drop-shadow-2xl transition-all duration-300 truncate"
        >
          🌌 Universo Celeste
        </Link>
      </div>

      {/* Hamburger para móvil */}
      <div className="flex-none md:hidden">
        <button 
          className="btn btn-square btn-ghost"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Links Desktop */}
      <div className="hidden md:flex flex-none gap-6">
        <Link className="text-white hover:text-purple-300 hover:scale-110 hover:drop-shadow-lg transition-all duration-300 font-semibold" to="/">Inicio</Link>
        <Link className="text-white hover:text-purple-300 hover:scale-110 hover:drop-shadow-lg transition-all duration-300 font-semibold" to="/pagina1">Página 1</Link>
        <Link className="text-white hover:text-purple-300 hover:scale-110 hover:drop-shadow-lg transition-all duration-300 font-semibold" to="/pagina2">Página 2</Link>
      </div>

      {/* Links Móvil */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-gradient-to-r from-black via-gray-900 to-blue-950 flex flex-col items-center gap-4 py-4 shadow-inner z-50 md:hidden">
          <Link className="text-white text-lg hover:text-purple-300 hover:scale-105 transition-all duration-300 font-semibold" to="/" onClick={() => setIsOpen(false)}>Inicio</Link>
          <Link className="text-white text-lg hover:text-purple-300 hover:scale-105 transition-all duration-300 font-semibold" to="/pagina1" onClick={() => setIsOpen(false)}>Página 1</Link>
          <Link className="text-white text-lg hover:text-purple-300 hover:scale-105 transition-all duration-300 font-semibold" to="/pagina2" onClick={() => setIsOpen(false)}>Página 2</Link>
        </div>
      )}
      
    </div>
  );
};

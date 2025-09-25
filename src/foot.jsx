import { Link } from "react-router-dom";

export const Foot = () => {
  return (
    <footer className="footer flex flex-col md:flex-row items-center justify-between p-6 bg-gradient-to-r from-black via-gray-900 to-blue-950 text-white shadow-inner">

      {/* Marca + derechos */}
      <aside className="flex flex-col items-start gap-1">
        <span className="text-lg font-bold text-purple-400 hover:text-purple-300 transition-colors duration-300">
            ZNK- ゼピロの思い出
        </span>
        <p className="text-sm opacity-70">© 2025 - Todos los derechos reservados</p>
        <p className="text-xs opacity-80">
          Desarrollado por <span className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-300">Jorge A. Tournier</span>
        </p>
      </aside>

      {/* Navegación */}
      <nav className="flex gap-4 mt-4 md:mt-0">
        <Link className="hover:text-purple-300 hover:scale-110 transition-all duration-300" to="/">Inicio</Link>
        <Link className="hover:text-purple-300 hover:scale-110 transition-all duration-300" to="/pagina1">Página 1</Link>
        <Link className="hover:text-purple-300 hover:scale-110 transition-all duration-300" to="/pagina2">Página 2</Link>
      </nav>

    </footer>
  );
};

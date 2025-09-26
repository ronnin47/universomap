// server.js
import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
import path from "path";
import { fileURLToPath } from "url";
const app = express();


// 🔹 Middlewares
app.use(cors());
app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/*
// 🔹 Configuración de conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "baseLocalZnk",
  password: "041183",
  port: 5432,
});
*/

//base de datos en RENDER
const pool = new Pool({
  user: 'gorda',
  host: 'dpg-d1s01g7diees73akbt00-a.oregon-postgres.render.com',
  database: 'appbasenative',
  password: '7p1AkuNrAUkPQpM0i75VCA5Ljx71WLRC',
  port: 5432,
   ssl: {
    rejectUnauthorized: false, // Esto es clave en conexiones con Render
  },
});




// 🔹 Verificar conexión apenas arranca el servidor
(async () => {
  try {
    const result = await pool.query("SELECT NOW() AS fecha;");
    console.log("✅ Conectado a PostgreSQL con éxito. Fecha:", result.rows[0].fecha);
  } catch (error) {
    console.error("❌ Error conectando a PostgreSQL:", error);
    process.exit(1); // detiene el servidor si no conecta
  }
})();

// 🔹 Endpoint de prueba
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS fecha;");
    res.json({ ok: true, fecha: result.rows[0].fecha });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Error conectando a la DB" });
  }
});


// 🔹 Ejemplo de endpoint simple
app.get("/", (req, res) => {
  res.send("🚀 Servidor funcionando en puerto 10000");
});


// 🔹 Nuevo endpoint: traer todos los personajes
app.get("/consumirLocaciones", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM locaciones;");
    //console.log("Lo que me trae de bbdd", result.rows);

    // Si no hay filas, devolver array vacío
    res.json(result.rows || []);
  } catch (error) {
    console.error("❌ Error al consumir locaciones:", error);

    // Ante error, igual devolvemos []
    res.json([]);
  }
});

// POST: guardar locación
app.post("/guardarLocacion", async (req, res) => {
  const {
    nombre,
    tipo,
    descripcion,
    imagenMapaMundi,
    coords_x,
    coords_y,
    tamano,
    icono,
    capa,
    iconoUrl
  } = req.body;
  
  //console.log("Lo que viene del cliente: ", req.body);

  try {
    // 1️⃣ Insertamos la locación
    const queryInsert = `
      INSERT INTO locaciones
      (nombre, tipo, descripcion, "imagenMapaMundi", coords_x, coords_y, tamano, icono, capa,"iconoUrl")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `;
    const values = [nombre, tipo, descripcion, imagenMapaMundi, coords_x, coords_y, tamano, icono, capa,iconoUrl];
    const resultInsert = await pool.query(queryInsert, values);
    const nuevaLocacion = resultInsert.rows[0];

    // 2️⃣ Actualizamos el campo mundo con el mismo id
    const queryUpdate = `
      UPDATE locaciones
      SET mundo = $1
      WHERE id = $1
      RETURNING *;
    `;
    const resultUpdate = await pool.query(queryUpdate, [nuevaLocacion.id]);

    res.json({ ok: true, locacion: resultUpdate.rows[0] });
  } catch (error) {
    console.error("❌ Error al guardar locación:", error);
    res.status(500).json({ ok: false, error: "No se pudo guardar la locación" });
  }
});

// POST: guardar locación
app.post("/guardarLocacionMundo", async (req, res) => {
  const {
    nombre,
    tipo,
    descripcion,
    imagenMapaMundi,
    iconoUrl,
    coords_x,
    coords_y,
    tamano,
    icono,
    capa,
    mundo,
  } = req.body;

  console.log("Lo que viene del cliente: ", req.body);

  try {
    // 1️⃣ Insertamos la locación directamente con el campo mundo
    const queryInsert = `
      INSERT INTO locaciones
      (nombre, tipo, descripcion, "imagenMapaMundi","iconoUrl",coords_x, coords_y, tamano, icono, capa, mundo)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10,$11)
      RETURNING *;
    `;
    const values = [nombre, tipo, descripcion, imagenMapaMundi,iconoUrl, coords_x, coords_y, tamano, icono, capa, mundo];
    const resultInsert = await pool.query(queryInsert, values);
    const nuevaLocacion = resultInsert.rows[0];

    res.json({ ok: true, locacion: nuevaLocacion });
  } catch (error) {
    console.error("❌ Error al guardar locación:", error);
    res.status(500).json({ ok: false, error: "No se pudo guardar la locación" });
  }
});


app.post("/actualizarCoordenadas", async (req, res) => {
  const { id, coords_x, coords_y } = req.body;

  if (!id || coords_x === undefined || coords_y === undefined) {
    return res.status(400).json({ ok: false, error: "Faltan parámetros" });
  }

  try {
    const query = `
      UPDATE locaciones
      SET coords_x = $1, coords_y = $2
      WHERE id = $3
      RETURNING *;
    `;
    const values = [coords_x, coords_y, id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Locación no encontrada" });
    }

    res.json({ ok: true, locacion: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al actualizar coordenadas:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});





app.delete("/eliminarLocacion/:id", async (req, res) => {
  const { id } = req.params;
  console.log("",id)

  try {
    const query = `DELETE FROM locaciones WHERE id = $1 RETURNING *`;
    const values = [id];
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Locación no encontrada" });
    }

    res.json({ message: "Locación eliminada", locacion: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando locación:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
});




app.put("/actualizarMundo/:id", async (req, res) => {
  const { id } = req.params;
  const {
    nombre,
    descripcion,
    imagenMapaMundi,
    tipo,
    iconoUrl,
    tamano,
    coords_x,
    coords_y,
    capa,
  } = req.body;

  try {
    const query = `
      UPDATE locaciones
      SET 
        nombre = $1,
        descripcion = $2,
        "imagenMapaMundi" = $3,
        tipo = $4,
        "iconoUrl" = $5,
        tamano = $6,
        coords_x = $7,
        coords_y = $8,
        capa = $9
      WHERE id = $10
      RETURNING *;
    `;

    const values = [
      nombre,
      descripcion,
      imagenMapaMundi,
      tipo,
      iconoUrl,
      tamano,
      coords_x,
      coords_y,
      capa,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, msg: "Mundo no encontrado" });
    }

    res.json({ ok: true, mundo: result.rows[0] });
  } catch (error) {
    console.error("❌ Error al actualizar mundo:", error.message);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
});




// Crear una nueva info
app.post("/guardarInfo", async (req, res) => {
  const { locacion_id_fk, titulo, descripcion, imagenUrl } = req.body;

  if (!locacion_id_fk || !titulo) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO infos (locacion_id_fk, titulo, descripcion, "imagenUrl") 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [locacion_id_fk, titulo, descripcion || null, imagenUrl || null]
    );

    res.json({ ok: true, info: result.rows[0] });
  } catch (error) {
    console.error("Error al insertar info:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});


// 🔹 Obtener secciones de una locación
app.get("/obtenerInfo/:locacionId", async (req, res) => {
  const { locacionId } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, titulo, descripcion, "imagenUrl" 
       FROM infos 
       WHERE locacion_id_fk = $1
       ORDER BY id ASC`,
      [locacionId]
    );

    res.json({ ok: true, info: result.rows });
  } catch (error) {
    console.error("Error obteniendo secciones:", error);
    res.status(500).json({ ok: false, error: "Error al obtener secciones" });
  }
});



// DELETE sección por ID
app.delete("/eliminarInfo/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM infos WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Sección no encontrada" });
    }

    res.json({ ok: true, info: result.rows[0] });
  } catch (error) {
    console.error("Error eliminando sección:", error.message);
    res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});




// PUT para actualizar una sección por ID
app.put("/actualizarInfo/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, imagenUrl } = req.body;

  try {
    const result = await pool.query(
      `UPDATE infos
       SET titulo = $1,
           descripcion = $2,
           "imagenUrl" = $3
       WHERE id = $4
       RETURNING *`,
      [titulo, descripcion, imagenUrl, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ ok: false, error: "Sección no encontrada" });
    }

    res.json({ ok: true, info: result.rows[0] });
  } catch (error) {
    console.error("Error actualizando sección:", error.message);
    res.status(500).json({ ok: false, error: "Error del servidor" });
  }
});


// Servir los archivos estáticos del frontend (Vite build)
app.use(express.static(path.join(__dirname, "dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});



const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌍 Servidor escuchando en http://localhost:${PORT}`);
});
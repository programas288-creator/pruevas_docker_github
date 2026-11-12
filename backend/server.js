// Author: Pxndx
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

app.get('/api/tareas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tareas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar PostgreSQL' });
  }
});

app.post('/api/tareas', async (req, res) => {
  const { titulo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tareas (titulo) VALUES ($1) RETURNING *',
      [titulo]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar tarea' });
  }
});

app.patch('/api/tareas/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tareas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el estado' });
  }
});

// NUEVA RUTA PARA REINICIAR TODAS LAS TAREAS A 'PENDIENTE' AL CAMBIAR DE DÍA
app.post('/api/tareas/reiniciar', async (req, res) => {
  try {
    await pool.query("UPDATE tareas SET estado = 'Pendiente'");
    res.json({ mensaje: 'Todas las tareas han vuelto a estado Pendiente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al reiniciar las tareas' });
  }
});

app.delete('/api/tareas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tareas WHERE id = $1', [id]);
    res.json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
});

app.listen(4000, '0.0.0.0', () => {
  console.log('API corriendo en el puerto 4000');
});
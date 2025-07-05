const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://0323105895:CHUCHOXDPATO1%3F@cluster0323105895.gbp88az.mongodb.net/ConMongoDB?retryWrites=true&w=majority');

// Esquema para lecturas (temperatura, humedad, fecha)
const LecturaSchema = new mongoose.Schema({
  _id: String,
  temperatura: Number,
  humedad: Number,
  fecha: Date,
});

const Lectura = mongoose.model('lecturas', LecturaSchema);

// Esquema para incubadora
const IncubadoraSchema = new mongoose.Schema({
  _id: Number,
  temperActual: Number,
  humedActual: Number,
  estSensorHum: Boolean,
  estSensorTemp: Boolean,
  estVentilador: Boolean,
  estHumificador: Boolean,
  estCalefactor: Boolean,
  configuracionRango: {
    tempMin: Number,
    tempMax: Number,
    humedadMin: Number,
    humedadMax: Number,
  },
});

const incubadora = mongoose.model('incubadora', IncubadoraSchema);

// Ruta para insertar una lectura (opcional)
app.post('/lecturas', async (req, res) => {
  try {
    const nueva = new Lectura(req.body);
    await nueva.save();
    res.status(201).json(nueva);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para obtener lecturas
app.get('/lecturas', async (req, res) => {
  try {
    const datos = await Lectura.find().sort({ fecha: 1 });
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener datos de la incubadora
app.get('/incubadora', async (req, res) => {
  try {
    const datos = await incubadora.findOne({ _id: 1 });
    if (!datos) {
      return res.status(404).json({ error: 'No se encontró la incubadora con id 1' });
    }
    res.json(datos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

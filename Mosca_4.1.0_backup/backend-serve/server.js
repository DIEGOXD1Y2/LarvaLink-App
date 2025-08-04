const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect('mongodb+srv://Danigenerico05:HopelessSoul@danigenerico05.8cv9cf2.mongodb.net/hermetia?retryWrites=true&w=majority')
  .then(() => console.log('✅ Si se conecto a MongoDB :)'))
  .catch(err => console.error('❌ Error, no se conecto a MongoDB :(  Error:', err));

// -- NUEVOS MODELOS ACTUALIZADOS

// MODELO DE LA COLECCION USUARIOS
const UsuarioSchema = new mongoose.Schema({
  _id:            { type: Number, required: true },
  nombre:         { type: String, required: true },
  primerApell:    { type: String, required: true },
  segundoApell:   { type: String, required: false },
  numTel:         { type: String, required: false },
  correo:         { type: String, required: true },
  contrasena:     { type: String, required: true },
  estado:         { type: Boolean, required: true },
  idRol:          { type: Number, required: true }
}, { collection: 'USUARIOS' });

const Usuario = mongoose.model('USUARIOS', UsuarioSchema);

//  MODELO DE LA COLECCION ROLES
const RolSchema = new mongoose.Schema({
  _id:        { type: Number, required: true },
  nombreRol:  { type: String, required: true }
}, { collection: 'ROLES' });

const Rol = mongoose.model('ROLES', RolSchema);

// MODELO DE LA COLECCION LOGNOTF OSEA LAS ALERTAS
const AlertaSchema = new mongoose.Schema({
  _id:              { type: mongoose.Schema.Types.ObjectId, required: true },
  fechaHora:        { type: Date, required: true },
  tipo:             { type: String, enum: ['temperatura', 'humedad'], required: true },
  valor:            { type: Number, required: true },
  umbral:           { type: Number, required: true },
  condicion:        { type: String, enum: ['mayor', 'menor'], required: true },
  idComponente:    { type: Number, required: true }, 
  idInfoIncubadora: { type: Number, required: true }
}, { collection: 'LOGNOTF' });

const Alerta = mongoose.model('LOGNOTF', AlertaSchema);

// MODELO DE LA COLECCION INFOINCUBADORA
const InfoIncubadoraSchema = new mongoose.Schema({
  _id:          { type: Number, required: true },
  temperActual: { type: Number, required: true }, 
  humedActual:  { type: Number, required: true },
  idComponentes:   { type: [Number],required: true },
}, { collection: 'INFOINCUBADORA' });

const InfoIncubadora = mongoose.model('INFOINCUBADORA', InfoIncubadoraSchema);

// MODELO DE LA COLECCION HISTORIALTEMP
const HistorialTempSchema = new mongoose.Schema({
  _id:              { type: mongoose.Schema.Types.ObjectId, required: true },
  fechaRegistro:    { type: Date, required: true },
  temperatura:      { type: Number, required: true },
  idInfoIncubadora: { type: Number, required: true },
  idComponente:     { type: Number, required: false }
}, { collection: 'HISTORIALTEMP' });

const HistorialTemp = mongoose.model('HISTORIALTEMP', HistorialTempSchema);

// MODELO DE LA COLECCION HISTORIALHUM
const HistorialHumSchema = new mongoose.Schema({
  _id:              { type: mongoose.Schema.Types.ObjectId, required: true },
  fechaRegistro:    { type: Date, required: true },
  humedad:          { type: Number, required: true },
  idInfoIncubadora: { type: Number, required: true },
  idComponente:     { type: Number, required: false }
}, { collection: 'HISTORIALHUM' });

const HistorialHum = mongoose.model('HISTORIALHUM', HistorialHumSchema);

// MODELO DE LA COLECCION EVENTOINCUBADORA
const EventoIncubadoraSchema = new mongoose.Schema({
  _id:            { type: mongoose.Schema.Types.ObjectId, required: true },
  fechaDeIngreso: { type: Date, required: true },
  fechaEstimada:  { type: Date, required: true },
  fechaEclosion:  { type: Date, required: false }
}, { collection: 'EVENTOINCUBA' });

const Larva = mongoose.model('EVENTOINCUBA', EventoIncubadoraSchema);

// MODELO DE LA COLECCION CONFIGURACIONTF
const ConfiguracionSchema = new mongoose.Schema({
  _id:              { type: Number, required: true },
  tempMin:          { type: Number, required: true },
  tempMax:          { type: Number, required: true },
  humedadMin:       { type: Number, required: true },
  humedadMax:       { type: Number, required: true },
  idInfoIncubadora: { type: Number, required: true }
}, { collection: 'CONFIGNOTF' });

const Configuracion = mongoose.model('CONFIGNOTF', ConfiguracionSchema);

// MODELO DE LA COLECCION COMPONENTES:
const ComponenteSchema = new mongoose.Schema({
  _id:              { type: Number, required: true },
  nombreComponente: { type: String, required: true },
  tipo: { 
    type: String, 
    enum: ['sensor', 'actuador'], 
    required: true
  },
  estado:           { type: Boolean, required: true }
}, { collection: 'COMPONENTES' });
const Componente = mongoose.model('COMPONENTES', ComponenteSchema);



//MODELO DE LA COLECCION ALERACTUADORES
const HistorialActuadorSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  fechaRegistro:    { type: Date, required: true },
  idComponente:       { type: Number, required: true },
  idInfoIncubadora: { type: Number, required: true }
}, { collection: 'ALERACTUADORES' });

const AlertasComponentes = mongoose.model('ALERACTUADORES', HistorialActuadorSchema);

/* ---- ENDPOINTS A MODIFICAR ----*/

// ENDSPOINT DEL LOGIN
app.post('/login', async (req, res) => {
  const { correo, contrasena } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || usuario.contrasena !== contrasena)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    if (!usuario.estado)
      return res.status(403).json({ error: 'Usuario inactivo' });

    res.json({
      id: usuario._id,
      nombre: usuario.nombre,
      primerApell: usuario.primerApell,
      segundoApell: usuario.segundoApell || '',
      numTel: usuario.numTel || '',
      correo: usuario.correo,
      idRol: usuario.idRol
    });
  } catch (error) {
    console.error('Error en /login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


app.get('/incubadora', async (req, res) => {
  try {
    const info = await InfoIncubadora.findOne({ _id: 1 });

    if (!info || !Array.isArray(info.idComponentes)) {
      return res.status(404).json({ error: 'No se encontró la info de incubadora o idComponentes no es válido' });
    }

    const componentes = await Componente.find({ _id: { $in: info.idComponentes } });

    const normalizar = (str) =>
      str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

    const getEstado = (nombreOriginal) => {
      const nombreNorm = normalizar(nombreOriginal);
      const comp = componentes.find(c => normalizar(c.nombreComponente) === nombreNorm);
      return comp ? comp.estado : false;
    };

    res.json({
      temperActual: info.temperActual,
      humedActual: info.humedActual,

      temperaturaSensor1: info.temperActual,
      temperaturaSensor2: info.temperActual,
      temperaturaPromedio: info.temperActual,

      humedadSensor1: info.humedActual,
      humedadSensor2: info.humedActual,
      humedadPromedio: info.humedActual,

      estCalefactor: getEstado('calefactor'),
      estVentilador: getEstado('ventilador'),
      estHumificador: getEstado('humificador'),
      estDht11A: getEstado('sensorDHT11 A'),
      estDht11B: getEstado('sensorDHT11 B'),
    });

  } catch (error) {
    console.error('❌ Error en /incubadora:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// ENDPOINTS PARA CONTROLSCREEN
app.get('/incubadora/:id', async (req, res) => {
  try {
    const componentes = await Componente.find({});  //Pero no tiene filtro
    const resultado = {};
    for (const comp of componentes) {
      const key = `${comp.tipo}_${comp.nombreComponente.toLowerCase().replace(/\s+/g, '')}_${comp._id}`;
      resultado[key] = {
        id: comp._id,
        nombre: comp.nombreComponente,
        estado: comp.estado
      };
    }
    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener los componentes:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put('/componentes/estado/:idComponente', async (req, res) => {
  const idComponente = parseInt(req.params.idComponente);
  const { estado, idInfoIncubadora } = req.body;

  try {
    const componente = await Componente.findOne({ _id: idComponente });

    if (!componente) {
      return res.status(404).json({ mensaje: 'Componente no encontrado' });
    }

    const estadoAnterior = componente.estado;

    componente.estado = estado;
    await componente.save();

    if (estado === true && estadoAnterior === false) {
      await AlertasComponentes.create({
        fechaRegistro: new Date(),
        idComponente,
        idInfoIncubadora
      });
    }

    res.status(200).json({ mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error(`❌ Error en PUT /componentes/estado/${idComponente}:`, error);
    res.status(500).json({ mensaje: 'Error al actualizar estado', error });
  }
});





// --- NUEVOS: promedios por minuto ---

app.get('/lecturaspromedio', async (req, res) => {
  try {
    const fecha = req.query.fecha;
    if (!fecha) return res.status(400).json({ error: 'Falta parámetro fecha YYYY-MM-DD' });

    // Parsear fecha inicio y fin del día (UTC)
    const [y, m, d] = fecha.split('-').map(Number);
    const inicio = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const fin = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

    // Consulta las lecturas de temperatura para esa incubadora y rango de fechas
    const lecturas = await HistorialTemp.find({
      fechaRegistro: { $gte: inicio, $lte: fin },
      idInfoIncubadora: 1,  // si quieres hacerlo dinámico, pásalo como parámetro
    }).sort({ fechaRegistro: 1 });

    // Mapa para agrupar por minuto: clave = "YYYY-MM-DDTHH:mm"
    const map = new Map();

    for (const l of lecturas) {
      // Obtener la clave por minuto (sin segundos)
      const key = l.fechaRegistro.toISOString().slice(0, 16); // Ejemplo: '2025-08-01T15:23'
      
      if (!map.has(key)) {
        map.set(key, { suma: 0, count: 0 });
      }
      const obj = map.get(key);
      obj.suma += l.temperatura;
      obj.count++;
    }

    // Construir arreglo resultado con fecha exacta en el minuto y promedio calculado
    const resultado = Array.from(map.entries()).map(([key, val]) => ({
      fechaRegistro: new Date(key + ':00Z'),  // Completa segundos y zona UTC
      temperaturaPromedio: val.suma / val.count
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error en /lecturaspromedio:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


app.get('/humedadpromedio', async (req, res) => {
  try {
    const fecha = req.query.fecha;
    if (!fecha) return res.status(400).json({ error: 'Falta parámetro fecha YYYY-MM-DD' });

    const [y, m, d] = fecha.split('-').map(Number);
    const inicio = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
    const fin = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));

    // Consulta las lecturas de humedad para la incubadora 1 y rango de fecha
    const lecturas = await HistorialHum.find({
      fechaRegistro: { $gte: inicio, $lte: fin },
      idInfoIncubadora: 1, // Puedes hacerlo dinámico si quieres
    }).sort({ fechaRegistro: 1 });

    // Agrupar por minuto truncando fechaRegistro a YYYY-MM-DDTHH:mm
    const map = new Map();

    for (const l of lecturas) {
      const key = l.fechaRegistro.toISOString().slice(0, 16); // 'YYYY-MM-DDTHH:mm'
      if (!map.has(key)) map.set(key, { suma: 0, count: 0 });
      const obj = map.get(key);
      obj.suma += l.humedad;
      obj.count++;
    }

    // Crear arreglo resultado con fecha completa y promedio de humedad
    const resultado = Array.from(map.entries()).map(([key, val]) => ({
      fechaRegistro: new Date(key + ':00Z'),
      humedadPromedio: val.suma / val.count,
    }));

    res.json(resultado);
  } catch (error) {
    console.error('Error en /humedadpromedio:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// NUEVO ENDPOINT: configuración de notificaciones por ID
app.get('/Configuracion/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const config = await Configuracion.findOne({ _id: id });
    if (!config) return res.status(404).json({ error: 'Configuración no encontrada' });
    res.json(config);
  } catch (error) {
    console.error('Error en /Configuracion/:id:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.put('/Configuracion/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { tempMin, tempMax, humedadMin, humedadMax } = req.body;

    // Validar datos (opcional, puedes hacer validación aquí o en frontend)
    if (
      typeof tempMin !== 'number' || typeof tempMax !== 'number' ||
      typeof humedadMin !== 'number' || typeof humedadMax !== 'number'
    ) {
      return res.status(400).json({ error: 'Datos inválidos o incompletos' });
    }

    const updatedConfig = await Configuracion.findOneAndUpdate(
      { _id: id },
      { tempMin, tempMax, humedadMin, humedadMax },
      { new: true }
    );

    if (!updatedConfig) return res.status(404).json({ error: 'Configuración no encontrada para actualizar' });

    res.json(updatedConfig);
  } catch (error) {
    console.error('Error en PUT /Configuracion/:id:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


// GET todas las alertas tyuijhgfdssertyj
app.get('/alertas/fecha', async (req, res) => {
  const fecha = req.query.fecha; // debe venir en formato "YYYY-MM-DD"

  if (!fecha) {
    return res.status(400).json({ error: 'Falta el parámetro de fecha' });
  }

  const inicioDia = new Date(`${fecha}T00:00:00.000Z`);
  const finDia = new Date(`${fecha}T23:59:59.999Z`);

  try {
    const alertas = await Alerta.find({
      fechaHora: { $gte: inicioDia, $lte: finDia }
    });

    const activaciones = await AlertasComponentes.find({
      fechaRegistro: { $gte: inicioDia, $lte: finDia }
    });

    res.json({ alertas, activaciones });
  } catch (error) {
    console.error('❌ Error al obtener alertas por fecha:', error);
    res.status(500).json({ error: 'Error al obtener alertas por fecha' });
  }
});
app.get('/componentes', async (req, res) => {
  try {
    const componentes = await Componente.find({}, { _id: 1, nombreComponente: 1 });
    res.json(componentes);
  } catch (error) {
    console.error('Error al obtener componentes:', error);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});



// PUT actualizar teléfono (igual que antes)
app.put('/usuario/:id/telefono', async (req, res) => {
  const { id } = req.params;
  const { numTel } = req.body;

  if (!numTel || numTel.trim() === '') {
    return res.status(400).json({ error: 'Número de teléfono es obligatorio' });
  }

  try {
    const usuario = await Usuario.findByIdAndUpdate(id, { numTel: numTel.trim() }, { new: true });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ mensaje: 'Número de teléfono actualizado' });
  } catch (error) {
    console.error('Error al actualizar teléfono:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


module.exports = {
  Usuario,
  Rol,
  Alerta,
  InfoIncubadora,
  HistorialTemp,
  HistorialHum,
  Larva,
  Configuracion,
  Componente,
  AlertasComponentes
}


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});



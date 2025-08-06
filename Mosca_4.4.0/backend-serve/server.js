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
  .catch(err => console.error('NOO Error, no se conecto a MongoDB :(  Error:', err));

// -- NUEVOS MODELOS ACTUALIZADOS  lognotfs

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
    // Obtener la información de la incubadora
    const info = await InfoIncubadora.findOne({ _id: 1 });

    if (!info || !Array.isArray(info.idComponentes)) {
      return res.status(404).json({ error: 'No se encontró la info de incubadora o idComponentes no es válido' });
    }

    const componentes = await Componente.find({ _id: { $in: info.idComponentes } });

    // Normalizar para comparar los nombres
    const normalizar = (str) =>
      str.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

    const getEstado = (nombreOriginal) => {
      const nombreNorm = normalizar(nombreOriginal);
      const comp = componentes.find(c => normalizar(c.nombreComponente) === nombreNorm);
      return comp ? comp.estado : false;
    };

    // Obtener las últimas temperaturas de los sensores 1 y 2
    const temperaturaSensor1 = await HistorialTemp.findOne({ idComponente: 1 })
      .sort({ fechaRegistro: -1 })  // Última temperatura registrada
      .select('temperatura')
      .lean();

    const temperaturaSensor2 = await HistorialTemp.findOne({ idComponente: 2 })
      .sort({ fechaRegistro: -1 })  // Última temperatura registrada
      .select('temperatura')
      .lean();

    // Si no hay datos de los sensores, asignar temperaturas por defecto
    const temp1 = temperaturaSensor1 ? temperaturaSensor1.temperatura : info.temperActual;
    const temp2 = temperaturaSensor2 ? temperaturaSensor2.temperatura : info.temperActual;

    // Calcular el promedio de temperatura
    const temperaturaPromedio = (temp1 + temp2) / 2;

    // Responder con los datos calculados
    res.json({
      temperActual: info.temperActual,
      humedActual: info.humedActual,

      temperaturaSensor1: temp1,
      temperaturaSensor2: temp2,
      temperaturaPromedio: temperaturaPromedio,

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
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ mensaje: 'ID inválido' });
    }

    // Opcional: filtrar componentes según incubadora id
    // Por ejemplo, si tienes referencia en componentes a incubadora:
    // const componentes = await Componente.find({ incubadoraId: id });

    // Pero si quieres todos los componentes sin filtro:
    const componentes = await Componente.find({});

    const resultado = {};
    for (const comp of componentes) {
      const key = `${comp.tipo}_${comp.nombreComponente.toLowerCase().replace(/\s+/g, '')}_${comp._id}`;
      resultado[key] = {
        id: comp._id,
        nombre: comp.nombreComponente,
        estado: comp.estado
      };
    }

    // Enviar respuesta JSON
    res.json(resultado);

  } catch (error) {
    console.error("Error al obtener los componentes:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.put('/componentes/estado/:idComponente', async (req, res) => {
  const idComponente = parseInt(req.params.idComponente);
  const { estado, idInfoIncubadora, fechaRegistro } = req.body; // Recibir fechaRegistro

  try {
    const componente = await Componente.findOne({ _id: idComponente });
    if (!componente) {
      return res.status(404).json({ mensaje: 'Componente no encontrado' });
    }

    const estadoAnterior = componente.estado;
    componente.estado = estado;
    await componente.save();

    if (estado === true && estadoAnterior === false) {
      // Usar la fecha enviada desde el frontend o crear una nueva si no se envió
      const fechaParaGuardar = fechaRegistro ? new Date(fechaRegistro) : new Date();
      
      await AlertasComponentes.create({
        fechaRegistro: fechaParaGuardar,
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

// Endpoint para temperatura promedio por minuto

app.get('/lecturaspromedio', async (req, res) => {
  try {
    const fecha = req.query.fecha;
    const hora = req.query.hora;  // Parámetro hora

    if (!fecha || !hora) return res.status(400).json({ error: 'Faltan parámetros fecha (YYYY-MM-DD) o hora (HH:mm)' });

    // Parsear la fecha y hora
    const [y, m, d] = fecha.split('-').map(Number);
    const [h, min] = hora.split(':').map(Number);

    // Establecer el inicio de la hora (00:00) y fin de la hora (00:59)
    const inicio = new Date(Date.UTC(y, m - 1, d, h, 0, 0));  // Inicio de la hora
    const fin = new Date(Date.UTC(y, m - 1, d, h, 59, 59, 999)); // Fin de la hora

    // Consultar todos los registros de temperatura para esa hora
    const lecturas = await HistorialTemp.find({
      fechaRegistro: { $gte: inicio, $lte: fin },
    }).sort({ fechaRegistro: 1 });

    if (lecturas.length === 0) return res.status(404).json({ message: 'No se encontraron lecturas para esta hora' });

    res.json(lecturas); // Devuelve todos los registros para esa hora completa

  } catch (error) {
    console.error('Error en /lecturaspromedio:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/humedadpromedio', async (req, res) => {
  try {
    const fecha = req.query.fecha;
    const hora = req.query.hora;  // Parámetro hora

    if (!fecha || !hora) return res.status(400).json({ error: 'Faltan parámetros fecha (YYYY-MM-DD) o hora (HH:mm)' });

    // Parsear la fecha y hora
    const [y, m, d] = fecha.split('-').map(Number);
    const [h, min] = hora.split(':').map(Number);

    // Establecer el inicio de la hora (00:00) y fin de la hora (00:59)
    const inicio = new Date(Date.UTC(y, m - 1, d, h, 0, 0));  // Inicio de la hora
    const fin = new Date(Date.UTC(y, m - 1, d, h, 59, 59, 999)); // Fin de la hora

    // Consultar todos los registros de humedad para esa hora
    const lecturas = await HistorialHum.find({
      fechaRegistro: { $gte: inicio, $lte: fin },
    }).sort({ fechaRegistro: 1 });

    if (lecturas.length === 0) return res.status(404).json({ message: 'No se encontraron lecturas para esta hora' });

    res.json(lecturas); // Devuelve todos los registros para esa hora completa

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


// ENDPOINT SIMPLE - DEVUELVE TODO TAL COMO ESTÁ EN LA BD
app.get('/alertas/fecha', async (req, res) => {
  const fecha = req.query.fecha; // formato "YYYY-MM-DD"
  
  if (!fecha) {
    return res.status(400).json({ error: 'Falta el parámetro de fecha' });
  }

  try {
    // Crear rango de fechas UTC simple
    const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
    const fechaFin = new Date(fecha + 'T23:59:59.999Z');

    // Consultar BD y devolver TAL COMO ESTÁ
    const alertas = await Alerta.find({
      fechaHora: { $gte: fechaInicio, $lte: fechaFin }
    }).lean(); // .lean() devuelve objetos JavaScript planos

    const activaciones = await AlertasComponentes.find({
      fechaRegistro: { $gte: fechaInicio, $lte: fechaFin }
    }).lean(); // .lean() devuelve objetos JavaScript planos
    // DEVOLVER EXACTAMENTE COMO ESTÁ EN LA BD
    res.json({
      fecha: fecha,
      alertas: alertas,        // Sin modificaciones
      activaciones: activaciones,  // Sin modificaciones
      total: {
        alertas: alertas.length,
        activaciones: activaciones.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// ENDPOINT PARA OBTENER TODAS LAS ALERTAS (SIN FILTRO DE FECHA)
app.get('/alertas/todas', async (req, res) => {
  try {
    const alertas = await Alerta.find({}).lean();
    const activaciones = await AlertasComponentes.find({}).lean();
    res.json({
      alertas: alertas,
      activaciones: activaciones,
      total: {
        alertas: alertas.length,
        activaciones: activaciones.length
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener todas las alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
});

// ENDPOINT PARA VER ESTRUCTURA RAW DE UN DOCUMENTO
app.get('/alertas/debug/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Buscar en ambas colecciones
    const alerta = await Alerta.findById(id).lean();
    const activacion = await AlertasComponentes.findById(id).lean();

    if (alerta) {
      console.log('🔍 Alerta encontrada:', JSON.stringify(alerta, null, 2));
      res.json({ tipo: 'alerta', data: alerta });
    } else if (activacion) {
      console.log('🔍 Activación encontrada:', JSON.stringify(activacion, null, 2));
      res.json({ tipo: 'activacion', data: activacion });
    } else {
      res.status(404).json({ error: 'Documento no encontrado' });
    }

  } catch (error) {
    console.error('❌ Error en debug:', error);
    res.status(500).json({ error: 'Error en debug' });
  }
});

// ENDPOINT PARA COMPONENTES - CONSULTA LA TABLA REAL
app.get('/componentes', async (req, res) => {
  try {
    
    // Consultar la tabla real de componentes
    const componentes = await Componente.find({}).lean();
    
    // Devolver exactamente como están en la BD
    res.json(componentes);
    
  } catch (error) {
    console.error('❌ Error al consultar tabla COMPONENTES:', error);
    
    // Si hay error con la BD, devolver datos de respaldo
    console.log('⚠️ Usando datos de respaldo...');
    const componentesRespaldo = [
      { _id: 1, nombreComponente: "sensorDHT11 A", tipo: "sensor", estado: true },
      { _id: 2, nombreComponente: "sensorDHT11 B", tipo: "sensor", estado: true },
      { _id: 3, nombreComponente: "humificador", tipo: "actuador", estado: false },
      { _id: 4, nombreComponente: "ventilador", tipo: "actuador", estado: true },
      { _id: 5, nombreComponente: "calefactor", tipo: "actuador", estado: false }
    ];
    
    res.json(componentesRespaldo);
  }
});

// ENDPOINT ADICIONAL: Ver todos los componentes con detalles
app.get('/componentes/debug', async (req, res) => {
  try {
    const componentes = await Componente.find({}).lean();
    
    res.json({
      total: componentes.length,
      componentes: componentes,
      estructura: componentes.length > 0 ? Object.keys(componentes[0]) : [],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error en debug de componentes:', error);
    res.status(500).json({ error: 'Error al obtener componentes para debug' });
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

// Ruta para actualizar la contraseña sin hashing
app.put('/usuario/:id/contrasena', async (req, res) => {
  const { id } = req.params;
  const { contrasenaActual, contrasenaNueva } = req.body;

  // Verificar que las contraseñas no estén vacías
  if (!contrasenaActual || !contrasenaNueva) {
    return res.status(400).json({ error: 'Las contraseñas son obligatorias' });
  }

  try {
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que la contraseña actual coincida con la almacenada
    if (usuario.contrasena !== contrasenaActual) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Actualizar la contraseña en la base de datos
    usuario.contrasena = contrasenaNueva;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


/*
----------------------------------------------------
        ENDPOINTS PARA LA INCUVADORA
----------------------------------------------------
*/

app.get('/incubadoraiot/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ mensaje: 'ID inválido' });
    }

    // Traer todos los componentes (puedes agregar filtro por incubadora si luego lo necesitas)
    const componentes = await Componente.find({});

    const resultado = {
      estVentilador: false,
      estCalefactor: false,
      estHumidificador: false
    };

    for (const comp of componentes) {
      if (comp.tipo === 'actuador') {
        const nombre = comp.nombreComponente.toLowerCase().replace(/\s+/g, '');

        if (nombre.includes('ventilador')) {
          resultado.estVentilador = comp.estado;
        } else if (nombre.includes('calefactor')) {
          resultado.estCalefactor = comp.estado;
        } else if (nombre.includes('humificador') || nombre.includes('humidificador')) {
          resultado.estHumidificador = comp.estado;
        }
      }
    }

    res.json(resultado);

  } catch (error) {
    console.error("Error al obtener los componentes:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

/* 
  Método: GET
  URL para probarlo: 
  http://172.18.2.213:3000/incubadoraiot/1

  ¿QUÉ HACE ESTE ENDPOINT?
  Este endpoint consulta el estado de los **actuadores** (ventilador, calefactor y humificador) asociados a la incubadora.

  RESPUESTA QUE DEVUELVE (JSON):
  {
    "estVentilador": true,
    "estCalefactor": false,
    "estHumidificador": true
  }
*/

app.post('/api/registro/sensores', async (req, res) => {
  try {
    const {
      fecha,
      temperatura1,
      humedad1,
      temperatura2,
      humedad2
    } = req.body;

    const idInfoIncubadora = 1; // Por defecto

    // Validar y convertir la fecha
    if (!fecha || isNaN(Date.parse(fecha))) {
      return res.status(400).json({ error: 'Formato de fecha inválido. Usa formato ISO: YYYY-MM-DDTHH:mm:ss.sssZ' });
    }

    // Normalizar a UTC (opcional)
    const fechaRegistro = new Date(fecha); // Acepta '2025-08-04T19:08:00.000+00:00'

    const documentosTemp = [
      {
        _id: new mongoose.Types.ObjectId(),
        fechaRegistro,
        temperatura: temperatura1,
        idInfoIncubadora,
        idComponente: 1
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fechaRegistro,
        temperatura: temperatura2,
        idComponente: 2
      }
    ];

    const documentosHum = [
      {
        _id: new mongoose.Types.ObjectId(),
        fechaRegistro,
        humedad: humedad1,
        idComponente: 1
      },
      {
        _id: new mongoose.Types.ObjectId(),
        fechaRegistro,
        humedad: humedad2,
        idComponente: 2
      }
    ];

    await HistorialTemp.insertMany(documentosTemp);
    await HistorialHum.insertMany(documentosHum);

    res.status(200).json({ message: 'Datos insertados correctamente' });
  } catch (error) {
    console.error('Error al insertar datos:', error);
    res.status(500).json({ error: 'Error al insertar datos' });
  }
});

/* 
 Método: POST
 URL para probarlo: 
 http://172.18.2.213:3000/api/registro/sensores
   CÓMO SE DEBE ENVIAR EL BODY (JSON):
{
  "fecha": "2025-08-04T19:08:00.000+00:00",
  "temperatura1": 28.5,
  "humedad1": 78,
  "temperatura2": 29.1,
  "humedad2": 80
}

  ¿QUÉ HACE ESTE ENDPOINT?
    Inserta CUATRO registros en la base de datos:
  🔹 Dos en la colección HISTORIALTEMP:
      - Uno para el componente 1 (sensor 1) con temperatura1
      - Otro para el componente 2 (sensor 2) con temperatura2
  🔹 Dos en la colección HISTORIALHUM:
      - Uno para el componente 1 (sensor 1) con humedad1
      - Otro para el componente 2 (sensor 2) con humedad2

*/

app.post('/api/registro/oit', async (req, res) => {
  try {
    const {
      temperatura1,
      temperatura2,
      humedad1,
      humedad2
    } = req.body;

    const idInfoIncubadora = 1; // fijo

    // Buscar la configuración de rangos para esta incubadora
    const config = await Configuracion.findOne({ idInfoIncubadora });
    if (!config) return res.status(404).json({ error: 'Configuración no encontrada' });

    const fechaHora = new Date();
    const alertas = [];

    // Validar temperaturas
    const validarTemp = (valor, idComponente) => {
      if (valor < config.tempMin) {
        alertas.push({
          _id: new mongoose.Types.ObjectId(),
          fechaHora,
          tipo: 'temperatura',
          valor,
          umbral: config.tempMin,
          condicion: 'menor',
          idComponente,
          idInfoIncubadora
        });
      } else if (valor > config.tempMax) {
        alertas.push({
          _id: new mongoose.Types.ObjectId(),
          fechaHora,
          tipo: 'temperatura',
          valor,
          umbral: config.tempMax,
          condicion: 'mayor',
          idComponente,
          idInfoIncubadora
        });
      }
    };

    // Validar humedades
    const validarHum = (valor, idComponente) => {
      if (valor < config.humedadMin) {
        alertas.push({
          _id: new mongoose.Types.ObjectId(),
          fechaHora,
          tipo: 'humedad',
          valor,
          umbral: config.humedadMin,
          condicion: 'menor',
          idComponente,
          idInfoIncubadora
        });
      } else if (valor > config.humedadMax) {
        alertas.push({
          _id: new mongoose.Types.ObjectId(),
          fechaHora,
          tipo: 'humedad',
          valor,
          umbral: config.humedadMax,
          condicion: 'mayor',
          idComponente,
          idInfoIncubadora
        });
      }
    };

    // Aplicar validaciones
    validarTemp(temperatura1, 1);
    validarTemp(temperatura2, 2);
    validarHum(humedad1, 1);
    validarHum(humedad2, 2);

    // Insertar todas las alertas encontradas
    if (alertas.length > 0) {
      await Alerta.insertMany(alertas);
    }

    res.status(200).json({
      message: 'Datos procesados correctamente',
      alertasGeneradas: alertas.length
    });

  } catch (error) {
    console.error('Error en /api/registro/oit:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});
/* 
  Método: POST
  URL para probarlo: 
  http://172.18.2.213:3000/api/registro/oit
  
  CÓMO SE DEBE ENVIAR EL BODY (JSON):
  {
    "temperatura1": 29,
    "temperatura2": 28,
    "humedad1": 60,
    "humedad2": 80
  }
  
  ¿QUÉ HACE ESTE ENDPOINT?
  Este endpoint valida los valores de temperatura y humedad enviados y, en caso de que alguno de los valores esté fuera de los rangos definidos en la configuración de la incubadora (colección CONFIGNOTF), inserta un registro en la colección LOGNOTF. Los pasos son los siguientes:
  
  🔹 **Valida temperatura y humedad** de ambos sensores (componente 1 y componente 2).
  
  🔹 Si la **temperatura1** o **temperatura2** está fuera del rango permitido (temperatura entre 27 y 30):
    - Se genera una alerta de tipo **"temperatura"** en **LOGNOTF** si la temperatura es mayor o menor que el rango definido.
  
  🔹 Si la **humedad1** o **humedad2** está fuera del rango permitido (humedad entre 70 y 90):
    - Se genera una alerta de tipo **"humedad"** en **LOGNOTF** si la humedad es mayor o menor que el rango definido.
  
  🔹 **ID de componente**:
    - Si el valor es de **temperatura1** o **humedad1**, se asigna **componente 1**.
    - Si el valor es de **temperatura2** o **humedad2**, se asigna **componente 2**.

*/

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



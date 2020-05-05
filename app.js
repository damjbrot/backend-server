// Requires - Importación de librerías 
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')

// Inicialización de variables 
var app = express(); // Creación del servidor de Express

// Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var hospitalRoutes = require('./routes/hospital');
var medicoRoutes = require('./routes/medico');
var loginRoutes = require('./routes/login');
var busquedaRoutes = require('./routes/busqueda');
var uploadRoutes = require('./routes/upload');
var imgRoutes = require('./routes/img');
 
// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017 /hospitalDB', {useNewUrlParser: true})
    .then( () => console.log('Base de datos \x1b[32m%s\x1b[0m','online'))
    .catch ( error => console.error('ERROR: ', error));

// // Serve-index - Despliega un sistema de ficheros para poder acceder a las imágenes
// // que hemos subido a nuestro servidor. Para ello tenemos que abrir el localhost en el puerto
// // pertinente al levantar nuestro servidor y, al colocar la url adecuada,tendremos acceso a los ficheros
// var serveIndex = require('serve-index');
// app.use(express.static(_dirname + '/'));
// app.use('/uploads', serveIndex(_dirname+'/uploads'));

// Middleware
app.use('/', appRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imgRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('App.js escuchando en el puerto \x1b[32m%s\x1b[0m','online');
});

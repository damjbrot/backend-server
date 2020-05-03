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
var loginRoutes = require('./routes/login');
 
// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017 /hospitalDB', {useNewUrlParser: true})
    .then( () => console.log('Base de datos \x1b[32m%s\x1b[0m','online'))
    .catch ( error => console.error('ERROR: ', error));

// Middleware
app.use('/',appRoutes);
app.use('/usuario',usuarioRoutes);
app.use('/login',loginRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('App.js escuchando en el puerto \x1b[32m%s\x1b[0m','online');
});

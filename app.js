// Requires - Importación de librerías 
var express = require('express');
var mongoose = require('mongoose');

// Inicialización de variables 

// Creación del servidor de Express
var app = express();

// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/hospitaldb', {useNewUrlParser: true})
    .then( () => console.log('Base de datos \x1b[32m%s\x1b[0m','online'))
    .catch ( error => console.error('ERROR: ', error));

// Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('App.js escuchando en el puerto \x1b[32m%s\x1b[0m','online');
});

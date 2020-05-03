const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

const Usuario = require('../models/usuario');

// Creación del servidor de Express
const app = express();

app.post('/', (req, res, next) => {

    var body = req.body;

    // Verificación de que existe usuario con ese correo
    Usuario.findOne({ email: body.email }, (error, usuario) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                errors: { message: 'No se ha encontrado el usuario con email: ' + body.email }
            });
        }

        if (!bcrypt.compareSync(body.password, usuario.password)) {
            return res.status(400).json({
                ok: false,
                errors: { message: 'La contraseña es incorrecta'}
            });
        }

        // Creamos un token
        usuario.password = 'hidden'; // para no mandar la contraseña en el token
        const token = jwt.sign({usuario: usuario}, SEED, {expiresIn: 14400}) // 4h

        res.status(200).json({
            ok: true,
            token,
            usuario
        });

    });
});


module.exports = app;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

const Usuario = require('../models/usuario');

// Autenticación de Google
const { OAuth2Client } = require('google-auth-library');
const CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

// Creación del servidor de Express
const app = express();

/**
 * Autenticación de Google
 */
app.post('/google', async (req, res, next) => {

    let token = req.body.token;

    var googleUser = await verify(token)
        .catch(error => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token de Google no valido',
                error
            });
        });

    Usuario.findOne({ email: googleUser.email }, (error, usuario) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                error
            });
        }

        if (usuario) {
            // El usuario existe
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe utilizar su autenticación normal',
                    error
                });
            } else {
                // Creamos un token
                usuario.password = 'hidden'; // para no mandar la contraseña en el token
                const token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }) // 4h

                res.status(200).json({
                    ok: true,
                    token,
                    usuario
                });
            }
        } else {
            // Si no existe el usuario
            let usuario = new Usuario();


            usuario.nombre = googleUser.nombre,
            usuario.email = googleUser.email,
            usuario.password = 'contraseñagoogle',
            usuario.img = googleUser.img,
            usuario.google = true


            usuario.save((error, usuarioGuardado) => {

                if (error) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: error
                    })
                }

                const token = jwt.sign({ usuario: usuarioGuardado }, SEED, { expiresIn: 14400 }) // 4h

                // 201: Recurso creado
                res.status(201).json({
                    ok: true,
                    usuarioGuardado,
                    token
                });

            });
        }
    });

});

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });

    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

/**
 * Autenticación normal
 */
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
                errors: { message: 'La contraseña es incorrecta' }
            });
        }

        // Creamos un token
        usuario.password = 'hidden'; // para no mandar la contraseña en el token
        const token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 }) // 4h

        res.status(200).json({
            ok: true,
            token,
            usuario
        });

    });
});


module.exports = app;

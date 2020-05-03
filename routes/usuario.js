var express = require('express');
const bcrypt = require('bcrypt');
const mdAutenticacion = require('../middlewares/autenticacion');

var Usuario = require('../models/usuario');

// Creación del servidor de Express
var app = express();

/**
 * * Devuelve un listado con todos los usuarios que se han creado
 */
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre email img role')
        .exec((error, usuarios) => {

            if (error) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: error
                })
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            })
        })
});

/**
 * * Creación de un nuevo usuario en base de datos. 
 * Los campos con la información del usuario se pasan en el cuerpo de 
 * la petición en formato x-www-form-urlencoded
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: error
            })
        }
        // 201: Recurso creado
        res.status(201).json({
            ok: true,
            usuarioGuardado,
            usuarioToken: req.usuario
        });

    })
});

/**
 * * Actualización de la información de un usuario
 * El usuario a modificar se obtiene de la ruta
 */
app.put('/:userId', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.userId;
    var body = req.body;

    Usuario.findById(id, (error, usuario) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado el usuario con id: ' + id,
                errors: { message: 'No se ha encontrado el usuario con id: ' + id }
            });
        }

        // Actualizamos el usuario 
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioActualizado) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                })
            }

            usuarioActualizado.password = 'hidden';
            // 200: Realizado con éxito
            res.status(200).json({
                ok: true,
                usuarioActualizado
            });
        });
    });
});

/**
 * * Borrar un usuario
 * El usuario a modificar se obtiene de la ruta
 */
app.delete('/:userId', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.userId;

    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }
        res.status(200).json({
            ok: true,
            usuarioBorrado
        });
    });
});

module.exports = app;

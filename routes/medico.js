// Imports
const express = require('express');
const mdAutenticacion = require('../middlewares/autenticacion');

// Models
var Medico = require('../models/medico');

// Express
const app = express();

/**
 * * Devuelve un listado con todos los medicos que se han creado
 */
app.get('/', (req, res, next) => {

    const desde = Number(req.query.desde) || 0;

    Medico.find({}, (error, medicos) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargando listado de médicos',
                error
            });
        }

        Medico.count({}, (error, conteo) => {

            if (error) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error contando el total de médicos',
                    error
                });
            }

            res.status(200).json({
                ok: true,
                medicos,
                totalMedicos: conteo
            });
        });

    }).populate('usuario', 'nombre email')
    .populate('hospital')
    .limit(5)
    .skip(desde);
});

/**
 * * Creación de un nuevo médico en base de datos. 
 * Los campos con la información del médico se pasan en el cuerpo de 
 * la petición en formato x-www-form-urlencoded
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    const body = req.body;
    const usuarioId = req.usuario; // usuario autenticado 

    const newMedico = new Medico ({
        nombre: body.nombre,
        img: body.img,
        hospital : body.hospital,
        usuario: usuarioId
    });

    newMedico.save( (error, medicoGuardado) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error añadiendo nuevo médico',
                error
            });
        }

        res.status(200).json({
            ok: true,
            medicoGuardado
        })
    })
});

/**
 * * Actualización de la información de un médico
 * El médico a modificar se obtiene de la ruta
 */
app.put('/:medicoId', mdAutenticacion.verificaToken, (req, res, next) => {

    const medicoId = req.params.medicoId;
    const body = req.body; 

    Medico.findById(medicoId, (error, medico) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: error
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado el médico con id: ' + medicoId,
                errors: { message: 'No se ha encontrado el médico con id: ' + medicoId }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital ? body.hospital : medico.hospital;

        medico.save((error, medicoActualizado) =>{
      
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: error
                })
            }

            // 200: Realizado con éxito
            res.status(200).json({
                ok: true,
                medicoActualizado
            });
        });
        
    });

});

/**
 * * Borrar un médico
 * El médico a modificar se obtiene de la ruta
 */
app.delete('/:medicoId', mdAutenticacion.verificaToken, (req, res, next) => {

    const medicoId = req.params.medicoId;

    Medico.findByIdAndRemove(medicoId, (error, medicoBorrado) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error añadiendo nuevo médico',
                error
            });
        }

        res.status(200).json({
            ok: true,
            medicoBorrado
        })
    });
});

module.exports = app;
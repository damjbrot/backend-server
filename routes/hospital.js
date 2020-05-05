// Imports
const express = require('express');
const mdAutenticacion = require('../middlewares/autenticacion');

// Models
var Hospital = require('../models/hospital');

// Express
const app = express();

//Routes

/**
 * * Devuelve un listado con todos los hospitales que se han creado
 */
app.get('/', (req, res, next) => {

    const desde = Number(req.query.desde) || 0; // paginación

    Hospital.find({}, (error, hospitales) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error cargando listado de hospitales',
                error
            });
        }

        Hospital.count({}, (error, conteo) => {

            if (error) {
                res.status(500).json({
                    ok: false,
                    mensaje: 'Error contando total de hospitales',
                    error
                });
            }

            res.status(200).json({
                ok: true,
                hospitales,
                totalHospitales: conteo
            });
        });

    }).populate('usuario', 'nombre email')
      .limit(5)
      .skip(desde);
});

/**
 * * Creación de un nuevo hospital en base de datos. 
 * Los campos con la información del hospital se pasan en el cuerpo de 
 * la petición en formato x-www-form-urlencoded
 */
app.post('/', mdAutenticacion.verificaToken, (req, res, next) => {

    const body = req.body;
    const usuarioId = req.usuario; // usuario autenticado 

    const newHospital = new Hospital ({
        nombre: body.nombre,
        img: body.img,
        usuario: usuarioId
    });

    newHospital.save( (error, hospitalGuardado) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error añadiendo nuevo hospital',
                error
            });
        }

        res.status(200).json({
            ok: true,
            hospitalGuardado
        })
    })
});

/**
 * * Actualización de la información de un hospital
 * El hospital a modificar se obtiene de la ruta
 */
app.put('/:hospitalId', mdAutenticacion.verificaToken, (req, res, next) => {

    const hospitalId = req.params.hospitalId;
    const body = req.body; 

    Hospital.findById(hospitalId, (error, hospital) => {

        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: error
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No se ha encontrado el hospital con id: ' + hospitalId,
                errors: { message: 'No se ha encontrado el hospital con id: ' + hospitalId }
            });
        }

        hospital.nombre = body.nombre;

        hospital.save((error, hospitalActualizado) =>{
      
            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: error
                })
            }

            // 200: Realizado con éxito
            res.status(200).json({
                ok: true,
                hospitalActualizado
            });
        });
        
    });

});

/**
 * * Borrar un hospital
 * El hospital a modificar se obtiene de la ruta
 */
app.delete('/:hospitalId', mdAutenticacion.verificaToken, (req, res, next) => {

    const hospitalId = req.params.hospitalId;

    Hospital.findByIdAndRemove(hospitalId, (error, hospitalBorrado) => {

        if (error) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error añadiendo nuevo hospital',
                error
            });
        }

        res.status(200).json({
            ok: true,
            hospitalBorrado
        })
    });
});

module.exports = app;
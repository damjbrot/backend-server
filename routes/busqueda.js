const express = require('express');
const mongoose = require('mongoose');

// Modelos
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

// Creación del servidor de Express
var app = express();

/**
 * * Búsqueda general
 */
app.get('/all/:busqueda', (req, res, next) => {

    const busqueda = req.params.busqueda;
    const regExp = new RegExp(busqueda, 'i')

    Promise.all([
        buscarHospitales(busqueda, regExp),
        buscarMedicos(busqueda, regExp),
        buscarUsuarios(busqueda, regExp)])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2],
            });
        })
        .catch(errores => {
            res.status(500).json({
                ok: false,
                errores
            });
        })
});

/**
 * * Búsqueda por colección
 */
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regExp = new RegExp(busqueda, 'i')

    let promesa;

    switch (tabla) {
        case 'usuario':
            promesa = buscarUsuarios(busqueda, regExp)
            break;

        case 'medico':
            promesa = buscarMedicos(busqueda, regExp)
            break;

        case 'hospital':
            promesa = buscarHospitales(busqueda, regExp)
            break;

        default:
            // Paramos la ejecución con un mensaje de error
            return res.status(500).json({
                ok: false,
                mensaje: 'No existe una colección con ese nombre. Pruebe con hospital, usuario u hospital'
            })
    }

    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })
        .catch(error => {
            res.status(500).json({
                ok: false,
                mensaje: 'Error en la búsqueda',
                error
            });
        });

});

/**
 * Busca en la colección de hospitales la expresión regular pasada
 * @param {*} busqueda Término de búsqueda
 * @param {*} regExp Expresión regular de búsqueda
 */
function buscarHospitales(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regExp }, (error, hospitales) => {

            if (error) {
                reject('Error al encontrar los hospitales', error);
            } else {
                resolve(hospitales);
            }
        }).populate('usuario');
    });
}

/**
 * Busca en la colección de medicos la expresión regular pasada
 * @param {*} busqueda Término de búsqueda
 * @param {*} regExp Expresión regular de búsqueda
 */
function buscarMedicos(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regExp }, (error, medicos) => {

            if (error) {
                reject('Error al encontrar los médicos', error);
            } else {
                resolve(medicos);
            }
        }).populate('usuario')
            .populate('hospital');
    });
}

/**
 * Busca en la colección de usuarios la expresión regular pasada tanto en el 
 * campo nombre como en el email
 * @param {*} busqueda Término de búsqueda
 * @param {*} regExp Expresión regular de búsqueda
 */
function buscarUsuarios(busqueda, regExp) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email img role')
            .or([{ nombre: regExp }, { email: regExp }])
            .exec((error, usuarios) => {

                if (error) {
                    reject('Error al encontrar los usuarios', error);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;
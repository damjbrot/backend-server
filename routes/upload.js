const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs'); // File System de Node

// Creación del servidor de Express
const app = express();

// default options
app.use(fileUpload());

// Modelos
const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

app.put('/:tipo/:id', (req, res, next) => {

    const tipo = req.params.tipo; // usuario, médico u hospital
    const id = req.params.id;

    // Comprobando que el tipo sea de una colección válida:
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no es válida',
            error: { mensaje: 'Pruebe con uno de los siguientes tipos: ' + tiposValidos.join(', ') }
        });
    }

    // Comprobando que hay archivos que cargar
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se ha cargado ninguna imagen.',
            error: { mensaje: 'No se ha cargado ninguna imagen.' }
        });
    }

    // Obteniendo el fichero y su extensión
    // 'imagen' es el nombre que le estamos poniendo a la variable en el body de la petición
    const archivo = req.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    // Comprobando que el archivo sea una imagen
    const extensionesValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La extensión del archivo no es válida',
            error: { mensaje: 'Pruebe con una de las siguientes extensiones: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado para que no se machaquen ficheros
    // 21342442-213321.png (nombre de usuario)-(num aleatorio).(extension)
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Mover el archivo del temporal a un path
    const path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, (error) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error
            });
        }
    });

    asignarImagen(tipo,id,nombreArchivo,res);
});

function asignarImagen(tipo, id, nombreArchivo, res) {

    switch (tipo) {

        case 'usuarios':

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
                // Si existe, elimina la imagen anterior
                const pathViejo = './uploads/usuarios/'+usuario.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (error) => {
                        if (error) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al encontrar el path antiguo',
                                errors: error
                            })
                        }
                    });
                }
                // Actualizamos el usuario 
                usuario.img = nombreArchivo;
                usuario.save((error, usuarioActualizado) => {

                    if (error) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario',
                            errors: error
                        })
                    }

                    usuarioActualizado.password = 'hidden';
                    // Paramos la ejecución con un return
                    return res.status(200).json({
                        ok: true,
                        usuarioActualizado
                    });
                });
            });
            break;

        case 'medicos':

            Medico.findById(id, (error, medico) => {

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
                        mensaje: 'No se ha encontrado el médico con id: ' + id,
                        errors: { message: 'No se ha encontrado el médico con id: ' + id }
                    });
                }
                // Si existe, elimina la imagen anterior
                const pathViejo = './uploads/medicos/'+medico.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (error) => {
                        if (error) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al encontrar el path antiguo',
                                errors: error
                            })
                        }
                    });
                }

                // Actualizamos el médico 
                medico.img = nombreArchivo;
                medico.save((error, medicoActualizado) => {

                    if (error) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar medico',
                            errors: error
                        })
                    }

                    // Paramos la ejecución con un return
                    return res.status(200).json({
                        ok: true,
                        medicoActualizado
                    });
                });
            });

            break;

        case 'hospitales':

            Hospital.findById(id, (error, hospital) => {

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
                        mensaje: 'No se ha encontrado el hospital con id: ' + id,
                        errors: { message: 'No se ha encontrado el hospital con id: ' + id }
                    });
                }
                // Si existe, elimina la imagen anterior
                const pathViejo = './uploads/hospitales/'+hospital.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (error) => {
                        if (error) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al encontrar el path antiguo',
                                errors: error
                            })
                        }
                    });
                }

                // Actualizamos el médico 
                hospital.img = nombreArchivo;
                hospital.save((error, hospitalActualizado) => {

                    if (error) {
                        return res.status(400).json({
                            ok: false,
                            mensaje: 'Error al actualizar hospital',
                            errors: error
                        })
                    }

                    // Paramos la ejecución con un return
                    return res.status(200).json({
                        ok: true,
                        hospitalActualizado
                    });
                });
            });

            break;
    }


   
}

module.exports = app;
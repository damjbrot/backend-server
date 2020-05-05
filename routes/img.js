const express = require('express');
const path = require('path');
const fs = require('fs');

// Creación del servidor de Express
const app = express();

app.get('/:tipo/:img', (req, res, next) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    // Comprobando que el tipo sea de una colección válida:
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'La colección no es válida',
            error: { mensaje: 'Pruebe con uno de los siguientes tipos: ' + tiposValidos.join(', ') }
        });
    }

    const pathImage = path.resolve( __dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImage)){
        res.sendFile( pathImage );
    } else {
        const pathNoImage = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;
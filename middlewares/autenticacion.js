const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

/**
 * *Verificación del token.
 * Todas las peticiones de este punto en adelante necesitarán autenticación para realizarse 
 */
 exports.verificaToken = function(req, res, next){

    // Recibimos el token por URL
    const token = req.query.token;

    jwt.verify(token, SEED, (error, decoded)=>{

        if (error) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: error
            });
        }

        // Colocamos el usuario en el request de las peticiones que utilicen esta función
        req.usuario = decoded.usuario;

        // Damos paso a la petición
        next();
    });
 }

var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

exports.verificaToken = function(req, res, next){
    
    var token = req.query.token;

    jwt.verify(token, SEED, ( error, decoded ) =>{
        if ( error ) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: error    
                }); 
        } 
        // Almacenamos los datos del usuario 
        req.usuario = decoded.usuario;
        next();
    });
    
}
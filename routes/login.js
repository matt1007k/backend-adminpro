var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;

app.post('/', ( req, res )=>{
    var body = req.body;

    Usuario.findOne({email: body.email}, (error, usuarioDB) =>{

        if ( error ){
            return res.status(500).json({
                ok: true,
                mensaje: "Error al buscar el usuario",
                errors: error
            });
        }
        if ( !usuarioDB ){
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - email"
            });
        }
        if ( !bcrypt.compareSync(body.password, usuarioDB.password) ){
            return res.status(400).json({
                ok: false,
                mensaje: "Credenciales incorrectas - password"
            });
        }

        usuarioDB.password = ":C";

        // Generar un token
        var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400 }); // 4 horas

        res.status(200).json({
            ok: true,            
            usuario: usuarioDB,
            token,
            id: usuarioDB._id
        });
    });   
    
});

module.exports = app;
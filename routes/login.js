var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var app = express();

var Usuario = require('../models/usuario');

var SEED = require('../config/config').SEED;

// Google
var GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
var GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verify() {
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


app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: "Token no es válido!!!"               
            });
        });
    Usuario.findOne({email: googleUser.email}, (error, usuarioDB) =>{
        if ( error ){
            return res.status(500).json({
                ok: false,
                mensaje: "Error al buscar el usuario",
                errors: error
            });
        }  

        if ( usuarioDB ) {
            if ( usuarioDB.google === false) {
                return res.status(400).json({
                    ok: true,
                    mensaje: "Debe de usar su autenticación normal"
                });
            }else { 
                // Generar un token
                var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,            
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });
            }
        } else {
            // El usuario no existe tenemos que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';

            usuario.save(( error, usuarioDB ) => {
                // Generar un token
                var token = jwt.sign({ usuario: usuarioDB}, SEED, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,            
                    usuario: usuarioDB,
                    token,
                    id: usuarioDB._id
                });
            });
        }
    });
});

// Login normal
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
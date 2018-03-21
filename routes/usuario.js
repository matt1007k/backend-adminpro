var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

app.get('/',(req, res) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({ }, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((error, usuarios) => {
            if ( error ) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error en la base de datos',
                    errors: error    
                 }); 
            } 

            Usuario.count({}, (error, conteo) =>{
                res.status(200).json({
                    ok: true,
                    usuarios, 
                    total: conteo 
                }); 
            });
                
        });
    
});


app.put('/:id', mdAutenticacion.verificaToken, (req, res) =>{
    var id = req.params.id;
    var body = req.body;

    Usuario.findById( id, (error, usuario) =>{
        if ( error ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errors: error    
            }); 
        } 

        if (!usuario) {            
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+ id + ' no existe',
                errors: {messaje: 'No existe un usuario con ese ID'}   
                });             
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( error, usuarioCreado ) =>{
            if ( error ) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errors: error    
                }); 
            } 
            usuarioCreado.password = ":)";

            res.status(200).json({
                ok: true,
                usuario: usuarioCreado
            });
        });
    });
});



app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioCreado) => {
        if ( error ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el usuario',
                errors: error    
             }); 
        } 
        res.status(201).json({
            ok: true,
            usuario: usuarioCreado,
            tokenUsuario: req.usuario   
        }); 
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, ( req, res )=>{
    var id = req.params.id;
    Usuario.findByIdAndRemove(id, (error, usuarioBorrado )=>{
        if ( error ) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario',
                errors: error    
            }); 
        } 

        if ( !usuarioBorrado ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: {messaje: 'No existe un usuario con ese ID'}   
            }); 
        }
        usuarioBorrado.password = ":)";

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });    
    });
});

module.exports = app;
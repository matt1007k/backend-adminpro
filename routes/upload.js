var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

app.use(fileUpload());

app.put('/:tipo/:id', ( req, res, next ) =>{

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de collection
    var tiposValidos =  ['hospitales', 'medicos','usuarios'];

    if (tiposValidos.indexOf( tipo ) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: {mensaje: 'Tipo de colección no es válida'}
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No hay ninguna imagen',
            errors: {mensaje: 'Debes de seleccionar una imagen'}
        });
    }

    // Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Extensiones válidas
    var extensionValidas = ['jpg','png','gif', 'jpeg'];

    if (extensionValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errors: {mensaje: 'Las extensiones válidas son: '+ extensionValidas.join(', ')}
        });
    }

    // Nombre personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;
    
    archivo.mv(path, error => {
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }

        subirPortTipo(tipo, id, nombreArchivo, res);
    });    
});


function subirPortTipo(tipo, id, nombreArchivo, res){

    if (tipo === 'usuarios') {

        Usuario.findById(id, (error, usuario ) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El usuario no existe',
                    errors: {error: 'El usuario no existe'}
                });
            }

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe, eliminar el archivo viejo
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }

            usuario.img = nombreArchivo;
            usuario.save(( error, usuarioActualizado ) =>{

                usuarioActualizado.password = ':C';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizado',
                    usuario: usuarioActualizado
                });
            });
        });    
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (error, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital no existe',
                    errors: {error: 'El hospital no existe'}
                });
            }

            var pathViejo = './uploads/hospital/' + hospital.img;

            // Si existe, eliminar el archivo viejo
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }

            hospital.img = nombreArchivo;

            hospital.save(( error, hospitalActualizado ) =>{
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizado',
                    hospital: hospitalActualizado
                });
            });
        });
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (error, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El médico no existe',
                    errors: {error: 'El médico no existe'}
                });
            }

            var pathViejo = './uploads/medico/' + medico.img;

            // Si existe, eliminar el archivo viejo
            if ( fs.existsSync( pathViejo ) ) {
                fs.unlink( pathViejo );
            }

            medico.img = nombreArchivo;

            medico.save(( error, medicoActualizado ) =>{
                
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizado',
                    medico: medicoActualizado
                });
            });
        });
    }
    
}

module.exports = app;
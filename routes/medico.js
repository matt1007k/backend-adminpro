var express = require('express');
var mdAuthenticacion = require('../middlewares/autenticacion');
var Medico= require('../models/medico');
var app = express();

app.get('/', ( req, res )=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((error, medicos)=>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en hospitalDB'
            });
        }
        Medico.count({}, (error, conteo) =>{
            res.status(200).json({
                ok: true,
                medicos, 
                total: conteo 
            }); 
        });
    });
});

app.post('/', mdAuthenticacion.verificaToken, (req, res)=>{
    var body = req.body;
        
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((error, medicoGuardado) =>{
        if (error) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se pudo guardar los datos',
                errors: error
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});

app.put('/:id', mdAuthenticacion.verificaToken , (req, res) =>{
    var body = req.body;
    var id = req.params.id;

    Medico.findById(id, ( error, medico ) =>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro al medico',
                errors: error
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id '+ id + ' no existe',
                errors: {messaje: 'No existe un medico con ese ID'} 
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((error, medicoGuardado) =>{

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se pudo actualizar el medico',
                    errors: error
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
        
    });
});

app.delete('/:id', mdAuthenticacion.verificaToken , (req, res )=>{
    var id = req.params.id;

    Medico.findByIdAndRemove(id ,(error, medico ) =>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se pudo eliminar el medico',
                errors: error
            });
        }
        if ( !medico ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: {messaje: 'No existe un medico con ese ID'}   
            }); 
        }
        res.status(200).json({
            ok: true,
            medico: medico
        });
    });
});

module.exports = app;
var express = require('express');
var mdAuthenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');
var app = express();

app.get('/', ( req, res )=>{
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec( (error, hospitales)=>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error en hospitalDB'
            });
        }
         Hospital.count({}, (error, conteo) =>{
            res.status(200).json({
                ok: true,
                hospitales, 
                total: conteo 
            }); 
        });
    });
});

app.post('/', mdAuthenticacion.verificaToken, (req, res)=>{
    var body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((error, hospitalGuardado) =>{
        if (error) {
            return res.status(404).json({
                ok: false,
                mensaje: 'No se pudo guardar los datos',
                errors: error
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

app.put('/:id',mdAuthenticacion.verificaToken, (req, res) =>{
    var body = req.body;
    var id = req.params.id;

    Hospital.findById(id, ( error, hospital ) =>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se encontro al hospital',
                errors: error
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id '+ id + ' no existe',
                errors: {messaje: 'No existe un hospital con ese ID'} 
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;

        hospital.save((error, hospitalGuardado) =>{

            if (error) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No se pudo actualizar el hospital',
                    errors: error
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
        
    });
});

app.delete('/:id', mdAuthenticacion.verificaToken , (req, res )=>{
    var id = req.params.id;

    Hospital.findByIdAndRemove(id ,(error, hospital ) =>{
        if (error) {
            return res.status(500).json({
                ok: false,
                mensaje: 'No se pudo eliminar el hospital',
                errors: error
            });
        }
        if ( !hospital ) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: {messaje: 'No existe un hospital con ese ID'}   
            }); 
        }
        res.status(200).json({
            ok: true,
            hospital: hospital
        });
    });
});

module.exports = app;

var express = require('express');
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

var app = express();

app.get('/coleccion/:tabla/:busqueda', (req, res ) =>{
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;

    var regex =  new RegExp(busqueda, 'i');

    var promesa;
    switch(tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
        break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
        break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
        break;
        default:
            return res.status(200).json({
                ok:false,
                mensaje: 'Los tipos de búsqueda solo son: usuarios, medicos y hospitales',
                errors: { error: 'Tipo de tabla/colección no válido' }
            });
    }
    // Propiedades computadas: Asignar el valor que tenga [tabla]
    promesa.then(data =>{
        res.status(200).json({
            ok:true,
            [tabla]: data
        });
    });

    
               
          
});


app.get('/todo/:busqueda', (req, res ) =>{

    var busqueda  = req.params.busqueda;

    //expresion /texto/i :i busqueda mayusculas y minusculas
    //expresion regular con RegExp
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(resultados =>{
        res.status(200).json({
            ok: true, 
            hospitales: resultados[0],
            medicos: resultados[1],
            usuarios: resultados[2]
        });
    });

    
});

function buscarHospitales(busqueda, regex){
    return new Promise((resolve, reject ) =>{
        Hospital.find({nombre: regex})
        .populate('usuario', 'nombre email')
        .exec(( error, hospitales ) =>{
            if ( error ) {
                reject('Error al cargar hospitales', error);
            } else {
                resolve(hospitales);
            }
        });
    });
}
function buscarMedicos(busqueda, regex){
    return new Promise((resolve, reject ) =>{
        Medico.find({nombre: regex})
        .populate('usuario', 'nombre email')
        .populate('hospital','nombre')
        .exec(( error, medicos ) =>{
            if ( error ) {
                reject('Error al cargar medicos', error);
            } else {
                resolve(medicos);
            }
        });
    });
}
function buscarUsuarios(busqueda, regex){
    return new Promise((resolve, reject ) =>{
        Usuario.find({},'nombre email')
        .or([ { 'nombre': regex },{ 'email': regex } ])
        .exec(( error, usuarios ) =>{
            if ( error ) {
                reject('Error al cargar usuarios', error);
            } else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;
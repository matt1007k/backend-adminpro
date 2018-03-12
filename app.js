var express = require('express');
var mongoose = require('mongoose');
var app = express();

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res) => {
    if ( error ) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','hospitalDB');
});

app.get('/',(req, res) => {
     res.status(200).json({
        ok: true,
        mensaje: 'peticion ok'    
     });   
});

app.listen(3000, () => {
    console.log('Servidor corriendo en: \x1b[33m%s\x1b[0m','http://localhost:3000/');
});
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

var app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, res) => {
    if ( error ) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m','hospitalDB');
});

app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

app.listen(3000, () => {
    console.log('Servidor corriendo en: \x1b[33m%s\x1b[0m','http://localhost:3000/');
});
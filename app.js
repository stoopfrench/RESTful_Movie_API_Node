const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//REQUIRE ROUTES
const titlesRoutes = require('./api/routes/titles');
const genresRoutes = require('./api/routes/genres');

//CORS HANDLING 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
})

//REQUEST ROUTE HANDLERS
app.use('/titles', titlesRoutes);
app.use('/genres', genresRoutes);

//ERROR HANDLING - 404
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

//ALL OTHER ERROR HANDLING
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;
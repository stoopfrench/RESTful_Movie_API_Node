const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//REQUIRE ROUTES
const titlesRoutes = require('./api/routes/titles')
const genreRoutes = require('./api/routes/genre')
const yearRoutes = require('./api/routes/year')

//CONNECT TO MONGO CLIENT
mongoose.connect('mongodb://localhost:27017/movie-database')
mongoose.Promise = global.Promise

//CORS HANDLING 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

//REQUEST ROUTE HANDLERS
app.use('/titles', titlesRoutes)
app.use('/genre', genreRoutes)
app.use('/year', yearRoutes)

//ERROR HANDLING - 404
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
});

//ALL OTHER ERROR HANDLING
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message,
            requests: {
                type: 'GET',
                urls: '/titles, /genre, /year'
            }
        }
    })
})

module.exports = app
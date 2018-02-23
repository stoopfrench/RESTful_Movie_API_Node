const mongoose = require('mongoose')

const movieSchema = mongoose.Schema({
    id: { type: Number, unique: true },
    title: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    genres: { type: String, required: true }
})

module.exports = mongoose.model('Movie', movieSchema)
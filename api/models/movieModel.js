const mongoose = require('mongoose')

let thisYear;
(function() {
    const date = new Date
    thisYear = date.getFullYear()
}())

const movieSchema = mongoose.Schema({
    id: { type: Number },
    title: { type: String, required: true, unique: true },
    year: { type: Number, required: true, min: 1888, max: thisYear },
    genres: { type: String, required: true }
}, {
    timestamps: true
})

module.exports = mongoose.model('Movie', movieSchema)
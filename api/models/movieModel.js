const mongoose = require('mongoose')

let thisYear;
(function() {
    const date = new Date
    thisYear = date.getFullYear()
}())

const movieSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    index: { type: Number },
    title: { type: String, required: true, unique: true },
    year: { type: Number, required: true, min: 1888, max: thisYear },
    genres: { type: String, required: true },
    imported: { type: Date }
}, {
    timestamps: { createdAt: "created", updatedAt: "updated" }
})

module.exports = mongoose.model('Movie', movieSchema)
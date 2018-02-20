const mongoose = require('mongoose')

const movieSchema = mongoose.Schema({
	title: {type: String, required: true, unique: true},
	year: {type: Number, required: true},
	genres: {type: String, required: true},
	id: {type: Number, unique: true}
})

module.exports = mongoose.model('Movie', movieSchema)
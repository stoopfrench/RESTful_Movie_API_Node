const mongoose = require('mongoose');

const modelSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {type: String, required: true}
});

module.exports = mongoose.model('Example', modelSchema);
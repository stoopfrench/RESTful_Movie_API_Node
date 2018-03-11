process.env.SUPPRESS_NO_CONFIG_WARNING = "y"

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const config = require('config')

const mongoose = require('mongoose')

mongoose.connect(config.dbHost)

const date = new Date()
const now = date.toISOString()

exec(`mongoexport --db movie-database --collection movies --type=csv --fields index,title,year,genres --out exportedCSVs/Movies_${now}.csv`)
	.then((stdout) => {
		console.log("==========================================")
		console.log()
		console.log(stdout.stderr)
		console.log()
		console.log("...success")
	})
	.catch(error => {
		console.log(error)
	})
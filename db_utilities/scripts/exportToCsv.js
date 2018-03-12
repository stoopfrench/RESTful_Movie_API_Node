const util = require('util')
const exec = util.promisify(require('child_process').exec)

var tOffset = (new Date()).getTimezoneOffset() * 60000
var now = (new Date(Date.now() - tOffset)).toISOString().slice(0, -5)

exec(`mongoexport --db movie-database --collection movies --type csv --fields index,title,year,genres --out ./db_utilities/csv_files/exported/EXPORTED_movies_${now}.csv`)
    .then((stdout) => {
        console.log("==========================================")
        console.log()
        console.log(stdout.stderr)
        console.log("...success")
        console.log()
        console.log("Files were exported to ./db_utilities/csv_files/exported")

    })
    .catch(error => {
        console.log(error)
    })
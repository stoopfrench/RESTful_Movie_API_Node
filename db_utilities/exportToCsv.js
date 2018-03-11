const util = require('util')
const exec = util.promisify(require('child_process').exec)

const date = new Date()
const now = date.toISOString()

exec(`mongoexport --db movie-database --collection movies --type csv --fields index,title,year,genres --out csv_files/exported/EXPORTED_movies_${now}.csv`)
    .then((stdout) => {
        console.log("==========================================")
        console.log()
        console.log(stdout.stderr)
        console.log("...success")
        console.log()
        console.log("Files were exported to ./csv_files/exported")

    })
    .catch(error => {
        console.log(error)  
    })
const exec = require('child_process').exec
const mongoose = require('mongoose')

const Movie = require('../api/models/movieModel')

mongoose.connect("mongodb://localhost:27017/movie-database")

const dbName = "movie-database"
const collName = "movies"
const csv_file = "Movie-List.csv"

exec(`
    echo;
    echo CLEARING OUT DATABASE;
    echo ============================================================;
    mongo ${dbName} --eval "db.dropDatabase()";
    `,
    (error, stdout, stderr) => {
        if (stdout) {
            console.log(stdout)
        }
        if (stderr) {
            console.log(stderr)
        }
        if (error !== null) {
            console.log(`exec error: ${error}`)
        }
        console.log("...done")
        
        importCSV().then((message) => {
            Movie
                .update({ imported: { $exists: false } }, { $set: { "imported": new Date() } }, { upsert: true, multi: true })
                .exec()
                .then(result => {
                    console.log(result)
                    console.log()
                    console.log("...done")
                    process.exit()
                })
                .catch(err => {
                    console.log(err)
                })
        })
    })


// ===============================================================================================================


function importCSV() {
    return new Promise((resolve, reject) => {
        exec(`
            echo;
            echo IMPORTING CSV AND TRANSFORMING DATABASE;
            echo ============================================================; 
            mongoimport --host=127.0.0.1 -d ${dbName} -c ${collName} --type csv --maintainInsertionOrder --columnsHaveTypes --fields "index.int32(),title.string(),year.int32(),genres.string()" --file ./db_seeder/csv_files/${csv_file};
            echo;
            `,
            (error, stdout, stderr) => {
                if (stdout) {
                    console.log(stdout)
                }
                if (stderr) {
                    console.log(stderr)
                }
                if (error !== null) {
                    console.log(`exec error: ${error}`)
                    reject('not imported')
                }
                resolve()
            })
    })
}
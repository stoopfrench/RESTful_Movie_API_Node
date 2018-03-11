const util = require('util')
const exec = util.promisify(require('child_process').exec)
const config = require('config')
const mongoose = require('mongoose')

const Movie = require('../api/models/movieModel')

mongoose.connect(config.dbHost)

const csv_file = process.argv[2] || "Movie-List.csv"
    if(csv_file.startsWith("EXPORTED")) {
        exec(`
            cp ./db_utilities/csv_files/exported/${csv_file} ./db_utilities/csv_files/${csv_file}
            sed -i '' 1d ./db_utilities/csv_files/${csv_file}
            `)
    }

exec(`
    echo;
    echo DUMPING OLD DATABASE;
    echo ============================================================;
    mongo movie-database --eval "db.dropDatabase()";
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

            console.log(message)
            console.log()

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
            mongoimport --host=127.0.0.1 -d movie-database -c movies --type csv --maintainInsertionOrder --columnsHaveTypes --fields "index.int32(),title.string(),year.int32(),genres.string()" --file ./db_utilities/csv_files/${csv_file};
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
                    reject('failure...no documents were imported')
                }
                resolve('...documents imported successfully!')
            })
    })
}
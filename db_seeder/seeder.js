const exec = require('child_process').exec

exec('mongoimport --host=127.0.0.1 -d movie-database -c movies --type csv --maintainInsertionOrder --columnsHaveTypes --fields "id.int32(),title.string(),year.int32(),genres.string()" --file ./csv_files/Movie-List.csv',
    (error, stdout, stderr) => {
        console.log(stdout)
        console.log(stderr)
        if (error !== null) {
            console.log(`exec error: ${error}`)
        }
    })
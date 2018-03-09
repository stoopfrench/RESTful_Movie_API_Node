const exec = require('child_process').exec

exec('mongoimport --host=127.0.0.1 -d movie-database_TEST -c movies --type csv --file ./csv_files/Movie-List.csv --maintainInsertionOrder --headerline',
        (error, stdout, stderr) => {
            console.log(stdout)
            console.log(stderr)
            if (error !== null) {
                console.log(`exec error: ${error}`)
            }
        })
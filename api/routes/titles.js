const express = require('express');
const router = express.Router();
const fs = require('fs')
const Papa = require('papaparse')

//GET ALL -------------------------------------------------
router.get('/', (req, res, next) => {

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {

        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                res.status(200).send({
                    results: results.data,
                    request: {
                        type: 'GET',
                        url: "/titles/<title>"
                    }
                })
            }
        })
    })
})

//POST NEW MOVIE -------------------------------------------
/*router.post('/',(req, res, next) => {


});*/

// //GET BY ID ----------------------------------------------
router.get('/:title', (req, res, next) => {
    const title = req.params.title
    console.log(title)

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {

        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                const movie = results.data.find((result) => {
                    return result.title === title
                })
                res.status(200).send({
                    results: movie,
                    request: {
                        type: 'GET',
                        url: "/titles"
                    }
                })
            }
        })
    })
})


// //PATCH BY TITLE ---------------------------------------------------
// router.patch('/:id', (req, res, next) => {

// });

// //DELETE BY TITLE --------------------------------------------------
// router.delete('/:id', (req, res, next) => {

// });

module.exports = router;
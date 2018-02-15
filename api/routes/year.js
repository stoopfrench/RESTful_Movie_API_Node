const express = require('express');
const router = express.Router();
const fs = require('fs')
const Papa = require('papaparse')

//GET ALL GENRES ------------------------------------------------------------
router.get('/', (req, res, next) => {

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {
        const years = []
        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                results.data.forEach((movie) => {
                    if (movie.year != null) {
                        years.push(movie.year)
                    }
                })
                const filtered = years.filter((el, i, self) => {
                    return i == self.indexOf(el)
                }).sort((a,b)=> {
                    return a-b
                })

                res.status(200).send({
                    results: filtered,
                    request: {
                        type: "GET",
                        url: "/year/<year>"
                    }
                })
            }
        })
    })
});

//GET BY GENRE --------------------------------------------------------------
router.get('/:year', (req, res, next) => {
    const year = req.params.year
    console.log(year)

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {

        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                const movies = results.data.filter((movie) => {
                    return movie.year === year
                })
                res.status(200).send({
                    results: movies,
                    request: {
                        type: 'GET',
                        url: "/titles"
                    }
                })
            }
        })
    })
})

module.exports = router;
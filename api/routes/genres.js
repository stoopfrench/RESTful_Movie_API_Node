const express = require('express');
const router = express.Router();
const fs = require('fs')
const Papa = require('papaparse')

//GET ALL GENRES ------------------------------------------------------------
router.get('/', (req, res, next) => {

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {
        const genres = []
        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                results.data.forEach((movie) => {
                    if (movie.genres != null) {
                        genres.push(movie.genres)
                    }
                })
                const filtered = genres.filter((el, i, self) => {
                    return i == self.indexOf(el)
                }).sort()

                res.status(200).send({
                    results: filtered,
                    request: {
                        type: "GET",
                        url: "/genres/<genre>"
                    }
                })
            }
        })
    })
});

//GET BY GENRE --------------------------------------------------------------
router.get('/:genre', (req, res, next) => {
    const genre = req.params.genre
    console.log(genre)

    fs.readFile('./api/movie-list/Movie-List.csv', 'UTF-8', (err, csv) => {

        Papa.parse(csv, {
            header: true,
            complete: (results) => {
                const movies = results.data.filter((movie) => {
                    return movie.genres === genre
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
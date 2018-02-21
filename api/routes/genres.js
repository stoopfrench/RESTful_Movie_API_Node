const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port

//GET ALL GENRES -----------------------------------------------------------------
router.get('/', (req, res, next) => {
    const genres = []

    Movie
        .find()
        .exec()
        .then(result => {
            result.forEach(movie => {
                genres.push(movie.genres.split('|'))
            })
            const splitGenres = genres.join(',').split(',')
            const movieCount = splitGenres.reduce((yr,count) => {
                yr[count] = (yr[count] + 1) || 1
                return yr
            },{})
            const filteredGenres = splitGenres.filter((element, i, self) => {
                return i === self.indexOf(element)
            })
            const response = {
                count: filteredGenres.length,
                genres: filteredGenres.map(genre => {
                    return {
                        name: genre,
                        movies: movieCount[genre],
                        request: {
                            type: 'GET',
                            description: 'Get a list of Movies in this Genre',
                            url: `http://localhost:${port}/genre/` + genre
                        }
                    }
                }).sort((a,b) => {
                    if (Object.keys(req.query).length > 0 && req.query.sort === 'movies') {
                        return b.movies - a.movies
                    } else {
                        return a.name.localeCompare(b.name)
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})


//GET BY GENRE -------------------------------------------------------------------
router.get('/:genre', (req, res, next) => {
    const genre = req.params.genre
    const genreMovies = []

    Movie
        .find()
        .exec()
        .then(result => {
            result.forEach(movie => {
                if (movie.genres.indexOf(genre) != -1) {
                    genreMovies.push(movie)
                }
            })
            genreMovies.sort((a, b) => {
                return a.title.localeCompare(b.title)
            })
            if (genreMovies.length >= 1) {
                res.status(200).json({
                    genre: genre,
                    count: genreMovies.length,
                    movies: genreMovies.map(movie => {
                        return {
                            title: movie.title,
                            year: movie.year,
                            genres: movie.genres,
                            id: movie.id,
                            request: {
                                type: 'GET',
                                description: 'Get details about this Movie',
                                url: `http://localhost:${port}/titles/` + movie.id
                            }
                        }
                    })
                })
            } else {
                res.status(404).json({
                    message: 'No Movies found with that Genre'
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})


module.exports = router
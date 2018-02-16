const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port

//GET ALL GENRES ------------------------------------------------------------
router.get('/', (req, res, next) => {
    const genres = []

    Movie
        .find()
        .exec()
        .then(result => {
            result.forEach(movie => {
                genres.push(movie.genres)
            })
            const filteredGenres = genres.filter((element, i, self) => {
                return i === self.indexOf(element)
            }).sort()
            const response = {
                count: filteredGenres.length,
                genres: filteredGenres.map(genre => {
                    return {
                        name: genre,
                        request: {
                            type: 'GET',
                            description: 'Get a list of Movies in this Genre',
                            url: `http://localhost:${port}/genre/` + genre
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.send(500).json({
                error: err
            })
        })
})

//GET BY GENRE --------------------------------------------------------------
router.get('/:genre', (req, res, next) => {
    const genre = req.params.genre

    Movie
        .find({ 'genres': genre })
        .exec()
        .then(result => {
            if (result.length > 0) {
                res.status(200).json({
                    genre: genre,
                    count: result.length,
                    movies: result.map(movie => {
                        return {
                            id: movie.id,
                            title: movie.title,
                            year: movie.year,
                            genres: movie.genres,
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
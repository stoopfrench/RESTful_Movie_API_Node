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
            const movieCount = splitGenres.reduce((genre, count) => {
                genre[count] = (genre[count] + 1) || 1
                return genre
            }, {})
            const hash = {}
            const filteredGenres = splitGenres.filter((element) => {
                return hash.hasOwnProperty(element) ? false : (hash[element] = true)
            })
            const response = {
                results: filteredGenres.length,
                genres: filteredGenres.map(genre => {
                    return {
                        name: genre,
                        movies: movieCount[genre],
                        requests: {
                            genreList: {
                                type: 'GET',
                                description: 'Get a list of movies in this genre',
                                url: `http://localhost:${port}/genre/` + genre
                            },
                            Rename: {
                                type: 'PATCH',
                                description: 'Rename a genre',
                                url: `http://localhost:${port}/genre/` + genre,
                                body: { genre: '<genre to rename>', newName: '<new name for genre>' }
                            }
                        }
                    }
                }).sort((a, b) => {
                    if (Object.keys(req.query).length === 0) {
                        return b.movies - a.movies
                    } else if (Object.keys(req.query).length > 0 && req.query.sort === 'name') {
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
                const response = {
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
                                description: 'Get details about this movie',
                                url: `http://localhost:${port}/titles/` + movie.id
                            }
                        }
                    })
                }
                res.status(200).json(response)
            } 
            else {
                throw new Error('No Movies found with that Genre')
            }
        })
        .catch(err => {
            res.status(404).json({
                message: err.message
            })
        })
})

//RENAME A GENRE -----------------------------------------------------------------
router.patch('/', (req, res, next) => {
    const genre = req.body.genre
    const newName = req.body.newName
    const genres = []
    let elGenre = []
    let count = 0

    Movie
        .find()
        .sort({ id: 1 })
        .exec()
        .then(result => {
            result.forEach(el => {
                if (el.genres.length > 1) {
                    elGenre = el.genres.split('|')
                } else {
                    elGenre = el.genres
                }
                genres.push(elGenre)
                genres.forEach((item) => {
                    for (let i = 0; i < item.length; i++) {
                        if (item[i] === genre) {
                            count++
                            item.splice(i, 1, newName)
                        }
                    }
                })
            })
            if (count === 0) {
                res.status(404).json({
                    message: "Genre not found",
                    request: {
                        type: 'GET',
                        description: 'Get a list of all the genres',
                        url: `http://localhost:${port}/genre`,
                        sorted: {
                            byName: `http://localhost:${port}/genre?sort=name`
                        }
                    }
                })
            } else {
                const newGenres = genres.map(newGenre => {
                    if (newGenre.length > 1) {
                        return newGenre.join('|')
                    } else {
                        return newGenre.join()
                    }
                })
                newGenres.forEach((element, i) => {

                    Movie
                        .update({ "id": i + 1 }, { $set: { "genres": element } }, false, false)
                        .exec()
                        .then()
                        .catch(err => {
                            console.log("err", err)
                        })
                })
                res.status(200).json({
                    message: `'${genre}' has been renamed: '${newName}'`,
                    changes: count,
                    requests: {
                        genreList: {
                            type: 'GET',
                            description: 'Get a list of movies in this genre',
                            url: `http://localhost:${port}/genre/` + newName
                        },
                        All: {
                            type: 'GET',
                            description: 'Get a new list of genres',
                            url: `http://localhost:${port}/genre`,
                            sorted: {
                                byName: `http://localhost:${port}/genre?sort=name`
                            }
                        }
                    }
                })
            }
        })
        .catch(err => {
            console.log("err", err)
        })
})


module.exports = router
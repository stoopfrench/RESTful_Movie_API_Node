const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port

// GET ALL MOVIES ----------------------------------------------------------------
router.get('/', (req, res, next) => {

    Movie
        .find()
        .select('id title year')
        .exec()
        .then(result => {
            if (Object.keys(req.query).length === 0) {
                const years = []
                const sortRefObject = {}
                result.forEach(movie => {
                    years.push(movie.year)
                })
                const movieCount = years.reduce((yr, count) => {
                    yr[count] = (yr[count] + 1) || 1
                    return yr
                }, {})
                const yearArray = Object.entries(movieCount).sort((a, b) => {
                    return b[1] - a[1]
                }).map(e => {
                    return e.splice(0, 1)
                }).join().split(',')
                for (let i = 0; i < yearArray.length; i++) {
                    sortRefObject[yearArray[i]] = i
                }
                result.sort((a, b) => {
                    if (sortRefObject[a.year] === sortRefObject[b.year]) {
                        return a.title.localeCompare(b.title)
                    }
                    return sortRefObject[a.year] - sortRefObject[b.year]
                })
            } else {
                result.sort((a, b) => {
                    if (Object.keys(req.query).length > 0 && req.query.sort === 'title') {
                        return a.title.localeCompare(b.title)
                    } else if (Object.keys(req.query).length > 0 && req.query.sort === 'id') {
                        return a.id - b.id
                    } else if (Object.keys(req.query).length > 0 && req.query.sort === 'year') {
                        if (a.year === b.year) {
                            return a.title.localeCompare(b.title)
                        }
                        return a.year - b.year
                    }
                })
            }
            const response = {
                results: result.length,
                movies: result.map(movie => {
                    return {
                        title: movie.title,
                        year: movie.year,
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
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

// GET MOVIE BY ID ---------------------------------------------------------------
router.get('/:id', (req, res, next) => {
    const id = req.params.id

    Movie
        .findOne({ 'id': id })
        .select('id title year genres')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    movie: {
                        title: result.title,
                        year: result.year,
                        genres: result.genres,
                        id: result.id,
                        requests: {
                            Update: {
                                type: 'PATCH',
                                description: 'Update this movie',
                                url: `http://localhost:${port}/titles/` + result.id,
                                body: [{ propName: '<movie property name>', value: '<new property value>' }]
                            },
                            Remove: {
                                type: 'DELETE',
                                description: 'Remove this movie from the database',
                                url: `http://localhost:${port}/titles/` + result.id
                            }
                        }
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No entry found with that ID',
                    request: {
                        type: 'GET',
                        description: 'Get a list of All movies by ID',
                        url: `http://localhost:${port}/titles/?sort=id`
                    }

                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})

// CREATE NEW MOVIE --------------------------------------------------------------
router.post('/', (req, res, next) => {

    Movie
        .find()
        .select('id')
        .exec()
        .then(docs => {
            let id = docs.length + 1
            const movie = new Movie({
                title: req.body.title,
                year: req.body.year,
                genres: req.body.genres,
                id: id
            })

            movie
                .save()
                .then(result => {
                    res.status(201).json({
                        message: 'added new movie',
                        created: {
                            title: result.title,
                            year: result.year,
                            genres: result.genres,
                            id: result.id
                        },
                        request: {
                            type: 'GET',
                            description: 'Get details about this movie',
                            url: `http://localhost:${port}/titles/` + result.id
                        }
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        error: err
                    })
                })
        })
})

// UPDATE MOVIE BY ID ------------------------------------------------------------
router.patch('/:id', (req, res, next) => {
    const id = req.params.id
    const updateFields = {}
    for (let ops of req.body) {
        updateFields[ops.propName] = ops.value
    }

    Movie
        .update({ 'id': id }, { $set: updateFields })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Movie updated',
                request: {
                    type: 'GET',
                    description: 'Get details about this product',
                    url: `http://localhost:${port}/titles/` + id
                }
            })
        })
        .catch(err => {
            console.log(err)
        })
})

// DELETE MOVIE BY ID ------------------------------------------------------------
router.delete('/:id', (req, res, next) => {
    const id = req.params.id

    Movie
        .deleteOne({ 'id': id })
        .exec()
        .then(result => {
            if(result.n !== 0) {

                Movie
                    .find({ 'id': { $gt: id } })
                    .select('id')
                    .exec()
                    .then(number => {
                        number.forEach(e => {

                            Movie
                                .update({ 'id': e.id }, { $inc: { 'id': -1 } })
                                .exec()
                                .then()
                                .catch(err => {
                                    console.log(err)
                                })
                        })
                    })
                    .catch(err => {
                        console.log(err)
                    })
                res.status(200).json({
                    message: 'Movie deleted',
                    requests: {
                        All: {
                            type: 'GET',
                            description: 'Get a new list of all movies',
                            url: `http://localhost:${port}/titles/`,
                            sorted: {
                                byTitle: `http://localhost:${port}/titles/?sort=title`,
                                byId: `http://localhost:${port}/titles/?sort=id`,
                                byYear: `http://localhost:${port}/titles/?sort=year`
                            }
                        },
                        Create: {
                            type: 'POST',
                            description: 'Create a new movie',
                            url: `http://localhost:${port}/titles/`,
                            body: { title: 'String', year: 'Number', genres: 'String ( seperated by | )' }
                        }
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No entry found with that ID',
                    request: {
                        type: 'GET',
                        description: 'Get a list of All movies by ID',
                        url: `http://localhost:${port}/titles/?sort=id`
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router
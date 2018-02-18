const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port

//GET ALL MOVIES -------------------------------------------------
router.get('/', (req, res, next) => {

    Movie
        .find()
        .select('id title year genres')
        .exec()
        .then(result => {
            result.sort((a, b) => {
                return a.id - b.id
            })
            const response = {
                count: result.length,
                movies: result.map(movie => {
                    return {
                        id: movie.id,
                        title: movie.title,
                        year: movie.year,
                        genres: movie.genres,
                        request: {
                            type: 'GET',
                            description: 'Get Details about this Movie',
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

//POST NEW MOVIE -------------------------------------------
router.post('/', (req, res, next) => {

    const movie = new Movie({
        id: req.body.id,
        title: req.body.title,
        year: req.body.year,
        genres: req.body.genres
    })

    movie
        .save()
        .then(result => {
            res.status(201).json({
                message: 'added new movie',
                created: {
                    id: result.id,
                    title: result.title,
                    year: result.year,
                    genres: result.genres,
                    request: {
                        type: 'GET',
                        description: 'Get Details about this Movie',
                        url: `http://localhost:${port}/titles/` + result.id
                    }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

// //GET MOVIE BY ID ----------------------------------------------
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
                        id: result.id,
                        title: result.title,
                        year: result.year,
                        genres: result.genres,
                        requests: {
                            Update: {
                                type: 'PATCH',
                                description: 'Update this Movie',
                                url: `http://localhost:${port}/titles/` + result.id,
                                body: [{ propName: '<movie property name>', value: '<new property value>' }]
                            },
                            All: {
                                type: 'GET',
                                description: 'Get a list of all Movies',
                                url: `http://localhost:${port}/titles/`
                            }

                        }
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No entry found with that ID'
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})

// //UPDATE MOVIE BY ID -------------------------------------------
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
                    description: 'Get Details about this product',
                    url: `http://localhost:${port}/titles/` + id
                }
            })
        })
        .catch(err => {
            console.log(err)
        })
})

// //DELETE MOVIE BY ID -------------------------------------------
router.delete('/:id', (req, res, next) => {
    const id = req.params.id

    Movie
        .deleteOne({ 'id': id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Movie deleted',
                requests: {
                    All: {
                        type: 'GET',
                        description: 'Get a new list of all Movies',
                        url: `http://localhost:${port}/titles/`
                    },
                    Create: {
                        type: 'POST',
                        description: 'Create a new Movie',
                        url: `http://localhost:${port}/titles/`,
                        body: { id: 'Number', title: 'String', year: 'Number', genres: 'String' }
                    }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('config')
const port = _var.port

// GET ALL MOVIES ----------------------------------------------------------------
exports.titles_get_all = (req, res, next) => {

    Movie
        .find()
        .select('id title year genres')
        .sort({ title: 1 })
        .exec()
        .then(result => {
            Movie.aggregate([
                    { $group: { _id: "$year", count: { $sum: 1 } } },
                    { $sort: { "count": -1 } }
                ])
                .exec()
                .then(yearResults => {
                    if (req.query.sort === 'releases') {
                        const sortRefObject = {}
                        for (let i = 0; i < yearResults.length; i++) {
                            sortRefObject[yearResults[i]._id] = i
                        }
                        result.sort((a, b) => {
                            if (sortRefObject[a.year] === sortRefObject[b.year]) {
                                return a.title.localeCompare(b.title)
                            }
                            return sortRefObject[a.year] - sortRefObject[b.year]
                        })
                    } else if (req.query.sort === 'id') {
                        result.sort((a, b) => {
                            return a.id - b.id
                        })
                    } else if (req.query.sort === 'year') {
                        result.sort((a, b) => {
                            if (a.year === b.year) {
                                return a.title.localeCompare(b.title)
                            }
                            return a.year - b.year
                        })
                    }
                    const response = {
                        results: result.length,
                        movies: result.map(movie => {
                            return {
                                title: movie.title,
                                year: movie.year,
                                genres: movie.genres,
                                id: movie.id,
                                request: {
                                    type: 'GET',
                                    description: 'Get details about this movie',
                                    url: `http://localhost:${port}/api/titles/` + movie.id
                                }
                            }
                        })
                    }
                    res.status(200).json(response)
                })
                .catch(err => {
                    throw new Error(err)
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

// GET MOVIE BY ID ---------------------------------------------------------------
exports.title_by_ID = (req, res, next) => {
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
                                url: `http://localhost:${port}/api/titles/` + result.id,
                                body: [{ property: '<movie property name>', value: '<new property value>' }]
                            },
                            Remove: {
                                type: 'DELETE',
                                description: 'Remove this movie from the database',
                                url: `http://localhost:${port}/api/titles/` + result.id
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
                        url: `http://localhost:${port}/api/titles/?sort=id`
                    }

                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

// CREATE NEW MOVIE --------------------------------------------------------------
exports.create_new_title = (req, res, next) => {


    Movie
        .find({}, { id: 1, _id: 0 })
        .sort({ id: -1 })
        .limit(1)
        .exec()
        .then(docId => {
            let newGenres
            if (req.body.genres) {
                newGenres = req.body.genres.split(/[ ,:;_/]+/).join('|')
            }
            const id = (docId.length > 0 ? docId[0].id : 0) + 1
            const movie = new Movie({
                title: req.body.title,
                year: req.body.year,
                genres: newGenres,
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
                            url: `http://localhost:${port}/api/titles/${result.id}` 
                        }
                    })
                })
                .catch(err => {
                    res.status(400).json({
                        error: err.message,
                        body: { title: 'String', year: 'Number', genres: 'String ( seperated by , )' }
                    })
                })
        })
}

// UPDATE MOVIE BY ID ------------------------------------------------------------
exports.update_title_by_ID = (req, res, next) => {
    const id = req.params.id
    const updateFields = {}
    let newGenres

    for (let ops of req.body) {
        if (ops.hasOwnProperty('property') && ops.hasOwnProperty('value') && ops.property !== 'id') {
            if (ops.property === 'genres') {
                newGenres = ops.value.split(/[ ,:;_/]+/).join('|')
                updateFields['genres'] = newGenres
            } else { updateFields[ops.property] = ops.value }
        } else {
            if (ops.property === 'id') {
                const error = new Error('Patch Failed: Changes to the ID property are not permitted')
                error.status = 400
                throw error
            }
            const error = new Error('Patch Failed: Invalid patch request')
            error.status = 400
            throw error
        }
    }

    Movie
        .findOneAndUpdate({ 'id': id }, { $set: updateFields }, { new: true })
        .select('title year genres id')
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Movie updated',
                updates: updateFields,
                result: {
                    title: result.title,
                    year: result.year,
                    genres: result.genres,
                    id: result.id
                },
                request: {
                    type: 'GET',
                    description: 'Get details about this product',
                    url: `http://localhost:${port}/api/titles/${id}` 
                }
            })
        })
        .catch(err => {
            res.status(404).json({
                message: 'No entry found with that ID',
            })
        })
}

// DELETE MOVIE BY ID ------------------------------------------------------------
exports.delete_title_by_ID = (req, res, next) => {
    const id = req.params.id

    Movie
        .deleteOne({ 'id': id })
        .exec()
        .then(result => {
            if (result.n !== 0) {
                //Decrement the ID
                Movie
                    .find({ 'id': { $gt: id } })
                    .select('id')
                    .exec()
                    .then(number => {
                        number.forEach(e => {
                            let newIdNumber = e.id - 1

                            Movie
                                .update({ 'id': e.id }, { '$set': { 'id': newIdNumber } })
                                .exec()
                                .then()
                                .catch(err => {
                                    const error = new Error(err)
                                    error.status = 500
                                    throw error
                                })
                        })
                    })
                    .catch(err => {
                        const error = new Error(err)
                        error.status = 500
                        throw error
                    })

                res.status(200).json({
                    message: 'Movie deleted',
                    requests: {
                        All: {
                            type: 'GET',
                            description: 'Get a new list of all movies',
                            url: `http://localhost:${port}/api/titles/`,
                            sorted: {
                                byTitle: `http://localhost:${port}/api/titles/?sort=title`,
                                byId: `http://localhost:${port}/api/titles/?sort=id`,
                                byYear: `http://localhost:${port}/api/titles/?sort=year`
                            }
                        },
                        Create: {
                            type: 'POST',
                            description: 'Create a new movie',
                            url: `http://localhost:${port}/api/titles/`,
                            body: { title: 'String', year: 'Number', genres: 'String ( seperated by , )' }
                        }
                    }
                })
            } else {
                res.status(404).json({
                    message: 'No entry found with that ID',
                    request: {
                        type: 'GET',
                        description: 'Get a list of All movies by ID',
                        url: `http://localhost:${port}/api/titles/?sort=id`
                    }
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}
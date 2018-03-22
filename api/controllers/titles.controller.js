const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const config = require('config')
const port = config.port

// GET ALL MOVIES ----------------------------------------------------------------
exports.titles_get_all = (req, res, next) => {

    Movie
        .find()
        .select('index title year genres')
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
                    } else if (req.query.sort === 'index') {
                        result.sort((a, b) => {
                            return a.index - b.index
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
                        data: result.map(movie => {
                            return {
                                title: movie.title,
                                year: movie.year,
                                genres: movie.genres,
                                index: movie.index,
                                request: {
                                    type: 'GET',
                                    description: 'Get details about this movie',
                                    url: `http://localhost:${port}/api/titles/` + movie.index
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

//GET MOVIE BY TITLE -------------------------------------------------------------
exports.titles_by_title = (req, res, next) => {
    const title = req.params.title
    const regexTitle = new RegExp(`^${title}`, "i")

    Movie
        .find({ "title": regexTitle })
        .sort({ "title": 1 })
        .exec()
        .then(result => {
            if (result.length > 0) {
                console.log(result)
                const response = {
                    search: title,
                    count: result.length,
                    data: result.map(movie => {
                        return {
                            title: movie.title,
                            year: movie.year,
                            genres: movie.genres,
                            index: movie.index,
                            request: {
                                type: 'GET',
                                description: 'Get details about this movie',
                                url: `http://localhost:${port}/api/titles/${movie.index}`
                            }
                        }
                    })
                }
                res.status(200).json(response)
            } else {
                res.status(404).json({
                    error: {
                        message: "No Movies found with that Title"
                    }
                })
            }
        })
        .catch(err => {
            res.status(404).json({
                message: err.message
            })
        })
}

// GET MOVIE BY INDEX ------------------------------------------------------------
exports.title_by_INDEX = (req, res, next) => {
    const index = req.params.index

    Movie
        .findOne({ 'index': index })
        .select('index title year genres')
        .exec()
        .then(result => {
            if (result) {
                const responseData = {
                        title: result.title,
                        year: result.year,
                        genres: result.genres,
                        index: result.index,
                        _id: result._id,
                        requests: {
                            Update: {
                                type: 'PATCH',
                                description: 'Update this movie',
                                url: `http://localhost:${port}/api/titles/` + result.index,
                                body: [{ property: '<movie property name>', value: '<new property value>' }]
                            },
                            Remove: {
                                type: 'DELETE',
                                description: 'Remove this movie from the database',
                                url: `http://localhost:${port}/api/titles/` + result.index
                            }
                        }
                }
                res.status(200).json({
                    data: responseData
                })
            } else {
                res.status(404).json({
                    message: 'No entry found with that INDEX',
                    request: {
                        type: 'GET',
                        description: 'Get a list of All movies by INDEX',
                        url: `http://localhost:${port}/api/titles/?sort=index`
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
        .find({}, { index: 1, _id: 1 })
        .sort({ index: -1 })
        .limit(1)
        .exec()
        .then(docIndex => {
            let newGenres
            if (req.body.genres) {
                newGenres = req.body.genres.split(/[ ,:;_/]+/).join('|')
            }
            const index = (docIndex.length > 0 ? docIndex[0].index : 0) + 1
            const movie = new Movie({
                title: req.body.title,
                year: req.body.year,
                genres: newGenres,
                index: index,
                _id: new mongoose.Types.ObjectId()
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
                            index: result.index,
                            _id: result._id
                        },
                        request: {
                            type: 'GET',
                            description: 'Get details about this movie',
                            url: `http://localhost:${port}/api/titles/${result.index}` 
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

// UPDATE MOVIE BY INDEX ---------------------------------------------------------
exports.update_title_by_INDEX = (req, res, next) => {
    const index = req.params.index
    const updateFields = {}
    let newGenres

    for (let ops of req.body) {
        if (ops.hasOwnProperty('property') && ops.hasOwnProperty('value') && ops.property !== 'index') {
            if (ops.property === 'genres') {
                newGenres = ops.value.split(/[ ,:;_/]+/).join('|')
                updateFields['genres'] = newGenres
            } else { updateFields[ops.property] = ops.value }
        } else {
            if (ops.property === 'index') {
                const error = new Error('Patch Failed: Changes to the INDEX property are not permitted')
                error.status = 400
                throw error
            }
            const error = new Error('Patch Failed: Invalid patch request')
            error.status = 400
            throw error
        }
    }

    Movie
        .findOneAndUpdate({ 'index': index }, { $set: updateFields }, { new: true })
        .select('title year genres index')
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Movie updated',
                updates: updateFields,
                result: {
                    title: result.title,
                    year: result.year,
                    genres: result.genres,
                    index: result.index,
                    _id: result._id
                },
                request: {
                    type: 'GET',
                    description: 'Get details about this product',
                    url: `http://localhost:${port}/api/titles/${index}` 
                }
            })
        })
        .catch(err => {
            res.status(404).json({
                message: 'No entry found with that INDEX',
            })
        })
}

// DELETE MOVIE BY INDEX ---------------------------------------------------------
exports.delete_title_by_INDEX = (req, res, next) => {
    const index = req.params.index

    Movie
        .deleteOne({ 'index': index })
        .exec()
        .then(result => {
            if (result.n !== 0) {
                //Decrement the INDEX
                Movie
                    .find({ 'index': { $gt: index } })
                    .select('index')
                    .exec()
                    .then(number => {
                        number.forEach(e => {
                            let newIndexNumber = e.index - 1

                            Movie
                                .update({ 'index': e.index }, { '$set': { 'index': newIndexNumber } })
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
                                byIndex: `http://localhost:${port}/api/titles/?sort=index`,
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
                    message: 'No entry found with that INDEX',
                    request: {
                        type: 'GET',
                        description: 'Get a list of All movies by INDEX',
                        url: `http://localhost:${port}/api/titles/?sort=index`
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
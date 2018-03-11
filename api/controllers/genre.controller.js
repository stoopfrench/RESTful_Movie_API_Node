const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('config')
const port = _var.port

//GET ALL GENRES -----------------------------------------------------------------
exports.genres_get_all = (req, res, next) => {

    Movie
        .aggregate([
            { $project: { split_genres: { $split: ["$genres", "|"] } } },
            { $unwind: "$split_genres" },
            { $group: { _id: { "genres": "$split_genres" }, count: { $sum: 1 } } },
            { $sort: { "count": -1 } }
        ])
        .exec()
        .then(result => {
            const response = {
                "results": result.length,
                "data": result.map(genre => {
                    return {
                        genre: genre._id.genres,
                        movies: genre.count,
                        requests: {
                            genreList: {
                                type: 'GET',
                                description: 'Get a list of movies in this genre',
                                url: `http://localhost:${port}/api/genre/${genre._id.genres}` 
                            },
                            Rename: {
                                type: 'PATCH',
                                description: 'Rename a genre',
                                url: `http://localhost:${port}/api/genre` ,
                                body: { genre: '<genre to rename>', newName: '<new name for genre>' }
                            }
                        }
                    }
                })
            }
            res.status(200).json(response)
        }).catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

//GET BY GENRE -------------------------------------------------------------------
exports.get_by_genre = (req, res, next) => {
    const genre = req.params.genre
    const regexGenre = new RegExp(genre, "i")

    Movie
        .find({ "genres": regexGenre })
        .sort({ "title": 1 })
        .exec()
        .then(result => {
            if (result.length > 0) {
                const response = {
                    genre: genre,
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
                throw new Error('No Movies found with that Genre')
            }
        })
        .catch(err => {
            res.status(404).json({
                message: err.message
            })
        })
}

//RENAME A GENRE -----------------------------------------------------------------
exports.rename_genre = (req, res, next) => {
    if (req.body.hasOwnProperty('genre') && req.body.hasOwnProperty('newName')) {
        let count = 0
        const genre = req.body.genre
        const regexGenre = new RegExp(genre, "i")
        const newName = req.body.newName

        Movie.collection
            .find({ "genres": regexGenre })
            .forEach(genre => {
                count++
                genre.genres = genre.genres.replace(regexGenre, newName)
                Movie
                    .update({ index: genre.index }, { $set: { 'genres': genre.genres } })
                    .exec()
            }, result => {
                if (count > 0) {
                    res.status(200).json({
                        message: `${genre} has been renamed ${newName}`,
                        changes: count,
                        request: {
                            type: "GET",
                            description: "Get a new list of all Genres",
                            url: `http://localhost:${port}/api/genre`
                        }
                    })
                } else {
                    res.status(404).json({
                        error: {
                            message: "Genre not found"
                        }
                    })
                }
            })
    } else {
        res.status(500).json({
            error: {
                message: "Invalid request format",
                template: {
                    genre: "<genre to rename>",
                    newName: "<new name for genre>"
                }
            }
        })
    }
}
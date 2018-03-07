const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('config')
const port = _var.port

//GET YEAR INDEX -----------------------------------------------------------------
exports.year_get_all = (req, res, next) => {

    Movie
        .find()
        .exec()
        .then(result => {
            const years = []
            result.forEach(movie => {
                years.push(movie.year)
            })
            const movieCount = years.reduce((yr, count) => {
                yr[count] = (yr[count] + 1) || 1
                return yr
            }, {})
            const filteredYears = Object.keys(movieCount)
            const response = {
                count: filteredYears.length,
                years: filteredYears.map(year => {
                    return {
                        year: year,
                        movies: movieCount[year],
                        request: {
                            type: 'GET',
                            description: 'Get a list of movies from this year',
                            url: `http://localhost:${port}/year/` + year
                        }
                    }
                }).sort((a, b) => {
                    if (Object.keys(req.query).length === 0) {
                        return b.movies - a.movies
                    } else if (Object.keys(req.query).length > 0 && req.query.sort === 'year') {
                        return a.year - b.year
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
}

//GET MOVIES BY YEAR --------------------------------------------------------------
exports.get_title_by_year = (req, res, next) => {
    const year = req.params.year

    Movie
        .find({ 'year': year })
        .select('id title year genres')
        .exec()
        .then(result => {
            if (result.length > 0) {
                result.sort((a, b) => {
                    return a.title.localeCompare(b.title)
                })
                const response = {
                    year: year,
                    count: result.length,
                    movies: result.map(year => {
                        return {
                            title: year.title,
                            genres: year.genres,
                            id: year.id,
                            request: {
                                type: 'GET',
                                description: 'Get details about this movie',
                                url: `http://localhost:${port}/titles/` + year.id
                            }
                        }
                    })
                }
                res.status(200).json(response)
            } else {
                throw new Error('No Movies found from that year')
            }
        })
        .catch(err => {
            res.status(404).json({
                message: err.message
            })
        })
}
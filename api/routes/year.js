const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Movie = require('../models/movieModel')

const _var = require('../../variables.js')
const port = _var.port


//GET YEAR INDEX -----------------------------------------------------------------
router.get('/', (req, res, next) => {

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
            const filteredYears = years.filter((element, i) => {
                return i === years.indexOf(element)
            })
            res.status(200).json({
                count: filteredYears.length,
                years: filteredYears.map(year => {
                    return {
                        year: year,
                        movies: movieCount[year],
                        request: {
                            type: 'GET',
                            description: 'Get a list of Movies from this Year',
                            url: `http://localhost:${port}/year/` + year
                        }
                    }
                }).sort((a, b) => {
                    if (Object.keys(req.query).length > 0 && req.query.sort === 'movies') {
                        return b.movies - a.movies
                    } else {
                        return a.year - b.year
                    }
                })
            })
        })
        .catch(err => {
            message: err
        })
})

//GET MOVIE BY YEAR --------------------------------------------------------------
router.get('/:year', (req, res, next) => {
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
                res.status(200).json({
                    year: year,
                    count: result.length,
                    movies: result.map(year => {
                        return {
                            title: year.title,
                            genres: year.genres,
                            id: year.id,
                            request: {
                                type: 'GET',
                                description: 'Get details about this Movie',
                                url: `http://localhost:${port}/titles/` + year.id
                            }
                        }
                    })
                })
            } else {
                res.status(404).json({
                    message: 'No Movies found from that year'
                })
            }
        })
        .catch(err => {
            console.log(err)
        })
})

module.exports = router
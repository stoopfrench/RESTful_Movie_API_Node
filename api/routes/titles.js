const express = require('express');
const router = express.Router();
const fs = require('fs');
const Papa = require('papaparse');
const mongoose = require('mongoose');

const Movie = require('../models/movieModel');

//GET ALL MOVIES -------------------------------------------------
router.get('/', (req, res, next) => {

    Movie
    .find()
    .select('id title year genres')
    .exec()
    .then(result=> {
        result.sort((a,b)=> {
            return a.id - b.id
        })
        const response = {
            count: result.length,
            movies: result.map(movie=> {
                return {
                    id: movie.id,
                    title: movie.title,
                    year: movie.year,
                    genres: movie.genres,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8091/titles/' + movie.id
                    }
                }
            })
        }
        res.status(200).json(response)  
    })
        .catch(err=> {
            res.status(500).json({
                error: err
            })
        })
});

//POST NEW MOVIE -------------------------------------------
router.post('/',(req, res, next) => {
    
    const movie = new Movie({
        id: req.body.id,
        title: req.body.title,
        year: req.body.year,
        genres: req.body.genres
    });
    movie
        .save()
        .then(result => {
            console.log(result)
            res.status(201).json({
                message: 'added new movie',
                created: {
                    id: result.id,
                    title: result.title,
                    year: result.year,
                    genres: result.genres,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:8091/titles/' + result.id
                    }
                }
            })
        })
        .catch(err => console.log(err))

});

// //GET MOVIE BY ID ----------------------------------------------
router.get('/:id', (req, res, next) => {
    const id = req.params.id
    console.log(id)

    Movie
        .findOne({'id': id})
        .select('id title year genres')
        .exec()
        .then(result=> {
            const response = {
                movie: {
                    id: result.id,
                    title: result.title,
                    year: result.year,
                    genres: result.genres,
                    requests: {
                        allTitles: {
                            type: 'GET',
                            url: 'http://localhost:8091/titles/'
                        },
                        updateMovie: {
                            type: 'PATCH',
                            url: 'http://localhost:8091/titles/' + result.id
                        }
                    }
                }
            }
            if(result){
                res.status(200).json(response)
            }
            else {
                res.status(404).json({
                    message: 'No entry found with that ID'
                })
            }   
        })
        .catch(err=> {
            console.log(err)
        })
})

// //UPDATE MOVIE BY ID -------------------------------------------
router.patch('/:id', (req, res, next) => {
    const id = req.params.id
    const updateFields = {}
    for(let ops of req.body){
        updateFields[ops.propName] = ops.value
    }
    Movie
        .update({'id': id}, {$set: updateFields})
        .exec()
        .then(result=> {
            res.status(200).json({
                message: 'updated on Movie',
                results: result
            })
        })
        .catch(err=> {
            res.status(500).json({
                error: err
            })
        })
});

// //DELETE MOVIE BY ID -------------------------------------------
router.delete('/:id', (req, res, next) => {
    const id = req.params.id
    Movie.deleteOne({'id': id})
        .exec()
        .then(result=> {
            res.status(200).json({
                message: 'Removed one Movie',
                results: result,
                requests: {
                    type: 'GET',
                    url: '/titles'
                }
            })
        })
        .catch(err=> {
            res.status(500).json({
                error: err
            })
        })
});

module.exports = router;
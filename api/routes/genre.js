const express = require('express')
const router = express.Router()

const genreController = require('../controllers/genre.controller.js')

//GET ALL GENRES -----------------------------------------------------------------
router.get('/', genreController.genres_get_all)

//GET BY GENRE -------------------------------------------------------------------
router.get('/:genre', genreController.get_by_genre)

//RENAME A GENRE -----------------------------------------------------------------
router.patch('/', genreController.rename_genre)

module.exports = router
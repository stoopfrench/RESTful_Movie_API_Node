const express = require('express')
const router = express.Router()

const titlesController = require('../controllers/titles.controller.js')

// GET ALL MOVIES ----------------------------------------------------------------
router.get('/', titlesController.titles_get_all)

// GET MOVIE BY ID ---------------------------------------------------------------
router.get('/:id', titlesController.title_by_ID)

// CREATE NEW MOVIE --------------------------------------------------------------
router.post('/', titlesController.create_new_title)

// UPDATE MOVIE BY ID ------------------------------------------------------------
router.patch('/:id', titlesController.update_title_by_ID)

// DELETE MOVIE BY ID ------------------------------------------------------------
router.delete('/:id', titlesController.delete_title_by_ID)

module.exports = router
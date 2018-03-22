const express = require('express')
const router = express.Router()

const titlesController = require('../controllers/titles.controller.js')

// GET ALL MOVIES ----------------------------------------------------------------
router.get('/', titlesController.titles_get_all)

// GET MOVIE BY TITLE ------------------------------------------------------------
router.get('/:title', titlesController.titles_by_title)

// GET MOVIE BY INDEX ------------------------------------------------------------
router.get('/:index', titlesController.title_by_INDEX)

// CREATE NEW MOVIE --------------------------------------------------------------
router.post('/', titlesController.create_new_title)

// UPDATE MOVIE BY INDEX ---------------------------------------------------------
router.patch('/:index', titlesController.update_title_by_INDEX)

// DELETE MOVIE BY INDEX ---------------------------------------------------------
router.delete('/:index', titlesController.delete_title_by_INDEX)

module.exports = router
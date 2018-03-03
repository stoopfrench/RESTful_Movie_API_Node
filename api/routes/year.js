const express = require('express')
const router = express.Router()

const yearController = require('../controllers/year.controller.js')

//GET YEAR INDEX -----------------------------------------------------------------
router.get('/', yearController.year_get_all)

//GET MOVIES BY YEAR --------------------------------------------------------------
router.get('/:year', yearController.get_title_by_year)

module.exports = router
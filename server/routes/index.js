const Router = require('express')
const router = new Router()
const LessonController = require('../controllers/LessonController')

router.get('/', LessonController.get)
router.post('/lessons', LessonController.create)

module.exports = router
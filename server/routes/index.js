const Router = require('express');
const router = new Router();
const LessonController = require('../controllers/LessonController');
const {body} = require('express-validator');
const {dateValidator} = require('../validators/dateValidator');
const {stringToArrayIntValidator} = require("../validators/stringToArrayIntValidator");

router.get(
    '/',
    body('date').optional().isString().custom(dateValidator),
    body('status').optional().isIn([0, 1]),
    body('teacherIds').optional().isString().custom(stringToArrayIntValidator),
    body('studentsCount').optional().isString().custom(stringToArrayIntValidator),
    body('page').optional().isInt(),
    body('lessonsPerPage').optional().isInt(),
    LessonController.get
);

router.post(
    '/lessons',
    LessonController.create
);

module.exports = router;

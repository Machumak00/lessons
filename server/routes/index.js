const Router = require('express');
const router = new Router();
const LessonController = require('../controllers/LessonController');
const {body, query} = require('express-validator');
const dateValidator = require('../validators/dateValidator');
const stringToArrayIntValidator = require("../validators/stringToArrayIntValidator");
const arrayIntValidator = require("../validators/arrayIntValidator");
const ApiError = require("../errors/ApiError");

router.get(
    '/',
    query('date').optional()
        .isString().withMessage('This param should be a string')
        .custom(dateValidator),
    query('status').optional()
        .isIn([0, 1]).withMessage('This param is not 0 or 1'),
    query('teacherIds').optional()
        .isString().withMessage('This param should be a string')
        .custom(stringToArrayIntValidator),
    query('studentsCount').optional()
        .isString().withMessage('This param should be a string')
        .custom(stringToArrayIntValidator),
    query('page').optional()
        .isInt().withMessage('This param should be an integer'),
    query('lessonsPerPage').optional()
        .isInt().withMessage('This param should be an integer'),
    LessonController.get
);

router.post(
    '/lessons',
    body('teacherIds')
        .exists().withMessage('This param is required')
        .isArray({min: 1}).withMessage('This param should be not empty array')
        .custom(arrayIntValidator).withMessage('This param should be an array of integers'),
    body('title')
        .exists().withMessage('This param is required')
        .isString().withMessage('This param should be a string'),
    body('days')
        .exists().withMessage('This param is required')
        .isArray({min: 1}).withMessage('This param should be not empty array')
        .custom(arrayIntValidator),
    body('date')
        .exists().withMessage('This param is required')
        .isString().withMessage('This param should be a string')
        .custom(dateValidator),
    body('lessonsCount')
        .exists().withMessage('This param is required')
        .custom((count, {req}) => {
            if (count && req.body.lastDate) {
                return ApiError.badRequest('lessonsCount parameter is used without lastDate parameter');
            }
            return true;
        })
        .isInt().withMessage('This param should be an integer'),
    body('lastDate')
        .exists()
        .custom((date, {req}) => {
            if (date && req.body.lessonsCount) {
                return ApiError.badRequest('lastDate parameter is used without lessonsCount parameter');
            }
            return true;
        })
        .isString().withMessage('This param should be a string')
        .custom(dateValidator),
    LessonController.create
);

module.exports = router;

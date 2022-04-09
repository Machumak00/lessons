const Router = require('express');
const router = new Router();
const LessonController = require('../controllers/LessonController');
const {body, query} = require('express-validator');
const dateValidator = require('../validators/dateValidator');
const stringToArrayIntValidator = require("../validators/stringToArrayIntValidator");
const arrayIntValidator = require("../validators/arrayIntValidator");
const teacherIdsValidator = require("../validators/teacherIdsValidator");
const daysValidator = require("../validators/daysValidator");
const ApiError = require("../errors/ApiError");
const moment = require("moment");

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
        .custom(arrayIntValidator)
        .custom(teacherIdsValidator),
    body('title')
        .exists().withMessage('This param is required')
        .isLength({max: 100}).withMessage("The param's length should be max in 100 symbols")
        .isString().withMessage('This param should be a string'),
    body('days')
        .exists().withMessage('This param is required')
        .isArray({min: 1}).withMessage('This param should be not empty array')
        .custom(daysValidator)
        .custom(arrayIntValidator),
    body('date')
        .exists().withMessage('This param is required')
        .isString().withMessage('This param should be a string')
        .custom(dateValidator),
    body('lessonsCount')
        .custom((count, {req}) => {
            if (count && req.body.lastDate) {
                throw ApiError.badRequest('lessonsCount parameter is used without lastDate parameter');
            }

            if (!count && !req.body.lastDate) {
                throw ApiError.badRequest('This param is required');
            }

            if (count && isNaN(parseInt(count))) {
                throw ApiError.badRequest('This param is not an integer');
            }

            if (count > 300) {
                throw ApiError.badRequest('This param should be equal or less than 300');
            }

            return true;
        }),
    body('lastDate')
        .custom((date, {req}) => {
            if (date && req.body.lessonsCount) {
                throw ApiError.badRequest('lastDate parameter is used without lessonsCount parameter');
            }

            if (!date && !req.body.lessonsCount) {
                throw ApiError.badRequest('This param is required');
            }

            if (req.body.date) {
                const firstDate = moment(req.body.date, 'YYYY-MM-DD', true);
                const lastDate = moment(date, 'YYYY-MM-DD', true);

                const difference = moment.duration(lastDate.diff(firstDate)).asDays();

                if (difference > 365) {
                    throw ApiError.badRequest('Difference between first date and last one should be less than 1 year');
                }
            }

            return true;
        })
        .custom(dateValidator),
    LessonController.create
);

module.exports = router;

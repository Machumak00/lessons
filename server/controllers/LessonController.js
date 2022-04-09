const {Lesson, Teacher, Student} = require('../models')
const {Op} = require('sequelize')
const sequelize = require('sequelize')
const ValidationError = require('../errors/ValidationError')

class LessonController {
    async create(req, res) {
        const validationResult = ValidationError.validate(req, res)
        if (validationResult !== true) {
            return validationResult;
        }

        return res.status(200).json({param: 'test'});
    }

    async get(req, res) {
        const validationResult = ValidationError.validate(req, res)
        if (validationResult !== true) {
            return validationResult;
        }

        let {date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5} = req.query;

        let lessonOptions = {
            attributes: [
                'id', 'date', 'title', 'status',
                [
                    sequelize.literal(`(
                        SELECT COUNT(ls.visit)
                        FROM lesson_students AS ls
                        WHERE
                            ls.lesson_id = lessons.id
                            AND
                            ls.visit = true
                    )`),
                    'visitCount'
                ],
            ],
            where: {},
            group: ['id'],
            include: [
                {
                    model: Student,
                    required: true,
                    through: {
                        attributes: []
                    },
                    attributes: [
                        'id', 'name',
                        [
                            sequelize.literal(`(
                                SELECT visit
                                FROM lesson_students as ls
                                WHERE
                                    ls.student_id = students.id
                                    AND
                                    ls.lesson_id = lessons.id
                            )`),
                            'visit'
                        ]
                    ],
                },
            ],
            offset: page * lessonsPerPage - lessonsPerPage,
            limit: lessonsPerPage,
        };

        let teacherParams = {
            model: Teacher,
            required: true,
            where: {},
            through: {
                attributes: []
            }
        };

        if (status) {
            lessonOptions.where.status = status;
        }

        if (date) {
            const dateArray = date.split(',');
            let dateParams = new Date(dateArray[0])
            if (dateArray.length !== 1) {
                dateParams = {[Op.between]: [new Date(dateArray[0]), new Date(dateArray[1])]};
            }

            lessonOptions.where.date = dateParams;
        }

        if (teacherIds) {
            let teacherIdArray = teacherIds.split(',').map(numStr => parseInt(numStr));
            teacherParams.where.id = teacherIdArray;
        }
        lessonOptions.include.push(teacherParams);

        if (studentsCount) {
            const studentsCountArray = studentsCount.split(',');
            let studentsParams = `= ${studentsCountArray[0]}`;
            if (studentsCountArray.length !== 1) {
                studentsParams = `BETWEEN ${studentsCountArray[0]} AND ${studentsCountArray[1]}`;
            }

            lessonOptions.where.id = {
                [Op.in]: [
                    sequelize.literal(`
                        SELECT lessons.id
                        FROM lessons
                        WHERE (SELECT COUNT(students.id)
                            FROM lesson_students as ls
                            JOIN students
                                ON students.id = ls.student_id
                            WHERE
                                ls.student_id = students.id
                                AND
                                ls.lesson_id = lessons.id
                            ) ${studentsParams}
                        `
                    )
                ]
            };
        }

        const lessons = await Lesson.findAll(lessonOptions)

        return res.status(200).json({lessons});
    }
}

module.exports = new LessonController();

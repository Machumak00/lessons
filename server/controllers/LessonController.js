const {Lesson, Teacher, Student, LessonStudent} = require('../models')
const sequelize = require('sequelize')
const ValidationError = require('../errors/ValidationError')
const moment = require("moment");

class LessonController {
    async create(req, res) {
        const validationResult = ValidationError.validate(req, res)
        if (validationResult !== true) {
            return validationResult;
        }

        let {teacherIds, title, days, date, lessonsCount, lastDate} = req.body;

        const lessons = [];

        date = moment(date, 'YYYY-MM-DD', true);
        let maxDate = moment(date, 'YYYY-MM-DD', true).add(1, 'year');

        let maxLessonsCount = lessonsCount;
        if (lastDate) {
            lastDate = moment(lastDate, 'YYYY-MM-DD', true);
            maxDate = lastDate;
            maxLessonsCount = moment.duration(lastDate.diff(date)).asDays() + 1;
        }
        maxLessonsCount = maxLessonsCount > 300 ? 300 : maxLessonsCount;

        while (!date.isAfter(maxDate) && maxLessonsCount > 0) {
            let currentWeekday = date.weekday();

            if (days.includes(currentWeekday)) {
                const lesson = await Lesson.create(
                    {
                        date: date.format('YYYY-MM-DD'),
                        title: title,
                        status: 0,
                    }
                );

                for (const teacherId of teacherIds) {
                    const teacher = await Teacher.findOne({
                        where:{'id': teacherId}
                    })

                    lesson.addTeacher(teacher);
                }

                lessons.push(lesson.id);

                maxLessonsCount -= 1;
            }

            date.add(1, 'day');
        }

        return res.status(200).json(lessons);
    }

    async get(req, res) {
        const validationResult = ValidationError.validate(req, res)
        if (validationResult !== true) {
            return validationResult;
        }

        let {date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5} = req.query;

        let lessonOptions = {
            attributes: ['id', 'date', 'title', 'status'],
            where: {},
            include: [
                {
                    model: Student,
                    required: false,
                    through: {
                        attributes: ['visit']
                    }
                },
            ],
            offset: page * lessonsPerPage - lessonsPerPage,
            limit: lessonsPerPage,
        };

        let teacherParams = {
            model: Teacher,
            required: false,
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
                dateParams = {[sequelize.Op.between]: [new Date(dateArray[0]), new Date(dateArray[1])]};
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
                [sequelize.Op.in]: [
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

        const lessons = await Lesson.findAll(lessonOptions);

        let jsonLessons = JSON.parse(JSON.stringify(lessons))
        for (const lesson of jsonLessons) {
            let visitCount = 0;

            for (const student of lesson.students) {
                student.visit = student.lesson_students.visit;
                delete student.lesson_students;

                if (student.visit === true) {
                    visitCount += 1;
                }
            }

            lesson.visitCount = visitCount;
        }

        return res.status(200).json(jsonLessons);
    }
}

module.exports = new LessonController();

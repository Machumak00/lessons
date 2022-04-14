const request = require('supertest');
const chai = require('chai')
const moment = require("moment");

let assert = chai.assert;
let app = require('../app');

describe('Lessons tests', function () {
    describe('Get lessons tests', function () {
        it('Without params', function (done) {
            request(app)
                .get('/')
                .expect(200, function(err, res) {
                    assert.equal(JSON.parse(res.text).length,5);
                    done();
                });
        });

        it('With all params', function (done) {
            let dates = ['2019-01-01', '2020-01-01']
            let studentsCountArray = [1, 5];
            let teacherIds = [1, 2, 3, 4];
            let status = 1;

            request(app)
                .get('/')
                .query({
                    date: dates.toString(),
                    status: status,
                    teacherIds: teacherIds.toString(),
                    studentsCount: studentsCountArray.toString(),
                    page: 1,
                    lessonsPerPage: 10
                })
                .expect(200, function(err, res) {
                    const lessons = JSON.parse(res.text);
                    let firstDate = moment(dates[0], 'YYYY-MM-DD');
                    let secondDate = moment(dates[1], 'YYYY-MM-DD');

                    for (const lesson of lessons) {
                        let lessonDate = moment(lesson.date);
                        assert.isTrue(lessonDate >= firstDate && lessonDate <= secondDate);

                        let studentsCount = lesson.students.length;
                        assert.isTrue(studentsCount >= studentsCountArray[0] && studentsCount <= studentsCountArray[1]);

                        let lessonStatus = lesson.status;
                        assert.equal(lessonStatus, status);

                        let teachers = lesson.teachers;
                        for (const teacher of teachers) {
                            assert.isTrue(teacherIds.includes(teacher.id));
                        }
                    }
                    assert.equal(JSON.parse(res.text).length, lessons.length);

                    done();
                });
        });

        it('Validation errors', function (done) {
            let dateParam = '123';
            let statusParam = '2';
            let testString = 'test'

            request(app)
                .get('/')
                .query({
                    date: dateParam,
                    status: statusParam,
                    teacherIds: testString,
                    studentsCount: testString,
                    page: testString,
                    lessonsPerPage: testString
                })
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        date: [dateParam, 'Date format is not correct'],
                        status: [statusParam, 'This param is not 0 or 1'],
                        teacherIds: [testString, 'Values are not integers'],
                        studentsCount: [testString, 'Values are not integers'],
                        page: [testString, 'This param should be an integer'],
                        lessonsPerPage: [testString, 'This param should be an integer']
                    }

                    for (const error of errors) {
                        let expectedMessagesArray = expectedMessages[error.param];
                        assert.isTrue(expectedMessagesArray.includes(error.value));
                        assert.isTrue(expectedMessagesArray.includes(error.msg));
                    }

                    done();
                });
        });
    })

    describe('Create lessons tests', function () {
        it('Without params', function (done) {
            request(app)
                .post('/lessons')
                .send()
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        teacherIds: ['This param is required', 'This param should be not empty array'],
                        title: ['This param is required', 'This param should be a string'],
                        days: ['This param is required', 'This param should be not empty array'],
                        date: ['This param is required', 'This param should be a string'],
                        lessonsCount: ['This param is required'],
                        lastDate: ['This param is required']
                    }

                    for (const error of errors) {
                        assert.isTrue(expectedMessages[error.param].includes(error.msg));
                    }

                    done();
                });
        });

        it('With all params (with lessonsCount)', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 2, 4, 6];
            let date = '2020-01-01'
            let lessonsCount = 20;

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lessonsCount: lessonsCount,
                })
                .expect(200, function(err, res) {
                    assert.equal(JSON.parse(res.text).length,20);
                    done();
                });
        });

        it('With all params (with lastDate)', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 2, 4, 6];
            let date = '2020-01-01';
            let lastDate = '2020-02-01';

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lastDate: lastDate,
                })
                .expect(200, function(err, res) {
                    assert.equal(JSON.parse(res.text).length,18);
                    done();
                });
        });

        it('Validate lastDate: more than 1 year', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 2, 4, 6];
            let date = '2020-01-01';
            let lastDate = '2021-01-02';

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lastDate: lastDate,
                })
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        lastDate: ['2021-01-02', 'Difference between first date and last one should be less than 1 year']
                    }

                    for (const error of errors) {
                        assert.isTrue(expectedMessages[error.param].includes(error.value));
                        assert.isTrue(expectedMessages[error.param].includes(error.msg));
                    }

                    done();
                });
        });

        it('Validate lessonsCount: more than 300', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 2, 4, 6];
            let date = '2020-01-01';
            let lessonsCount = 301;

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lessonsCount: lessonsCount,
                })
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        lessonsCount: [301, 'This param should be equal or less than 300']
                    }

                    for (const error of errors) {
                        assert.isTrue(expectedMessages[error.param].includes(error.value));
                        assert.isTrue(expectedMessages[error.param].includes(error.msg));
                    }

                    done();
                });
        });

        it('Check 300 lessonsCount', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 1, 2, 3, 4, 5, 6];
            let date = '2020-01-01';
            let lessonsCount = 300;

            request(app)
                .post('/lessons')
                .timeout(3000)
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lessonsCount: lessonsCount,
                })
                .expect(200, function(err, res) {
                    assert.equal(JSON.parse(res.text).length,300);
                    done();
                });
        });

        it('Check 1 year date', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [0, 1, 2, 3, 4, 5, 6];
            let date = '2019-01-01';
            let lastDate = '2020-01-01';

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lastDate: lastDate,
                })
                .expect(200, function(err, res) {
                    assert.equal(JSON.parse(res.text).length,300);
                    done();
                });
        });

        it('Validate days: wrong day', function (done) {
            let teacherIds = [1, 2, 3];
            let title = 'Test lesson';
            let days = [7];
            let date = '2019-01-01';
            let lastDate = '2020-01-01';

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lastDate: lastDate,
                })
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        days: ['Day should be in range [0, 6]']
                    }

                    for (const error of errors) {
                        assert.isTrue(expectedMessages[error.param].includes(error.msg));
                    }

                    done();
                });
        });

        it('Validate teacherIds: teacher not found', function (done) {
            let wrongId = 9;
            let teacherIds = [1, 2, 3, wrongId];
            let title = 'Test lesson';
            let days = [0, 2, 4, 6];
            let date = '2019-01-01';
            let lastDate = '2020-01-01';

            request(app)
                .post('/lessons')
                .send({
                    teacherIds: teacherIds,
                    title: title,
                    days: days,
                    date: date,
                    lastDate: lastDate,
                })
                .expect(200, function(err, res) {
                    const errors = JSON.parse(res.text).errors;

                    let expectedMessages = {
                        teacherIds: [`Teacher with id ${wrongId} not found`]
                    }

                    for (const error of errors) {
                        assert.isTrue(expectedMessages[error.param].includes(error.msg));
                    }

                    done();
                });
        });
    })
})

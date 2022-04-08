const sequelize = require('./db')
const {DataTypes} = require('sequelize')

const Lesson = sequelize.define('lessons', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    date: {type: DataTypes.DATE, allowNull: false},
    title: {type: DataTypes.STRING(100)},
    status: {type: DataTypes.INTEGER, defaultValue: 0}
})

const Teacher = sequelize.define('teachers', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING(50), allowNull: false},
})

const Student = sequelize.define('students', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING(20), allowNull: false},
})

const LessonTeacher = sequelize.define('lesson_teachers', {})

const LessonStudent = sequelize.define('lesson_students', {
    visit: {type: DataTypes.BOOLEAN, defaultValue: false}
})

Lesson.belongsToMany(Teacher, {through: LessonTeacher})
Teacher.belongsToMany(Lesson, {through: LessonTeacher})

Lesson.belongsToMany(Student, {through: LessonStudent})
Student.belongsToMany(Lesson, {through: LessonStudent})

module.exports = {
    Lesson,
    Teacher,
    Student,
    LessonTeacher,
    LessonStudent,
}
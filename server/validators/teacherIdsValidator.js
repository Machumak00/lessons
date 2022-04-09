const ApiError = require("../errors/ApiError");
const {Teacher} = require("../models");

module.exports = async function teacherIdsValidator(teacherIds) {
    if (teacherIds) {
        for (const teacherId of teacherIds) {
            if (isNaN(parseInt(teacherId))) {
                throw ApiError.badRequest('Values in array are not integers');
            }

            let teacher = await Teacher.findOne(
                {where: {'id': teacherId}}
            );

            if (!teacher) {
                throw ApiError.badRequest(`Teacher with id ${teacherId} not found`)
            }
        }
    }

    return true;
}
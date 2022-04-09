const validateDate = require("validate-date");
const ApiError = require("../errors/ApiError");

module.exports = function dateValidator(date) {
    let dateArray = date.split(',');

    for (const date of dateArray) {
        if (validateDate(date, 'string', 'yyyy-mm-dd')) {
            return ApiError.badRequest('Date format is not correct');
        }
    }

    return true;
}
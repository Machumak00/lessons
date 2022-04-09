const moment = require("moment");
const ApiError = require("../errors/ApiError");

module.exports = function dateValidator(date) {
    if (date) {
        let dateArray = date.split(',');

        for (const date of dateArray) {
            if (!moment(date, 'MM/DD/YYYY',true).isValid()) {
                throw ApiError.badRequest('Date format is not correct');
            }
        }
    }

    return true;
}
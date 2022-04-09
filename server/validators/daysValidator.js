const ApiError = require("../errors/ApiError");

module.exports = function daysValidator(days) {
    if (days) {
        for (const day of days) {
            if (isNaN(parseInt(day))) {
                throw ApiError.badRequest('Values in array are not integers');
            }

            if (day < 0 || day > 6) {
                throw ApiError.badRequest('Day should be in range [0, 6]');
            }
        }

        const uniqueValuesArray = ([...new Set(days)]);

        if (days.length !== uniqueValuesArray.length) {
            throw ApiError.badRequest('Days should be unique');
        }
    }

    return true;
}
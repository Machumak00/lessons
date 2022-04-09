const ApiError = require("../errors/ApiError");

module.exports = function arrayIntValidator(array) {
    if (array) {
        for (const number of array) {
            if (isNaN(parseInt(number))) {
                throw ApiError.badRequest('Values in array are not integers');
            }
        }
    }

    return true;
}
const ApiError = require("../errors/ApiError");

module.exports = function stringToArrayIntValidator(string) {
    if (string) {
        let intArray = string.split(',');

        for (const number of intArray) {
            if (isNaN(parseInt(number))) {
                throw ApiError.badRequest('Values are not integers');
            }
        }
    }

    return true;
}
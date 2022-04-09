const {validationResult} = require("express-validator");

class ValidationError extends Error{
    constructor(status, message) {
        super();
        this.status = status
        this.message = message
    }

    static validate(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        return true;
    }
}

module.exports = ValidationError
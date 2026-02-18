const { checkSchema, validationResult } = require("express-validator");

async function validateArgs(schema, args) {
  // make a fake req object so express-validator can run
    const req = { body: args };

    const validations = checkSchema(schema, ["body"]);
    for (const v of validations) {
        await v.run(req);
    }

    const result = validationResult(req);
    if (!result.isEmpty()) {
        const details = result.array().map((e) => ({
        field: e.path,
        message: e.msg,
        }));

        const err = new Error("Validation failed");
        err.code = "VALIDATION_ERROR";
        err.details = details;
        throw err;
    }
}

module.exports = { validateArgs };

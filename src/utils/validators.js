import { check, validationResult, matchedData } from "express-validator";

import { allEntitiesModels } from "./load-generic-entities.js";

export async function validateAndExtractData(req, res, next) {
    const result = validationResult(req);
    const errors = result.array();

    if (errors.length) {
        return res.status(400).json(errors);
    }

    const data = matchedData(req);
    req.data = data;
    next();
}

const generateNameValidations = (fieldName, spaceIgnore = false) => [
    check(fieldName, `${fieldName} is required`).notEmpty(),
    spaceIgnore
        ? check(fieldName, `${fieldName} must be alphanumeric`).isAlphanumeric("en-US", {
              ignore: " ",
          })
        : check(fieldName, `${fieldName} must be alphanumeric`).isAlphanumeric(),

    check(fieldName).trim().escape(),
];

// Common validation rules for fields
const commonValidations = {
    username: generateNameValidations("username"),
    name: generateNameValidations("name"),
    full_name: generateNameValidations("full_name", true),
    email_id: [
        check("email_id", "email_id is required").notEmpty(),
        check("email_id", "Invalid email_id").isEmail(),
        check("email_id").trim().escape(),
    ],
    phone_no: [
        check("phone_no", "phone_no is required").notEmpty(),
        check("phone_no", "phone_no must be valid").isMobilePhone(),
        check("phone_no").trim().escape(),
    ],
    password: [
        check("password", "password is required").notEmpty(),
        check("password", "password must be at least 8 characters").isLength({ min: 8 }),
        check("password").trim().escape(),
    ],
    role: [
        check("role").custom((value) => {
            if (!Array.isArray(value)) {
                throw new Error("role must be an array");
            }
            if (!value.length) {
                throw new Error("role must not be empty");
            }
            if (!value.every((item) => typeof item === "string")) {
                throw new Error("Every element in the role array must be a string");
            }
            return true;
        }),
    ],
};

function validateUniqueness(etName, field) {
    const validateFieldUniqueness = async (value) => {
        const Users = allEntitiesModels.find((entity) => entity.name === etName);
        const query = { [field]: value };
        const user = await Users.model.findOne(query).exec();
        if (user) {
            throw new Error(`${field} already in use`);
        }
    };

    return check(field).custom(validateFieldUniqueness);
}

// Function to generate validation rules dynamically
export function getValidationRules(fields = [], options = {}) {
    const validationRules = [];

    fields.forEach((field) => {
        if (commonValidations[field]) {
            validationRules.push(...commonValidations[field]);
            if (field === "password" && options.isSignup) {
                validationRules.push(
                    check(
                        "password",
                        "password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number"
                    ).isStrongPassword({
                        minLength: 8,
                        minLowercase: 1,
                        minUppercase: 1,
                        minNumbers: 1,
                        minSymbols: 0,
                    })
                );
            }
        }
    });

    if (options.isSignup) {
        const entity = "users",
            fields = ["email_id", "username", "phone_no"];

        for (const field of fields) {
            validationRules.push(validateUniqueness(entity, field));
        }
    }

    return validationRules;
}

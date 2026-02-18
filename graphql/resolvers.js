const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { GraphQLUpload } = require("graphql-upload");

const User = require("../models/User");
const Employee = require("../models/Employee");

const { uploadToCloudinaryFromUpload } = require("../utils/cloudinary");
const { validateArgs } = require("../utils/validate");
const { requireAuth } = require("../utils/auth");

function toErrorDetails(err) {
    if (err?.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
        return err.details;
    }
    if (err?.code === 11000) {
        // Mongo duplicate key error
        const field = Object.keys(err.keyPattern || {})[0] || "unknown";
        return [{ field, message: `${field} already exists (must be unique)` }];
    }
    return [{ field: "general", message: err.message || "Unknown error" }];
}

module.exports = {
    Upload: GraphQLUpload,

    Query: {
        async login(_, args) {
        try {
            await validateArgs(
            {
                usernameOrEmail: { in: ["body"], isString: true, notEmpty: { errorMessage: "usernameOrEmail is required" } },
                password: { in: ["body"], isString: true, notEmpty: { errorMessage: "password is required" } },
            },
            args
            );

            // user can login with username OR email :contentReference[oaicite:31]{index=31}
            const user = await User.findOne({
            $or: [
                { username: args.usernameOrEmail },
                { email: args.usernameOrEmail.toLowerCase() },
            ],
            });

            if (!user) {
            return {
                success: false,
                message: "Invalid username/email or password",
                token: null,
                user: null,
                errors: [{ field: "usernameOrEmail", message: "User not found" }],
            };
            }

            const ok = await bcrypt.compare(args.password, user.password);
            if (!ok) {
            return {
                success: false,
                message: "Invalid username/email or password",
                token: null,
                user: null,
                errors: [{ field: "password", message: "Incorrect password" }],
            };
            }

            const secret = process.env.JWT_SECRET || "dev_secret";
            const token = jwt.sign(
            { _id: user._id.toString(), username: user.username, email: user.email },
            secret,
            { expiresIn: "2h" }
            );

            return {
            success: true,
            message: "Login successful",
            token,
            user,
            errors: [],
            };
        } catch (err) {
            return {
            success: false,
            message: "Login failed",
            token: null,
            user: null,
            errors: toErrorDetails(err),
            };
        }
        },

        async getAllEmployees(_, __, context) {
        try {
            // Optional JWT security; if you want it secured, requireAuth here.
            // requireAuth(context);
            const employees = await Employee.find().sort({ created_at: -1 });
            return { success: true, message: "Employees fetched", employees, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to fetch employees", employees: [], errors: toErrorDetails(err) };
        }
        },

        async searchEmployeeByEid(_, { eid }, context) {
        try {
            // requireAuth(context);
            const employee = await Employee.findById(eid);
            if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                employee: null,
                errors: [{ field: "eid", message: "No employee with this id" }],
            };
            }
            return { success: true, message: "Employee fetched", employee, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to search employee", employee: null, errors: toErrorDetails(err) };
        }
        },

        async searchEmployeeByDesignationOrDepartment(_, { designation, department }, context) {
        try {
            // requireAuth(context);
            if (!designation && !department) {
            return {
                success: false,
                message: "Provide designation or department",
                employees: [],
                errors: [{ field: "designation/department", message: "At least one filter is required" }],
            };
            }

            const filter = {};
            if (designation) filter.designation = designation;
            if (department) filter.department = department;

            const employees = await Employee.find(filter).sort({ created_at: -1 });
            return { success: true, message: "Employees fetched", employees, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to search employees", employees: [], errors: toErrorDetails(err) };
        }
        },
    },

    Mutation: {
        async signup(_, args) {
        try {
            await validateArgs(
            {
                username: {
                in: ["body"],
                isString: true,
                notEmpty: { errorMessage: "username is required" },
                },
                email: {
                in: ["body"],
                isEmail: { errorMessage: "email must be valid" },
                notEmpty: { errorMessage: "email is required" },
                },
                password: {
                in: ["body"],
                isString: true,
                isLength: { options: { min: 6 }, errorMessage: "password must be at least 6 chars" },
                },
            },
            args
            );

            const emailLower = args.email.toLowerCase();

            const existing = await User.findOne({
            $or: [{ username: args.username }, { email: emailLower }],
            });

            if (existing) {
            return {
                success: false,
                message: "User already exists",
                token: null,
                user: null,
                errors: [{ field: "username/email", message: "Username or email already taken" }],
            };
            }

            const hashed = await bcrypt.hash(args.password, 10);
            const user = await User.create({
            username: args.username,
            email: emailLower,
            password: hashed,
            });

            return {
            success: true,
            message: "Signup successful",
            token: null,
            user,
            errors: [],
            };
        } catch (err) {
            return {
            success: false,
            message: "Signup failed",
            token: null,
            user: null,
            errors: toErrorDetails(err),
            };
        }
        },

        async addEmployee(_, args, context) {
        try {
            // requireAuth(context);

            await validateArgs(
            {
                first_name: { in: ["body"], isString: true, notEmpty: { errorMessage: "first_name is required" } },
                last_name: { in: ["body"], isString: true, notEmpty: { errorMessage: "last_name is required" } },
                designation: { in: ["body"], isString: true, notEmpty: { errorMessage: "designation is required" } },
                salary: {
                in: ["body"],
                isFloat: { options: { min: 1000 }, errorMessage: "salary must be >= 1000" }, // :contentReference[oaicite:32]{index=32}
                },
                date_of_joining: { in: ["body"], isISO8601: { errorMessage: "date_of_joining must be a valid date (YYYY-MM-DD)" } },
                department: { in: ["body"], isString: true, notEmpty: { errorMessage: "department is required" } },
                gender: {
                in: ["body"],
                optional: true,
                isIn: { options: [["Male", "Female", "Other"]], errorMessage: "gender must be Male/Female/Other" },
                },
                email: { in: ["body"], optional: true, isEmail: { errorMessage: "email must be valid" } },
            },
            args
            );

            let photoUrl = null;

            // Photo upload to Cloudinary (required in add employee) :contentReference[oaicite:33]{index=33}
            if (args.employee_photo) {
            const uploaded = await uploadToCloudinaryFromUpload(args.employee_photo, "employees");
            photoUrl = uploaded.secure_url;
            }

            const employee = await Employee.create({
            first_name: args.first_name,
            last_name: args.last_name,
            email: args.email ? args.email.toLowerCase() : undefined,
            gender: args.gender,
            designation: args.designation,
            salary: args.salary,
            date_of_joining: new Date(args.date_of_joining),
            department: args.department,
            employee_photo: photoUrl,
            });

            return { success: true, message: "Employee created", employee, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to create employee", employee: null, errors: toErrorDetails(err) };
        }
        },

        async updateEmployeeByEid(_, args, context) {
        try {
            // requireAuth(context);

            const { eid, ...updates } = args;

            // Validate only if fields exist
            if (updates.email) {
            await validateArgs(
                { email: { in: ["body"], isEmail: { errorMessage: "email must be valid" } } },
                { email: updates.email }
            );
            updates.email = updates.email.toLowerCase();
            }
            if (updates.gender) {
            await validateArgs(
                { gender: { in: ["body"], isIn: { options: [["Male", "Female", "Other"]], errorMessage: "gender must be Male/Female/Other" } } },
                { gender: updates.gender }
            );
            }
            if (updates.salary !== undefined && updates.salary !== null) {
            await validateArgs(
                { salary: { in: ["body"], isFloat: { options: { min: 1000 }, errorMessage: "salary must be >= 1000" } } },
                { salary: updates.salary }
            );
            }
            if (updates.date_of_joining) {
            await validateArgs(
                { date_of_joining: { in: ["body"], isISO8601: { errorMessage: "date_of_joining must be a valid date (YYYY-MM-DD)" } } },
                { date_of_joining: updates.date_of_joining }
            );
            updates.date_of_joining = new Date(updates.date_of_joining);
            }

            // If a new photo is provided, upload to Cloudinary and store URL
            if (updates.employee_photo) {
            const uploaded = await uploadToCloudinaryFromUpload(updates.employee_photo, "employees");
            updates.employee_photo = uploaded.secure_url;
            } else {
            delete updates.employee_photo;
            }

            const employee = await Employee.findByIdAndUpdate(eid, updates, { new: true });
            if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                employee: null,
                errors: [{ field: "eid", message: "No employee with this id" }],
            };
            }

            return { success: true, message: "Employee updated", employee, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to update employee", employee: null, errors: toErrorDetails(err) };
        }
        },

        async deleteEmployeeByEid(_, { eid }, context) {
        try {
            // requireAuth(context);
            const employee = await Employee.findByIdAndDelete(eid);
            if (!employee) {
            return {
                success: false,
                message: "Employee not found",
                employee: null,
                errors: [{ field: "eid", message: "No employee with this id" }],
            };
            }
            return { success: true, message: "Employee deleted", employee, errors: [] };
        } catch (err) {
            return { success: false, message: "Failed to delete employee", employee: null, errors: toErrorDetails(err) };
        }
        },
    },
};

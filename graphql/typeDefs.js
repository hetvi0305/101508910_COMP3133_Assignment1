const { gql } = require("graphql-tag");

module.exports = gql`
    scalar Upload

    type User {
        _id: ID!
        username: String!
        email: String!
        created_at: String
        updated_at: String
    }

    type Employee {
        _id: ID!
        first_name: String!
        last_name: String!
        email: String
        gender: String
        designation: String!
        salary: Float!
        date_of_joining: String!
        department: String!
        employee_photo: String
        created_at: String
        updated_at: String
    }

    type ErrorDetail {
        field: String
        message: String
    }

    type AuthPayload {
        success: Boolean!
        message: String!
        token: String
        user: User
        errors: [ErrorDetail!]
    }

    type EmployeePayload {
        success: Boolean!
        message: String!
        employee: Employee
        errors: [ErrorDetail!]
    }

    type EmployeeListPayload {
        success: Boolean!
        message: String!
        employees: [Employee!]
        errors: [ErrorDetail!]
    }

    type Query {
        # 2) Query Login :contentReference[oaicite:23]{index=23}
        login(usernameOrEmail: String!, password: String!): AuthPayload!

        # 3) Query Get all employees :contentReference[oaicite:24]{index=24}
        getAllEmployees: EmployeeListPayload!

        # 5) Search employee by eid :contentReference[oaicite:25]{index=25}
        searchEmployeeByEid(eid: ID!): EmployeePayload!

        # 8) Search by designation or department :contentReference[oaicite:26]{index=26}
        searchEmployeeByDesignationOrDepartment(
        designation: String
        department: String
        ): EmployeeListPayload!
    }

    type Mutation {
        # 1) Mutation Signup :contentReference[oaicite:27]{index=27}
        signup(username: String!, email: String!, password: String!): AuthPayload!

        # 4) Mutation Add New employee + Cloudinary photo :contentReference[oaicite:28]{index=28}
        addEmployee(
        first_name: String!
        last_name: String!
        email: String
        gender: String
        designation: String!
        salary: Float!
        date_of_joining: String!
        department: String!
        employee_photo: Upload
        ): EmployeePayload!

        # 6) Mutation Update employee by eid :contentReference[oaicite:29]{index=29}
        updateEmployeeByEid(
        eid: ID!
        first_name: String
        last_name: String
        email: String
        gender: String
        designation: String
        salary: Float
        date_of_joining: String
        department: String
        employee_photo: Upload
        ): EmployeePayload!

        # 7) Mutation Delete employee by eid :contentReference[oaicite:30]{index=30}
        deleteEmployeeByEid(eid: ID!): EmployeePayload!
    }
`;

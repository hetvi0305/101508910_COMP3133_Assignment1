# COMP3133 Assignment 1 - Employee Management System (GraphQL)

**Student Name:** Hetvi Patel\
**Student ID:** 101508910\
**Course:** COMP3133 - Full Stack Development\
**Semester:** Winter 2026

------------------------------------------------------------------------

##  Project Description

This project implements a **GraphQL-based Employee Management System**
backend using **Node.js, Express, MongoDB, and Apollo Server**.

The system allows:

-   User signup and login (authentication)
-   Employee management (CRUD operations)
-   Employee photo upload to Cloudinary
-   Search employees by ID, designation, or department
-   Input validation and error handling

All APIs are implemented using GraphQL queries and mutations as required
in the assignment.

------------------------------------------------------------------------

##  Tech Stack

-   Node.js
-   Express.js
-   Apollo Server (GraphQL)
-   MongoDB (Mongoose)
-   Cloudinary (image upload)
-   bcrypt (password hashing)
-   JSON Web Token (JWT)
-   express-validator
-   Postman (API testing)

------------------------------------------------------------------------

##  Project Structure

    assignment1/
    │
    ├── server.js
    ├── package.json
    ├── README.md
    │
    ├── models/
    │   ├── User.js
    │   └── Employee.js
    │
    ├── graphql/
    │   ├── typeDefs.js
    │   └── resolvers.js
    │
    ├── utils/
    │   ├── auth.js
    │   ├── cloudinary.js
    │   └── validate.js

------------------------------------------------------------------------

##  Environment Variables

Create a `.env` file in the root folder with:

    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_secret_key

    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

------------------------------------------------------------------------

## ▶ How to Run the Project

1.  Install dependencies

    ```
    npm install
    ```

2.  Start the server

    ```
    npm run dev
    ```

3.  GraphQL endpoint:

    ```
    http://localhost:4000/graphql
    ```

------------------------------------------------------------------------

##  Sample User for Testing

You can login using:

    Username: testuser1
    Password: secret123

------------------------------------------------------------------------

##  GraphQL Operations

### User Operations

**Signup**

    mutation {
      signup(username: "testuser1", email: "testuser1@mail.com", password: "secret123") {
        success
        message
      }
    }

**Login**

    query {
      login(usernameOrEmail: "testuser1", password: "secret123") {
        success
        token
      }
    }

------------------------------------------------------------------------

### Employee Operations

**Add Employee**

    mutation {
      addEmployee(
        first_name: "John"
        last_name: "Smith"
        email: "john@mail.com"
        gender: "Male"
        designation: "Developer"
        salary: 5000
        date_of_joining: "2026-02-01"
        department: "IT"
      ) {
        success
      }
    }

**Get All Employees**

    query {
      getAllEmployees {
        success
        employees {
          _id
          first_name
          last_name
        }
      }
    }

**Search Employee by ID**

    query {
      searchEmployeeByEid(eid: "EMPLOYEE_ID") {
        success
        employee {
          first_name
          last_name
        }
      }
    }

**Search by Department / Designation**

    query {
      searchEmployeeByDesignationOrDepartment(department: "IT") {
        success
        employees {
          first_name
        }
      }
    }

**Update Employee**

    mutation {
      updateEmployeeByEid(
        eid: "EMPLOYEE_ID"
        designation: "Senior Developer"
        salary: 7000
      ) {
        success
      }
    }

**Delete Employee**

    mutation {
      deleteEmployeeByEid(eid: "EMPLOYEE_ID") {
        success
      }
    }

------------------------------------------------------------------------

##  Cloudinary Image Upload

Employee photos are uploaded to Cloudinary using the GraphQL `Upload`
scalar and stored as a URL in MongoDB.

------------------------------------------------------------------------

##  Validation Rules

-   Salary must be ≥ 1000
-   Gender must be Male / Female / Other
-   Email must be valid
-   Username & Email must be unique
-   Required fields enforced

------------------------------------------------------------------------

##  API Testing

All APIs were tested using **Postman** and screenshots are included in
the submission DOCX.

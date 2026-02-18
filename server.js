require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");

const { graphqlUploadExpress } = require("graphql-upload");

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { getUserFromAuthHeader } = require("./utils/auth");

async function start() {
    const app = express();
    app.use(cors());

    // MongoDB connect
    if (!process.env.MONGODB_URI) {
        throw new Error("Missing MONGODB_URI in .env");
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected");

    // Apollo Server
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    app.use(
        "/graphql",
        graphqlUploadExpress({ maxFileSize: 10 * 1024 * 1024, maxFiles: 1 }),
        express.json(),
        expressMiddleware(server, {
        context: async ({ req }) => {
            const user = getUserFromAuthHeader(req.headers.authorization);
            return { user };
        },
        })
    );

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`🚀 GraphQL running at http://localhost:${PORT}/graphql`);
    });
    }

    start().catch((err) => {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
});

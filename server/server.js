const express = require('express');
const path = require('path');
// import ApolloServer
const { ApolloServer } = require('apollo-server-express');

const { authMiddleware } = require('./utils/auth');
// import our typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async () => {
  // create a new Apollo server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
  });

  // Start the Apollo server
  await server.start();
  // integrate our Apollo server with the Express application as middleware
  server.applyMiddleware({ app });
  // log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};

// Initialize the Apollo server
startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Server up static assets
// check to see if the Node environment is in production
if (process.env.NODE_ENV === 'production') {
  // if it is, Express.js server will serve any files in the React app's build directory within the client folder
  app.use(express.static(path.join(__dirname, '../client/build')));
}
// wildcard GET route for the server to use if any location on the server doesn't have an explicit route defined.
// In that situation, it will respond with the production-ready React front-end code.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});

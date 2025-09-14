const { ApolloServer, gql } = require('apollo-server');

// Step 1: Define GraphQL schema
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Step 2: Define resolvers
const resolvers = {
  Query: {
    hello: () => "Hello GraphQL World!"
  }
};

// Step 3: Create Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

// Step 4: Start server
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

const { ApolloServer, gql } = require("apollo-server");
const mysql = require("mysql2/promise");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "kafka",      // change if your MySQL user is different
  password: "password", // replace with your MySQL password
  database: "graphql_books"
});

// GraphQL Schema
const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
  }

  input BookInput {
    title: String!
    author: String!
  }

  type Mutation {
    addBook(input: BookInput!): Book!
  }
`;

// Resolvers
const resolvers = {
  Query: {
    books: async () => {
      const [rows] = await pool.query("SELECT * FROM books");
      return rows;
    },
    book: async (_, { id }) => {
      const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
      return rows[0] || null;
    }
  },

  Mutation: {
    addBook: async (_, { input }) => {
      const { title, author } = input;
      const [result] = await pool.query(
        "INSERT INTO books (title, author) VALUES (?, ?)",
        [title, author]
      );

      // Return the newly created book
      return {
        id: result.insertId,
        title,
        author
      };
    }
  }
};


// Start Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

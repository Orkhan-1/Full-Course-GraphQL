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

  input UpdateBookInput {
    id: ID!
    title: String
    author: String
  }

  type Mutation {
    addBook(input: BookInput!): Book!
    updateBook(input: UpdateBookInput!): Book
    deleteBook(id: ID!): Boolean!
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
      return { id: result.insertId, title, author };
    },

    updateBook: async (_, { input }) => {
      const { id, title, author } = input;

      // Fetch current book
      const [existing] = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
      if (existing.length === 0) return null;

      // Update fields (only if provided)
      const newTitle = title || existing[0].title;
      const newAuthor = author || existing[0].author;

      await pool.query("UPDATE books SET title = ?, author = ? WHERE id = ?", [
        newTitle,
        newAuthor,
        id
      ]);

      return { id, title: newTitle, author: newAuthor };
    },

    deleteBook: async (_, { id }) => {
      const [result] = await pool.query("DELETE FROM books WHERE id = ?", [id]);
      return result.affectedRows > 0;
    }
  }
};

// Start Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

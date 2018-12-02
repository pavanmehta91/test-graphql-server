const { ApolloServer, gql } = require("apollo-server");
const fs = require("fs");
const path = require("path");
const _ = require("lodash");
const GraphQLJSON = require("graphql-type-json");
//const uuid = require('uuidv4');
const {
  users,
  questions,
  answers,
  upvotes,
  favorites
} = require("./fake-data");

// const answers = [];

const resolvers = {
  UpvoteValue: {
    UPVOTE: 1,
    DOWNVOTE: -1
  },
  JSON: GraphQLJSON,
  Query: {
    getQuestions: async (parent, args, context, info) => {
      return questions;
    },
    getUser: async (parent, args, context, info) => {
      const { id } = args;
      return users.find(u => u.id === id);
    }
  },
  Mutation: {
    addUser: (parent, args, context, info) => {
      const user = { ...args, id: users.length + 1 };
      users.push(user);
      return user;
    },
    addQuestion: (parent, args, context, info) => {
      const by = { id: 1 }; //userId
      const question = { ...args, id: questions.length + 1, by };
      questions.push(question);
      return question;
    },
    addAnswer: (parent, args, context, info) => {
      const by = { id: 1 }; //userId
      const answer = { ...args, id: answers.length + 1, by };
      answers.push(answer);
      return answer;
    },
    upvote: (parent, args, context, info) => {
      const by = { id: 1 }; //userId
      const { on, value, type } = args;
      const upvoteObj = upvotes.find(
        u => u.on === on && u.by === by.id && upvote.type === type
      );
      if (upvoteObj) {
        upvoteObj.value += value;
      } else {
        const upvote = { ...args, id: upvotes.length + 1, by };
        upvotes.push(upvote);
      }
      const upvoteOn = type === "ANSWER" ? answers : questions;
      const toUpvoteObj = upvoteOn.find(a => a.id === u.on);
      if (toUpvoteObj) toUpvoteObj.upvoteCount += value;
      return toUpvoteObj ? toUpvoteObj.upvoteCount : -1; // throw error otherwise toUpvoteObj not found
    },
    favoriteAction: (parent, args, context, info) => {
      const { on } = args;
    }
  }
};

const typeDefs = fs.readFileSync(
  path.resolve(__dirname, "./schema.graphql"),
  "utf8"
);
const server = new ApolloServer({
	cors: true,
	typeDefs,
  resolvers,
  context: ({ req }) => {
		const userId = req.headers.userId || "";
    const user = users.find(u => u.id === userId);
    return {
      user
    };
  }
});

server.listen(8080).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

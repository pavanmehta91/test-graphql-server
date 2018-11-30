const { ApolloServer, gql } = require('apollo-server');
const fs = require('fs');
const path = require('path');
const uuid = require('uuidv4');
// A map of functions which return data for the schema.
const users = [];
const questions = [];
const tags = [];
const answers = [];

const resolvers = {
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
		addUser: async (parent, args, context, info) => {
			const user = {...args, id: uuid()};
			users.push(user);
			return user;
		}
	}
};

const typeDefs = fs.readFileSync(path.resolve(__dirname, './schema.graphql'), 'utf8');
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(8080).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
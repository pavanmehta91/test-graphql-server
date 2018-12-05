const { ApolloServer, gql, ForbiddenError, AuthenticationError, UserInputError } = require("apollo-server");
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
    getAllTags: (parent, args, context, info) => {
      let tags = questions.reduce((allTags,question) => {
         return allTags.concat(question.tags.map(t => t.name));
      },[]);
      return Array.from(new Set(tags));
    },
    getQuestions: async (parent, args, context, info) => {
      const { user } = context;
      let loggedInUserID = user ? user.id : "";
      const { userId, tag } = args;
      let questionsResponse = [...questions];
      if (userId) {
        questionsResponse = questionsResponse.filter(q => q.by.id === userId); //getMyQuestions
      }
      if (tag) {
        questionsResponse = questionsResponse.filter(
          q =>
            q.tags.some(t => {
              return t.name.toLowerCase() === tag.toLowerCase();
            }) //filteredbyTags
        );
      }
      return questionsResponse.map(q => {
        q = { ...q };
        q.isFavorited = favorites.some(
          f => q.id === f.on && f.by === loggedInUserID
        );
        q.isUpvoted = upvotes.some(
          u => q.id === u.on && u.type === "QUESTION" && u.by === loggedInUserID
        );
        q.by = users.find(u=> u.id === q.by.id);
        return q;
      });
    },
    getQuestion: (parent, args, context, info) => {
      const { id } = args;
      const { user } = context;
      let loggedInUserID = user ? user.id : "";
      let question = questions.find(q => q.id === id);
      if (question) {
        question = { ...question };
        question.by = users.find(u => u.id === question.by.id);
        question.isFavorited = favorites.some(
          f => id === f.on && f.by === loggedInUserID
        );
        question.isUpvoted = upvotes.some(
          u => id === u.on && u.type === "QUESTION" && u.by === loggedInUserID
        );
        question.answers = answers
          .filter(a => a.on.id === id)
          .map(a => {
            a = { ...a };
            a.by = users.find(u=> u.id === a.by.id);
            a.isUpvoted = upvotes.some(
              u =>
                a.id === u.on && u.type === "ANSWER" && u.by === loggedInUserID
            );
            return a;
          });
        return question;
      }
      return null;
    },
    getUser: async (parent, args, context, info) => {
      let { id } = args;
      const { user } = context;
      id = user && !id ? user.id : id;
      return users.find(u => u.id === id);
    },
    getAnswers: (parent, args, context, info) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError('You must be logged in');
        //return [];
      }
      const {id: by } = user;
      return answers.filter(a => a.by.id = by);
    },
    favoritedQuestions: (parent, args, context, info) => {
      const { user } = context;
      if (!user) {
       throw new AuthenticationError('You must be logged in');
      }
      const { id: by } = user;
      let favQuestions = favorites.filter(f => by === f.by);
      return favQuestions.map(favQ=> {
        return questions.find(q=> q.id === favQ.on);
      });

    }
  },
  Mutation: {
    addUser: (parent, args, context, info) => {
      const user = { ...args, id: users.length + 1 };
      users.push(user);
      return user;
    },
    editQuestion: (parent, args, context, info) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError('You must be logged in')
      }
      const { id: by } = user;
      const { id, ...rest } = args;
      let question = questions.find(q => q.id === id);
      if (question && question.by.id === by) {
        question = { ...question, ...rest };
        const index = questions.findIndex(q => q.id === id);
        questions[index] = question;
        return question;
      } else {
        throw new ForbiddenError(`Operation Not Allowed`);
      }
    },
    addQuestion: (parent, args, context, info) => {
      const { user } = context;
      console.log({ user });
      if (!user) {
        throw new AuthenticationError('You must be logged in')
      }
      //const { id: by } = user;
      console.log("adding question");
      const question = {
        ...args,
        id: questions.length + 1,
        by: user,
        upvoteCount: 0
      };
      questions.push(question);
      return question;
    },
    addAnswer: (parent, args, context, info) => {
      const { user } = context;
      if (!user) {
        throw new AuthenticationError('You must be logged in')
      }
      const { id: by } = user;
      const answer = {
        ...args,
        id: answers.length + 1,
        by: user,
        upvoteCount: 0
      };
      answer.on = questions.find(q => q.id === answer.on);
      answers.push(answer);
      return answer;
    },
    upvote: (parent, args, context, info) => {
      const { user } = context;
      let shouldUpdateUpVoteCounter = true;
      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }
      const { id: by } = user;
      const { on, value, type } = args;
      const upvoteOn = type === "ANSWER" ? answers : questions;
      const toUpvoteObj = upvoteOn.find(a => a.id === on && a.by !== by);
      if (!toUpvoteObj || toUpvoteObj.by.id === by ) {
        throw new ForbiddenError(`Operation Not Allowed`);
      }
      const upvoteObj = upvotes.find(
        u => u.on === on && u.by.id === by && u.type === type
      );
      if (upvoteObj) {
        shouldUpdateUpVoteCounter = upvoteObj.value === value ? false: true;
        upvoteObj.value = value;
      } else {
        const upvote = { ...args, id: upvotes.length + 1, by };
        upvotes.push(upvote);
      }

      if(shouldUpdateUpVoteCounter) toUpvoteObj.upvoteCount += value;
      return toUpvoteObj.upvoteCount;
    },
    favoriteAction: (parent, args, context, info) => {
      const { on } = args;
      const { user } = context;
      if (!user) {
        throw new AuthenticationError('You must be logged in')
      }
      const { id: by } = user;
      let favObj = favorites.find(f => f.on === on && context.user.id === f.by);
      if (favObj) {
        favObj.isFavorited = !favObj.isFavorited;
      } else {
        favObj = {
          by,
          isFavorited: true,
          on
        };
        favorites.push(favObj);
      }
      return favObj.isFavorited;
    }
  }
};

const typeDefs = fs.readFileSync(
  path.resolve(__dirname, "./schema.graphql"),
  "utf8"
);
const server = new ApolloServer({
  cors: {
    origin: '*',
  },
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const userId = req.headers.userid || -1;
    const user = users.find(u => u.id === parseInt(userId, 10));
    return {
      user
    };
  }
});

server.listen(8080).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});

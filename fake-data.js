const users = [
  {
    id: 1,
    name: "Pavan"
  },
  {
    id: 2,
    name: "Dhaval"
  },
  {
    id: 3,
    name: "Khushboo"
  },
  {
    id: 4,
    name: "Nishant"
  },
  {
    id: 5,
    name: "Nihar"
  },
  {
    id: 6,
    name: "Jigar"
  },
  {
    id: 7,
    name: "Aakash"
  }
];
const questions = [
  {
    id: 1,
    upvoteCount: 0,
    title: "Which is the best mobile phone company?",
    body:
      "Can anbody explain to me in detail, with all features and prons and cons. I want to select the best phone under the budget 20k",
    tags: [
      {
        name: "mobile"
      },
      {
        name: "cell phones"
      }
    ],
    by: {
      id: 2
    }
  },
  {
    id: 2,
    title: "How to improve internet speed?",
    upvoteCount: 0,
    body: "What ways could be applied to maximize the broadband speed?",
    tags: [
      {
        name: "internet"
      }
    ],
    by: {
      id: 1
    }
  },
  {
    id: 3,
    title: "Why is the color of sky blue?",
    upvoteCount: 0,
    body: "Is there a reason behind sky's color being blue?",
    tags: [
      {
        name: "info"
      },
      {
        name: "general knowledge"
      }
    ],
    by: {
      id: 4
    }
  },
  {
    id: 4,
    title: "What is the best tool to test graphql resolvers",
    upvoteCount: 0,
    body:
      "Please suggest best GUI, CLI or web based tools to test the graphql endpoints",
    tags: [
      {
        name: "graphql"
      },
      {
        name: "schema"
      },
      {
        name: "testing"
      }
    ],
    by: {
      id: 5
    }
  }
];

const answers = [
  {
    upvoteCount: 0,
    id: 1,
    text:
      "Moto One Power is a great option. You can also go for MI A2. Both come with stock android",
    by: {
      id: 1
    },
    on: {
      id: 1
    }
  }
];
module.exports = {
  users,
  questions: questions,
  answers: answers,
  upvotes: [],
  favorites: []
};
/*
QUERIES AND MUTATIONS:
# Write your query or mutation here
mutation addUser($name:String!){
  user: addUser(name: $name){
    id
    name
  }
}

mutation addQuestion($title:String!, $body:String!, $tags: [Tags!]!){
  addQuestion(title:$title, body:$body, tags: $tags){
    id
  }
}

query getQuestions($tag:String, $userId: Int){
  questions: getQuestions(tag: $tag, userId: $userId){
    id
    isUpvoted
    isFavorited
    body
    tags
    title
    by{
      name
      id
    }
  }
}

mutation addAnswer($text:String!, $on:Int!){
  answer: addAnswer(text:$text, on: $on){
    id
    text
    by{
      id
    }
    on{
      id
    }
    upvoteCount
  }
}
query getQuestion($id: Int!){
  question:getQuestion(id: $id){
    id
    isUpvoted
    isFavorited
    body
    tags
    title
    by{
      name
      id
    }
    answers{
      id
      text
      by {
        id
        name
      }
      isUpvoted
    }
  }
}

mutation upvote($type: UpvoteType, $value: UpvoteValue, $on: Int!){
  upvote(type:$type, value: $value, on: $on)
}
mutation favoriteAction($on: Int!){
  favorited: favoriteAction(on: $on)
}

mutation editQuestion($title: String, $id: Int!){
  editQuestion(title:$title, id: $id){
    id
    title
    body
    tags
  }
}
query getAnswers{
  myAnswers: getAnswers{
    id
    text
    upvoteCount
    on{
      id
    }
  }
}

query getUser($id: Int!){
  user: getUser(id: $id){
    id
    name
  }
}
query favoritedQuestions{
  questions: favoritedQuestions{
    id
    title
    body
  }
}
query getAllTags{
  allTags: getAllTags
}
*/
const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");

// https://github.com/alexa/Topical-Chat
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "./data/unprocessedData.json")));
const users = new Array(132).fill(0).map((x) => {
  return faker.internet.userName();
});
const userCombo = [];

for (let i = 0; i < users.length - 1; i++) {
  for (let j = i + 1; j < users.length; j++) {
    userCombo.push([users[i], users[j]]);
  }
}

// 8628 conversations
// 132 C 2  = 8646
let count = 0;
const conversations = [];

for (const conversationUUID in data) {
  const conversationData = {};
  const users = userCombo[count];

  conversationData.agents = [users[0], users[1]];
  conversationData.messages = data[conversationUUID].content.map((x) => {
    return x.message;
  });

  conversations.push(conversationData);
  count++;
}

const processedData = {
  users,
  conversations
};

fs.writeFileSync(
  path.join(__dirname, "./data/processedData.json"),
  JSON.stringify(processedData, null, 4)
);

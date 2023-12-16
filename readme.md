# Presentation video

# Installation

After cloning the repository, run the following commands

`npm install`

Change the cookie secret in the `.env` file to a random string. To import the tables and the data
shown in the demo, `dump.sql` has all the schemas, as well as the data to along with it. To import
it to a database called `test` run the following command from the root of this repository:

`mariadb test < dump.sql`

To run the webapp in dev mode: `npm run dev`

To build the webapp in production mode it has to be built first:

`npm run build`

To run the production build on a specific port, pass `PORT` as en environment vairable:

`PORT=3000 npm run start`

# Description

A simple messaging webapp that can be used to:

1. Create an account and log in
2. Message other users
3. Reply to a particular message
4. Edit a message
5. Delete a message
6. Delete a chat
7. Create a group
8. Add members to a group
9. Send/edit/edit a group message
10. Delete a group
11. Change username

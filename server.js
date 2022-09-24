const express = require("express");
const PORT = process.env.PORT || 3001;
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//
const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "71219212529",
    database: "classlist_db",
  },
  console.log(`Connected to the classlist_db database.`)
);

inquirer
  .prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "Add employee",
        "Update employee role",
        "View all roles",
        "Add role",
        "View all departments",
        "Add departments",
        "Quit",
      ],
    },
  ])
  .then((answers) => console.log(answers));

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// app.listen(PORT, () => console.log(`listening at PORT ${PORT}`));

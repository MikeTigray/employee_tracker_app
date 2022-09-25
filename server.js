const express = require("express");
const PORT = process.env.PORT || 3001;
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const helper = require("./src/helper");
const {
  allRolesString,
  allDepartmentString,
  allEmployeesString,
  addDepartmentString,
} = require("./src/helper");
const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "71219212529",
    database: "employee_tracker",
  },
  console.log(`Connected to the employee_tracker database.`)
);

function startPrompts() {
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
          "Add department",
          "Quit",
        ],
      },
    ])
    .then((answers) => {
      const choice = answers.choice;
      switch (choice) {
        case "View all departments":
          db.query(allDepartmentString(), (err, results) => {
            console.table(results);
            startPrompts();
          });
          break;
        case "View all roles":
          db.query(allRolesString(), (err, results) => {
            console.table(results);
            startPrompts();
          });
          break;
        case "View all employees":
          db.query(allEmployeesString(), (err, results) => {
            console.table(results);
            startPrompts();
          });
          break;
        case "Add department":
          addDepartmentPrompt();
          break;
      }
    });
}
startPrompts();

function addDepartmentPrompt() {
  inquirer
    .prompt([
      {
        type: "input",
        name: "department",
        message: "What is the name of the department?",
      },
    ])
    .then((answer) => {
      const department = answer.department;

      db.query(
        `INSERT INTO department (name) VALUES (?);`,
        department,
        (err, result) => {
          err ? console.log(err) : console.log(result);
          startPrompts();
        }
      );
    });
}

// If request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// app.listen(PORT, () => console.log(`listening at PORT ${PORT}`));

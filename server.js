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

let employeeArray = [];
let rolesArray = [];

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "71219212529",
    database: "employee_tracker",
  },
  console.log(`Connected to the employee_tracker database.`)
);
startPrompts();
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
          addDepartmentPrompts();
          break;
        case "Add role":
          addRolePrompts();
          break;
        case "Add employee":
          addEmployee();
          break;
        case "Update employee role":
          updateEmployee();
          break;
        case "Quit":
          process.exit();
      }
    });
}

function addDepartmentPrompts() {
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
          err
            ? console.log(err)
            : console.log(`Added ${department} to the database.`);
          startPrompts();
        }
      );
    });
}
function addRolePrompts() {
  let array = [];
  db.query(allDepartmentString(), (err, result) => {
    result.forEach((element) => array.push(element.name));
  });

  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What is the name of the role?",
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of the role?",
      },
      {
        type: "list",
        name: "department",
        message: "Which department does the role belong to?",
        choices: array,
      },
    ])
    .then((results) => {
      let { role, salary, department } = results;
      // To find department_id from array of roles
      const departmentId = array.indexOf(department) + 1;

      db.query(
        `INSERT INTO role(title,salary,department_id) VALUES ('${role}','${salary}','${departmentId}');`,
        (err, result) => {
          err ? console.log(err) : console.log(`Added ${role} to database.`);
          startPrompts();
        }
      );
    });
}

function addEmployee() {
  let rolesArray = [];
  let managersArray = [];
  db.query(allRolesString(), (err, result) => {
    err
      ? console.log(err)
      : result.forEach((element) => rolesArray.push(element.title));
  });
  db.query(
    `SELECT id, CONCAT(first_name," " ,last_name) AS Manager FROM employee;`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      result.forEach((element) => {
        managersArray.push(element.Manager);
      });
    }
  );

  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "last_name",
        message: "What is the employee's last name?",
      },
      {
        type: "list",
        name: "role",
        message: "What is the employee's role?",
        choices: rolesArray,
      },
      {
        type: "list",
        name: "manager",
        message: "Who is the employee's manager?",
        choices: managersArray,
      },
    ])
    .then((results) => {
      let { first_name, last_name, role, manager } = results;
      const managerId = managersArray.indexOf(manager) + 1;
      const role_id = rolesArray.indexOf(role) + 1;

      db.query(
        `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ('${first_name}','${last_name}',${role_id},${managerId})`,
        (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log(`Added ${first_name + " " + last_name} to the database.`);
        }
      );
      startPrompts();
    });
}
// Renders all employee's full names from query into roles array
function getEmployees() {
  return db
    .promise()
    .query(
      `SELECT id, CONCAT(first_name," " ,last_name) AS full_name FROM employee;`
    );
}
// Renders all roles from query into roles array
function getRoles() {
  db.promise()
    .query(`SELECT title FROM role`)
    .then((result) => {
      result[0].forEach((element) => rolesArray.push(element.title));
    });
}
function updateEmployee() {
  getEmployees()
    .then((data) => {
      getRoles();

      data[0].forEach((element) => employeeArray.push(element.full_name));
    })
    .then(() => {
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Which employee do you want to update?",
            choices: employeeArray,
          },
          {
            type: "list",
            name: "role",
            message: "Which role do you want to assign the selected employee?",
            choices: rolesArray,
          },
        ])
        .then(({ employee, role }) => {
          const firstName = employee.split(" ")[0];
          const role_id = rolesArray.indexOf(role) + 1;

          db.promise()
            .query(
              `UPDATE employee SET role_id= ${role_id} WHERE first_name="${firstName}";`
            )
            .then((result) => {
              db.query(allEmployeesString(), (err, result) =>
                err ? console.log(err) : console.table(result)
              );

              startPrompts();
            });

          startPrompts();
        })
        .catch((err) => console.log(err));
    });
}

// If request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

// app.listen(PORT, () => console.log(`listening at PORT ${PORT}`));

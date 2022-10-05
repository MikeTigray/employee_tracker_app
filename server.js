const express = require("express");
const PORT = process.env.PORT || 3001;
const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const {
  allRolesString,
  allDepartmentString,
  allEmployeesString,
} = require("./src/helper");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// For update employee role function(Store employees and roles)
let employeeArray = [];
let rolesArray = [];

const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "",
    database: "employee_tracker",
  },
  console.log(`Connected to the employee_tracker database.`, startPrompts())
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

      db.promise()
        .query(`INSERT INTO department (name) VALUES ('${department}');`)
        .then(() => {
          console.log(`Added ${department} to the database.`);
          startPrompts();
        })
        .catch((err) => console.log(err));
    });
}

function addRolePrompts() {
  let array = [];
  let choices = [];

  db.promise()
    .query(allDepartmentString())
    .then((result) => {
      result[0].forEach((element) => {
        array.push({ name: element.name, value: element.id });
      });

      array.forEach((dep) => {
        choices.push(dep.name);
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
            choices: choices,
          },
        ])
        .then((results) => {
          let { role, salary, department } = results;

          let department_id;

          for (i = 0; i < array.length; i++) {
            if (department === array[i].name) {
              department_id = array[i].value;
            }
          }
          db.query(
            `INSERT INTO role(title,salary,department_id) VALUES ('${role}',${parseInt(
              salary
            )},${department_id});`,
            (err, result) => {
              err
                ? console.log(err)
                : console.log(`Added ${role} to database.`);
              startPrompts();
            }
          );
        });
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

      db.promise()
        .query(
          `INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES ('${first_name}','${last_name}',${role_id},${managerId})`
        )
        .then((results) => {
          console.log(`Added ${first_name + " " + last_name} to the database.`);
          startPrompts();
        })
        .catch((err) => console.log(err));
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
              console.log(`Updates employee's role!`);

              startPrompts();
            });
        })
        .catch((err) => console.log(err));
    });
}

// If request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => console.log(`listening at PORT ${PORT}`));

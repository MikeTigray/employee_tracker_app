const express = require("express");
const PORT = process.env.PORT || 3001;
const mysql = require("mysql2");
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
    password: "",
    database: "classlist_db",
  },
  console.log(`Connected to the classlist_db database.`)
);

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => console.log(`listening at PORT ${PORT}`));

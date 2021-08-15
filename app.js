const express = require("express");
const { open } = require("sqlite");

const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sqlite3 = require("sqlite3").verbose();

const db_name = path.join(__dirname, "usersData", "user.db");

const app = express();

app.use(express.json());

app.set("views", path.join(__dirname, "views"));

let database = new sqlite3.Database(db_name, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

app.get("/", (req, res) => {
  res.send("Hello world...");
});

const sql_create = `CREATE TABLE user(
  userid INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  age INTEGER,
  gender VARCHAR(100),
  company VARCHAR(200),
  designation VARCHAR(200),
  about TEXT
);`;

database.run(sql_create, (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the  table");
});

const authenticateToken = (request, response, next) => {
  let jwtToken;
  const authHeader = request.headers["authorization"];
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
      if (payload) {
        request.username = payload.username;
        next();
      } else {
        response.status(401);
        response.send("Invalid JWT Token");
        console.log("Error");
      }
    });
  }
};

/* API 1 */

app.post("/signup/", async (request, response) => {
  const {
    username,
    password,
    email,
    gender,
    age,
    company,
    designation,
    about,
  } = request.body;

  const checkQuerry = `SELECT * FROM user WHERE email='${email}';`;
  const check = await database.get(checkQuerry);

  if (check !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    if (password.length < 8) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const add = `INSERT INTO user (username,password,gender,email,age,company.designation,about)
            VALUES ('${username}','${hashedPassword}','${email}','${gender}','${company}','${designation}',
        '${about}',${age}});`;
      await database.run(add);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

/* API 2 */

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;

  const selectUserQuery = `SELECT * FROM user WHERE email = '${email}';`;
  const databaseUser = await database.get(selectUserQuery);
  console.log(databaseUser);
  if (databaseUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatched = await bcrypt.compare(
      password,
      databaseUser.password
    );
    if (isPasswordMatched === true) {
      const payload = {
        username: username,
      };
      const jwtToken = jwt.sign(payload, "MY_SECRET_TOKEN");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API 3
app.get("/allusers/", authenticateToken, async (request, response) => {
  const query = "SELECT * FROM user";
  const result = await database.all(querry);
  response.send(result);
});

//API 4
app.get("/user/:userId/", authenticateToken, async (request, response) => {
  const { userId } = this.request.params;
  const querry = `SELECT * FROM user WHERE userid=${userId}`;
  const result = await get(querry);
});

//API 5
app.put("/user/:userId", authenticateToken, async (request, response) => {
  const { userId } = request.params;
  const userDetails = request.body;

  const {
    username,
    password,
    email,
    gender,
    designation,
    about,
    age,
    company,
  } = userDetails;
  const updateUserQuery = `
    UPDATE
      user
    SET
       username='${username}',
      password=${password},
      email=${email},
      gender=${gender},
      designation=${designation},
      about='${about}',
      age=${age},
      company='${company}',
    WHERE
      user_id = ${userId};`;
  await db.run(updateUserQuery);
  response.send("User Updated Successfully");
});

//API 6
app.delete("/user/:userId/", async (request, response) => {
  const { userId } = request.params;
  const deleteUserQuery = `
    DELETE FROM
      user
    WHERE
      user_id = ${userId};`;
  await db.run(deleteuserQuery);
  response.send("User Deleted Successfully");
});

// close the database connection
database.close((err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Close the database connection.");
});

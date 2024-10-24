import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "vernon",
  host: "localhost",
  database: "travel",
  password: "admin",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

// let users = [
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];
async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
async function getUsers() {
  const result = await db.query("SELECT * FROM users");
  let users = [];
  result.rows.forEach((user) => {
    users.push(user);
  });
  return users;
}
async function getUserCountries(user_id) {
  const result = await db.query(
    `SELECT country_code FROM visited_countries WHERE user_id = ${user_id}`
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  console.log(countries);
  return countries;
}
async function getUserColors(user_id) {
  const result = await db.query(
    `SELECT color FROM users WHERE users.id = ${user_id}`
  );
  let colors = [];
  result.rows.forEach((color) => {
    colors.push(color.color);
  });
  return colors;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const users = await getUsers();
  const colors = await getUserColors(currentUserId);
  const userCountries = await getUserCountries(currentUserId)
  res.render("index.ejs", {
    countries: userCountries,
    total: userCountries.length,
    users: users,
    color: colors,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  const user = req.body.user;
  // const currentUser = await getCurrentUser();

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    console.log("country code", currentUserId);

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        `INSERT INTO visited_countries (country_code, user_id) VALUES('${countryCode}', '${currentUserId}')`
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const newUser = req.body.name;
  const color = req.body.color;
  try {
   const result = await db.query(
      `INSERT INTO users (name, color) VALUES('${newUser}', '${color}') RETURNING id`
    );
    const id = result.rows[0].id;
  currentUserId = id;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

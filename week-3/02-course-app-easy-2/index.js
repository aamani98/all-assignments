const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "MYSecret";

const generateJWTToken = (payload) => jwt.sign(payload, secretKey, { expiresIn: "1h" });

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["Authorization"];
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secretKey, (err, usr) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = usr;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};
// Admin routes
app.post("/admin/signup", (req, res) => {
  // logic to sign up admin
  const { username, password } = req.body;
  const admin = ADMINS.find((a) => a.username === username && a.password === password);
  if (admin) return res.json({ message: "Admin already exists" }).status(403);
  const token = generateJWTToken({ username });
  return res.json({ message: "Admin created successfully", token }).status(201);
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if (admin) {
    return res.json({
      message: "Logged in successfully",
      token: generateJWTToken({ username: req.headers.username }),
    });
  } else return res.json({ messgae: "Invalid credentials" }).status(400);
});

app.post("/admin/courses", verifyJWT, (req, res) => {
  // logic to create a course
  const { title, description, price, imageLink, published } = req.body;
  const courseId = Date.now();
  COURSES.push({ title, description, price, imageLink, published, courseId });
  res.json({ message: "Course created successfully", courseId }).status(201);
});

app.put("/admin/courses/:courseId", verifyJWT, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const courseIndex = COURSES.findIndex((c) => c.courseId === courseId);
  if (courseIndex === -1) return res.json({ messgae: "Course not find" }).send(404);
  else {
    COURSES[courseIndex] = { ...COURSES[courseIndex], ...req.body };
    return res.json({ message: "Course updated successfully" });
  }
});

app.get("/admin/courses", verifyJWT, (req, res) => {
  // logic to get all courses
  return res.json({ courses: COURSES });
});

// User routes
app.post("/users/signup", (req, res) => {
  // logic to sign up user
  const { username, password } = req.body;
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (user) return res.json({ messgae: "User already exists" }).status(403);
  else {
    USERS.push({ username, password, purchasedCourses: [] });
    res.json({ messgae: "User created successfully", token: generateJWTToken({ username }) });
  }
});

app.post("/users/login", (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (user) {
    res.json({ message: "Logged in successfully", token: generateJWTToken({ username }) });
  } else return res.json({ message: "Invalid Credentials" }).status(403);
});

app.get("/users/courses", verifyJWT, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES });
});

app.post("/users/courses/:courseId", (req, res) => {
  // logic to purchase a course
  const courseID = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.courseId === courseID);
  if (course) {
    const user = USERS.find((u) => u.username === req.user.username);
    if (user) {
      user.purchasedCourses.push(courseID);
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    return res.json({ message: "Course not found" }).status(404);
  }
});

app.get("/users/purchasedCourses", (req, res) => {
  // logic to view purchased courses
  const user = USERS.find((u) => u.username === req.user.username);
  if (user) {
    var purchasedCourseIds = user.purchasedCourses;
    const purchasedCourses = COURSES.filter((c) => purchasedCourseIds.findIndex(c.courseID) !== -1);
    return res.json({ purchasedCourses });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

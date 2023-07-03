const express = require("express");
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = ADMINS.find((admin) => admin.username === username && admin.password === password);
  if (admin) next();
  else return res.json({ messgae: "Invalid credentials" }).status(400);
};

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (user) {
    req.user = user;
    next();
  } else return res.json({ message: "Invalid Credentials" }).status(403);
};

// Admin routes
app.post("/admin/signup", (req, res) => {
  const { username, password } = req.body;
  const admin = ADMINS.find((admin) => admin.username === username);

  if (admin) return res.json({ messgae: "Admin already exists" }).status(403);

  ADMINS.push({ username, password });
  res.json({ message: "Admin created successfully" }).status(201);
  // logic to sign up admin
});

app.post("/admin/login", adminAuthentication, (req, res) => {
  // logic to log in admin
  res.json({ message: "Logged in successfully" }).status(200);
});

app.post("/admin/courses", adminAuthentication, (req, res) => {
  const { title, description, price, imageLink, published } = req.body;
  const courseId = Date.now();
  COURSES.push({ title, description, price, imageLink, published, courseId });
  res.json({ message: "Course created successfully", courseId }).status(201);
  // logic to create a course
});

app.put("/admin/courses/:courseId", adminAuthentication, (req, res) => {
  const courseId = parseInt(req.params);
  const courseIndex = COURSES.findIndex((c) => c.courseId === courseId);
  if (courseIndex === -1) return res.json({ messgae: "Course not find" }).send(400);
  else {
    COURSES[courseIndex] = { ...COURSES[courseIndex], ...req.body };
    return res.json({ message: "Course updated successfully" });
  }
  // logic to edit a course
});

app.get("/admin/courses", adminAuthentication, (req, res) => {
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
  }
});

app.post("/users/login", userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: "Logged in successfully" });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  // logic to list all courses
  return res.json({ courses: COURSES });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  // logic to purchase a course
  const courseID = parseInt(req.params.courseId);
  const course = COURSES.find((c) => c.courseId === courseID);
  if (course) {
    req.user.purchasedCourses.push(courseID);
    return res.json({ message: "Course purchased successfully" });
  } else {
    return res.json({ message: "Course not found" }).status(404);
  }
});

app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  // logic to view purchased courses
  var purchasedCourseIds = req.user.purchasedCourses;
  const purchasedCourses = COURSES.filter((c) => purchasedCourseIds.findIndex(c.courseID) !== -1);
  return res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

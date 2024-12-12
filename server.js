const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;


mongoose.connect("mongodb://127.0.0.1:27017/StudentManagement?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.4", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Successfully connected to MongoDB.");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });


const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  studentId: String,
  department: String,
  gender: String,
});

const Student = mongoose.model("Student", studentSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Fetch all students
app.get("/students", async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

// Add a new student
app.post("/add-student", async (req, res) => {
  const newStudent = new Student(req.body);
  await newStudent.save();
  res.redirect("/");
});

// Render edit form with existing data
app.get("/edit-student/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).send("Student not found");
  }
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Edit Student</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
    </head>
    <body>
      <div class="container mt-5">
        <h1 class="text-center">Edit Student</h1>
        <form action="/edit-student/${student._id}" method="POST">
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" name="name" class="form-control" value="${
              student.name
            }" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" name="email" class="form-control" value="${
              student.email
            }" required>
          </div>
          <div class="mb-3">
            <label for="studentId" class="form-label">Student ID</label>
            <input type="text" name="studentId" class="form-control" value="${
              student.studentId
            }" required>
          </div>
          <div class="mb-3">
            <label for="department" class="form-label">Department</label>
            <input type="text" name="department" class="form-control" value="${
              student.department
            }" required>
          </div>
          <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select name="gender" class="form-control" required>
              <option value="Male" ${
                student.gender === "Male" ? "selected" : ""
              }>Male</option>
              <option value="Female" ${
                student.gender === "Female" ? "selected" : ""
              }>Female</option>
              <option value="Other" ${
                student.gender === "Other" ? "selected" : ""
              }>Other</option>
            </select>
          </div>
          <button type="submit" class="btn btn-success">Update</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Update student details
app.post("/edit-student/:id", async (req, res) => {
  await Student.findByIdAndUpdate(req.params.id, req.body);
  res.redirect("/");
});

// Delete a student
app.post("/delete-student/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

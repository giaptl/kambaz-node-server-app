import CoursesDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);

  const findAllCourses = async (req, res) => {
    const courses = await dao.findAllCourses();
    res.json(courses);
  };

const findCoursesForEnrolledUser = async (req, res) => {
  const currentUser = req.session["currentUser"];
  if (!currentUser) {
    res.sendStatus(401);
    return;
  }
  const courses = await enrollmentsDao.findCoursesForUser(currentUser._id);
  res.json(courses);
};

  const createCourse = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const newCourse = await dao.createCourse(req.body);
    await enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const deleteCourse = async (req, res) => {
    const { courseId } = req.params;
    await enrollmentsDao.unenrollAllUsersFromCourse(courseId);
    await dao.deleteCourse(courseId);
    res.sendStatus(200);
  };

  const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    await dao.updateCourse(courseId, courseUpdates);
    res.sendStatus(200);
  };

const enrollUserInCourse = async (req, res) => {
  try {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const { uid, cid } = req.params;
    const userId = (uid === "current" || !uid) ? currentUser._id : uid;
    const status = await enrollmentsDao.enrollUserInCourse(userId, cid);
    res.send(status);
  } catch (err) {
    console.log("enroll error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

  const unenrollUserFromCourse = async (req, res) => {
  try {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    const { uid, cid } = req.params;
    const userId = (uid === "current" || !uid) ? currentUser._id : uid;
    const status = await enrollmentsDao.unenrollUserFromCourse(userId, cid);
    res.send(status);
  } catch (err) {
    console.log("unenroll error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

  const findUsersForCourse = async (req, res) => {
    const { cid } = req.params;
    const users = await enrollmentsDao.findUsersForCourse(cid);
    res.json(users);
  };

  // IMPORTANT: /current/courses must come BEFORE /:userId/courses
app.get("/api/users/current/courses", findCoursesForEnrolledUser);
app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
app.post("/api/users/current/courses/:cid", enrollUserInCourse);
app.post("/api/users/current/courses", createCourse);
app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
app.delete("/api/users/current/courses/:cid", unenrollUserFromCourse);
app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
app.get("/api/courses/:cid/users", findUsersForCourse);
app.get("/api/courses", findAllCourses);
app.delete("/api/courses/:courseId", deleteCourse);
app.put("/api/courses/:courseId", updateCourse);
}
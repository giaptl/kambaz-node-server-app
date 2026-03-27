import CoursesDao from "./dao.js";
import EnrollmentsDao from "../enrollments/dao.js";

export default function CourseRoutes(app, db) {
  const dao = CoursesDao(db);
  const enrollmentsDao = EnrollmentsDao(db);

  const findAllCourses = (req, res) => {
    const courses = dao.findAllCourses();
    res.json(courses);
  };

  const findCoursesForEnrolledUser = (req, res) => {
    let { userId } = req.params;
    console.log("RAW userId param:", JSON.stringify(userId));
    console.log("session currentUser:", req.session["currentUser"]);
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return;
      }
      userId = currentUser._id;
    }
    console.log("resolved userId:", userId);
    const courses = dao.findCoursesForEnrolledUser(userId);
    console.log("result:", courses);
    res.json(courses);
  };

  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = dao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };

  const deleteCourse = (req, res) => {
    const { courseId } = req.params;
    dao.deleteCourse(courseId);
    res.sendStatus(200);
  };

  const updateCourse = (req, res) => {
    const { courseId } = req.params;
    const courseUpdates = req.body;
    const updated = dao.updateCourse(courseId, courseUpdates);
    res.json(updated);
  };

  // DEBUG
  app.get("/api/debug/session", (req, res) => {
    const currentUser = req.session["currentUser"] || null;
    const userId = currentUser?._id;
    const matchingEnrollments = userId
      ? db.enrollments.filter((e) => e.user === userId)
      : [];
    res.json({
      currentUser,
      matchingEnrollments,
      allEnrollments: db.enrollments.slice(0, 5),
    });
  });

  // IMPORTANT: /current/courses must come BEFORE /:userId/courses
  app.get("/api/users/current/courses", findCoursesForEnrolledUser);
  app.get("/api/users/:userId/courses", findCoursesForEnrolledUser);
  app.post("/api/users/current/courses", createCourse);
  app.get("/api/courses", findAllCourses);
  app.delete("/api/courses/:courseId", deleteCourse);
  app.put("/api/courses/:courseId", updateCourse);
}
import model from "./model.js";

export default function EnrollmentsDao(db) {
async function findCoursesForUser(userId) {
  const enrollments = await model.find({ user: userId }).populate("course");
  console.log("enrollments found:", enrollments.length);
  enrollments.forEach(e => console.log("enrollment:", e._id, "course:", e.course));
  return enrollments
    .map((enrollment) => enrollment.course)
    .filter((course) => course !== null);
}

  async function findUsersForCourse(courseId) {
    const enrollments = await model.find({ course: courseId }).populate("user");
    return enrollments.map((enrollment) => enrollment.user);
  }

async function enrollUserInCourse(userId, courseId) {
  const existing = await model.findById(`${userId}-${courseId}`);
  if (existing) return existing;
  return model.create({
    user: userId,
    course: courseId,
    _id: `${userId}-${courseId}`,
  });
}

  function unenrollUserFromCourse(userId, courseId) {
    return model.deleteOne({ user: userId, course: courseId });
  }

  function unenrollAllUsersFromCourse(courseId) {
    return model.deleteMany({ course: courseId });
  }

  function findEnrollmentsForUser(userId) {
    return model.find({ user: userId });
  }

  return {
    findCoursesForUser,
    findUsersForCourse,
    enrollUserInCourse,
    unenrollUserFromCourse,
    unenrollAllUsersFromCourse,
    findEnrollmentsForUser,
  };
}
const express = require("express");
const taskController = require("../controllers/taskController");
const router = express.Router();

router.post("/tasks", taskController.createTask);
router.get("/tasks", taskController.getAllTasks);
router.get("/tasks/:Id", taskController.getTaskById);
router.put("/tasks/:Id", taskController.updateTask);
router.delete("/tasks/:Id", taskController.deleteTask);
module.exports = router;
const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { authenticateToken } = require("./middleware/auth");
const pool = require("./database");

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Task API",
            version: "1.0.0",
        },
        servers: [{
            url: "http://localhost:5000",
        }, ],
    },
    apis: ["server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary:
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered successfully
 *       400:
 *         description: Invalid input
 */
app.post("/register", async(req, res) => {
    const { email, password, passwordConfirmation } = req.body;

    if (password !== passwordConfirmation) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const newUser = await pool.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, hashedPassword]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error creating user" });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary:
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Unauthorized
 */
app.post("/login", async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [
            email,
        ]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);

        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ userId: user.rows[0].id },
            process.env.JWT_SECRET, { expiresIn: "1h" }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error during authentication" });
    }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary:
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Invalid input
 */
app.post("/tasks", authenticateToken, async(req, res) => {
    const { title, description, priority, status } = req.body;
    const userId = req.user.userId;

    try {
        const newTask = await pool.query(
            "INSERT INTO tasks (title, description, priority, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *", [title, description, priority, status, userId]
        );
        res.status(201).json(newTask.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error creating task" });
    }
});

/**
 * @swagger
 * /tasks/:Id:
 *   get:
 *     summary:
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Details
 *       404:
 *         description: Not found
 *
 */

app.get("/tasks/:Id", authenticateToken, async(req, res) => {
    const taskId = req.params.id;

    try {
        const task = await pool.query(
            "SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [taskId, req.user.userId]
        );

        if (task.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(task.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error fetching task" });
    }
});

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary:
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: A list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 */

app.get("/tasks", authenticateToken, async(req, res) => {
    try {
        const tasks = await pool.query("SELECT * FROM tasks WHERE user_id = $1", [
            req.user.userId,
        ]);
        res.json(tasks.rows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

/**
 * @swagger
 * /tasks/:Id:
 *   put:
 *     summary:
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 *
 */

app.put("/tasks/:Id", authenticateToken, async(req, res) => {
    const taskId = req.params.id;
    const { title, description, priority, status } = req.body;

    try {
        const updatedTask = await pool.query(
            "UPDATE tasks SET title = $1, description = $2, priority = $3, status = $4 WHERE id = $5 AND user_id = $6 RETURNING *", [title, description, priority, status, taskId, req.user.userId]
        );

        if (updatedTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json(updatedTask.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error updating task" });
    }
});

/**
 * @swagger
 * /tasks/:Id:
 *   delete:
 *     summary:
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */

app.delete("/tasks/:Id", authenticateToken, async(req, res) => {
    const taskId = req.params.id;

    try {
        const deletedTask = await pool.query(
            "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *", [taskId, req.user.userId]
        );

        if (deletedTask.rows.length === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting task" });
    }
});

app.listen(5000, port, () => {
    console.log(`Server is running on port ${port}`);
});
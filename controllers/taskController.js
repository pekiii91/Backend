exports.createTask = async(req, res) => {
    try {
        const task = await task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAllTasks = async(req, res) => {
    try {
        const tasks = await tasks.findAll();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getTaskById = async(req, res) => {
    try {
        const task = await task.findOne({ where: { id: req.params.id } });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateTask = async(req, res) => {
    try {
        const task = await task.update(req.body, { where: { id: req.params.id } });
        if (!task[0]) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteTask = async(req, res) => {
    try {
        const task = await task.destroy({ where: { id: req.params.id } });
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
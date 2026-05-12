import express from "express";
import pool from "../config/db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//  CREATE TASK
router.post("/", auth, async (req, res) => {
  try {
    const { project_id, title, description, due_date } = req.body;

    // check project belongs to user
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [project_id, req.user],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const newTask = await pool.query(
      `INSERT INTO tasks (project_id, title, description, due_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, title, description, due_date],
    );

    res.json(newTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//  GET TASKS FOR A PROJECT
router.get("/:projectId", auth, async (req, res) => {
  try {
    const { projectId } = req.params;

    // verify project ownership
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [projectId, req.user],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId],
    );

    res.json(tasks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//  UPDATE TASK
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;

    // verify task belongs to user (through project)
    const task = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND p.user_id = $2`,
      [id, req.user],
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = await pool.query(
      `UPDATE tasks
       SET title = $1,
           description = $2,
           status = $3,
           due_date = $4
       WHERE id = $5
       RETURNING *`,
      [title, description, status, due_date, id],
    );

    res.json(updatedTask.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//  DELETE TASK
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await pool.query(
      `SELECT t.* FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND p.user_id = $2`,
      [id, req.user],
    );

    if (task.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;

import express from "express";
import pool from "../config/db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// CREATE PROJECT
router.post("/", auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    const newProject = await pool.query(
      "INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [req.user, title, description],
    );

    res.json(newProject.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// GET ALL PROJECTS FOR LOGGED USER
router.get("/", auth, async (req, res) => {
  try {
    const projects = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user],
    );

    res.json(projects.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// UPDATE PROJECT
router.put("/:id", auth, async (req, res) => {
  const { title } = req.body;

  const updated = await pool.query(
    "UPDATE projects SET title = $1 WHERE id = $2 RETURNING *",
    [title, req.params.id],
  );

  res.json(updated.rows[0]);
});

// DELETE PROJECT
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // make sure project belongs to user
    const project = await pool.query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, req.user],
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);

    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

export default router;

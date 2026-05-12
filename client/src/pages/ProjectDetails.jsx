import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const [dueDate, setDueDate] = useState("");

  // LOAD TASKS
  const loadTasks = async () => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [id]);

  // ADD TASK
  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    try {
      await API.post("/tasks", {
        project_id: Number(id),
        title,
        due_date: dueDate || null,
      });

      setTitle("");
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // TOGGLE TASK STATUS
  const toggleTask = async (task) => {
    try {
      await API.put(`/tasks/${task.id}`, {
        ...task,
        status: task.status === "done" ? "todo" : "done",
      });

      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE TASK
  const deleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          ← Back to Projects
        </Button>

        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>

      {/* ADD TASK */}
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <Input
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {/* DUE DATE */}
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Button>Add</Button>
      </form>

      {/* TASK LIST */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex justify-between items-center p-3 hover:bg-gray-50 transition">
              {/* LEFT SIDE */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.status === "done"}
                  onCheckedChange={() => toggleTask(task)}
                />
                <div>
                  <span
                    className={
                      task.status === "done" ? "line-through text-gray-400" : ""
                    }
                  >
                    {task.title}
                  </span>

                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* DELETE */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteTask(task.id)}
              >
                ✕
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

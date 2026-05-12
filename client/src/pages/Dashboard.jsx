import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const navigate = useNavigate();
  // Load projects
  const fetchProjects = async () => {
    try {
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // CREATE
  const createProject = async (e) => {
    e.preventDefault();

    await API.post("/projects", {
      title,
      description,
    });

    setTitle("");
    setDescription("");
    fetchProjects();
  };

  // DELETE
  const deleteProject = async (id) => {
    await API.delete(`/projects/${id}`);
    fetchProjects();
  };

  // UPDATE
  const updateProject = async (id) => {
    await API.put(`/projects/${id}`, {
      title: editTitle,
    });

    setEditingId(null);
    setEditTitle("");
    fetchProjects();
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>

        <Button
          variant="destructive"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </Button>
      </div>

      {/* CREATE PROJECT */}

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mb-4">+ New Project</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
          </DialogHeader>

          <form onSubmit={createProject} className="flex flex-col gap-2 mt-4">
            <Input
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Button>Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-3 gap-4">
        {projects.map((p) => (
          <Card
            key={p.id}
            className="
    relative overflow-hidden
    hover:shadow-xl hover:-translate-y-1
    transition-all duration-300
    cursor-pointer
    border
    bg-card
  "
          >
            {/* COLOR STRIPE */}
            <div
              className={`
      absolute top-0 left-0 h-full w-2

      ${
        [
          "bg-blue-300",
          "bg-purple-300",
          "bg-pink-300",
          "bg-emerald-300",
          "bg-cyan-300",
          "bg-amber-300",
          "bg-rose-300",
          "bg-indigo-300",
          "bg-lime-300",
          "bg-teal-300",
        ][p.id % 10]
      }
    `}
            />
            <CardContent className="p-4">
              {/* CLICK AREA */}
              <div
                onClick={() => {
                  if (editingId !== p.id) {
                    navigate(`/projects/${p.id}`);
                  }
                }}
                style={{ cursor: editingId === p.id ? "default" : "pointer" }}
              >
                {editingId === p.id ? (
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                ) : (
                  <>
                    <h3 className="text-lg font-semibold">{p.title}</h3>

                    <p className="text-gray-500 text-sm">{p.description}</p>
                  </>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-3">
                {editingId === p.id ? (
                  <Button size="sm" onClick={() => updateProject(p.id)}>
                    Save
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditTitle(p.title);
                    }}
                  >
                    Edit
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteProject(p.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

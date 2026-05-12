import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";

import { Menu, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppLayout({ children }) {
  const [projects, setProjects] = useState([]);
  const [tasksByProject, setTasksByProject] = useState({});

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();

  const getInitials = () => {
    if (!user) return "?";

    if (user.username) {
      return user.username
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }

    return user.email?.[0]?.toUpperCase() || "?";
  };

  const loadData = async () => {
    try {
      const res = await API.get("/projects");

      const projectList = Array.isArray(res.data) ? res.data : [];

      setProjects(projectList);

      const taskMap = {};

      for (let p of projectList) {
        try {
          const tasksRes = await API.get(`/tasks/${p.id}`);

          taskMap[p.id] = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        } catch {
          taskMap[p.id] = [];
        }
      }

      setTasksByProject(taskMap);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:static z-50 top-0 left-0 h-full
          w-72 bg-slate-900 text-white p-4
          transform transition-transform duration-300

          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* TOP */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">FlowHive</h1>

          {/* MOBILE CLOSE */}
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* DASHBOARD LINK */}
        <Link
          to="/dashboard"
          className="block p-2 rounded hover:bg-slate-800 mb-4"
          onClick={() => setSidebarOpen(false)}
        >
          Dashboard
        </Link>

        {/* PROJECTS */}
        <Accordion type="multiple" className="w-full">
          {(Array.isArray(projects) ? projects : []).map((project) => (
            <AccordionItem key={project.id} value={String(project.id)}>
              <AccordionTrigger
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                {project.title}
              </AccordionTrigger>

              <AccordionContent>
                <div className="pl-2 space-y-1">
                  {(tasksByProject[project.id] || []).map((task) => (
                    <div
                      key={task.id}
                      className="text-sm text-gray-300 hover:text-white cursor-pointer"
                      onClick={() => {
                        navigate(`/projects/${project.id}`);
                        setSidebarOpen(false);
                      }}
                    >
                      • {task.title}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-auto">
        {/* TOPBAR */}
        <div className="p-4 border-b flex items-center gap-2">
          {/* MOBILE MENU BUTTON */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <h2 className="font-semibold">FlowHive</h2>
          <div className="ml-auto">
            <Avatar>
              <AvatarFallback className="bg-primary text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

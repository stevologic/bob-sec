import { Badge } from "./ui/badge";

interface Project {
  id: string;
  name: string;
  status: "Planned" | "Ongoing" | "Completed";
  timeline: string;
  points: number;
}

interface TaskListProps {
  projects: Project[];
}

export function TaskList({ projects }: TaskListProps) {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="flex items-center justify-between p-4 bg-indigo-900 rounded-lg">
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            <p className="text-sm text-indigo-300">Timeline: {project.timeline}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={project.status === "Completed" ? "success" : project.status === "Ongoing" ? "warning" : "secondary"}>
              {project.status}
            </Badge>
            <span className="text-yellow-300">{project.points} points</span>
          </div>
        </div>
      ))}
    </div>
  );
}

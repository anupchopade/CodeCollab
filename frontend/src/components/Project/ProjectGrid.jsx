import { useState } from "react";
import ProjectCard from "./ProjectCard";
import { Input } from "@/components/ui/input";

const ProjectGrid = ({ projects, onSelect }) => {
  const [search, setSearch] = useState("");

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <Input 
        placeholder="🔍 Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md"
      />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} onClick={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default ProjectGrid;

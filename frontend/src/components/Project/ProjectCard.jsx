import { Users, Clock } from "lucide-react";

const ProjectCard = ({ project, onClick }) => {
  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
        <p className="text-sm text-gray-600">{project.description}</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Users size={16} />
          {project.collaborators?.length || 0}
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Clock size={16} />
          {project.lastModified}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="text-xs text-blue-600">Open Project →</span>
      </div>
    </div>
  );
};

export default ProjectCard;

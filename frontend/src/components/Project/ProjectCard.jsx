import { useState } from "react";
import { Users, Clock, Share2 } from "lucide-react";
import ShareModal from "./ShareModal";

const ProjectCard = ({ project, onClick }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick(project._id || project.id);
    }
  };

  const handleShareClick = (e) => {
    e.stopPropagation(); // Prevent opening the project
    setShowShareModal(true);
  };

  return (
    <div 
      onClick={handleClick}
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
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-blue-600">Open Project →</span>
        <button
          onClick={handleShareClick}
          className="p-1 hover:bg-gray-100 rounded"
          title="Share Project"
        >
          <Share2 size={14} className="text-gray-500" />
        </button>
      </div>
      
      <ShareModal 
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        project={project}
      />
    </div>
  );
};

export default ProjectCard;

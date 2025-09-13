import { useState } from "react";
import { Copy, UserPlus } from "lucide-react";
import { projectService } from "../../services/projectService";
import toast from "react-hot-toast";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import Input from "../UI/Input";

const ShareModal = ({ open, onClose, project }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const shareLink = `${window.location.origin}/join/${project._id || project.id}`;

  const handleAddCollaborator = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      await projectService.addCollaborator(project._id || project.id, {
        email: email,
        role: 'editor'
      });
      toast.success("Collaborator added successfully!");
      setEmail("");
    } catch (error) {
      toast.error("Failed to add collaborator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Share Project">
      <div className="space-y-4">
        {/* Add Collaborator */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Add Collaborator by Email</label>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
              autoFocus
            />
            <Button 
              onClick={handleAddCollaborator}
              disabled={loading}
              className="px-3 py-2"
            >
              <UserPlus size={16} />
            </Button>
          </div>
        </div>

        {/* Share Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Share Link</label>
          <div className="flex items-center gap-2">
            <Input 
              readOnly 
              value={shareLink} 
              className="flex-1"
            />
            <Button 
              onClick={() => navigator.clipboard.writeText(shareLink)}
              className="px-3 py-2"
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Send this link to invite collaborators or add them by email.
        </p>
      </div>
    </Modal>
  );
};

export default ShareModal;

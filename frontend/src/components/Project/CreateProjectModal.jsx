import { useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";

const CreateProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState({ name: "", description: "", template: "blank" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSubmit(form);
    setForm({ name: "", description: "", template: "blank" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Project Name"
            placeholder="Enter project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input 
            label="Description (optional)"
            placeholder="Enter project description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select 
              value={form.template}
              onChange={(e) => setForm({ ...form, template: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="blank">Blank Project</option>
              <option value="react">React Template</option>
              <option value="next">Next.js Template</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!form.name}
            >
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;

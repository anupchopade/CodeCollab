import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const CreateProjectModal = ({ open, onClose, onCreate }) => {
  const [form, setForm] = useState({ name: "", description: "", template: "blank" });

  const handleSubmit = () => {
    if (!form.name) return;
    onCreate(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input 
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input 
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <select 
            value={form.template}
            onChange={(e) => setForm({ ...form, template: e.target.value })}
            className="border rounded-md p-2 w-full"
          >
            <option value="blank">Blank Project</option>
            <option value="react">React Template</option>
            <option value="next">Next.js Template</option>
          </select>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={handleSubmit}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectModal;

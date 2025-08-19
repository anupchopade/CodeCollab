import { Button } from "@/components/ui/button";

const ProjectSettings = ({ project, onDelete }) => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Project Settings</h2>
      <div>
        <h3 className="font-medium">General</h3>
        <p className="text-sm text-muted-foreground">Name: {project.name}</p>
      </div>
      <div className="border-t pt-4">
        <h3 className="font-medium text-red-600">Danger Zone</h3>
        <p className="text-sm text-muted-foreground">Once deleted, this cannot be undone.</p>
        <Button variant="destructive" onClick={() => onDelete(project.id)}>Delete Project</Button>
      </div>
    </div>
  );
};

export default ProjectSettings;

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Users, Clock } from "lucide-react";

const ProjectCard = ({ project, onClick }) => {
  return (
    <Card 
      onClick={() => onClick(project.id)}
      className="cursor-pointer hover:shadow-lg transition-all rounded-2xl"
    >
      <CardHeader>
        <h3 className="text-lg font-semibold">{project.name}</h3>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users size={16} />
          {project.collaborators?.length || 0}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock size={16} />
          {project.lastModified}
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-blue-600">Open Project →</span>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;

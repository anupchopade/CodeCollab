import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

const ShareModal = ({ open, onClose, project }) => {
  const shareLink = `${window.location.origin}/join/${project.id}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input readOnly value={shareLink} />
            <Button 
              size="icon"
              onClick={() => navigator.clipboard.writeText(shareLink)}
            >
              <Copy size={16} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Send this link to invite collaborators.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

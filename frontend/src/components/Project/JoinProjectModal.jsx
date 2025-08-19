import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const JoinProjectModal = ({ open, onClose, onJoin }) => {
  const [link, setLink] = useState("");

  const handleJoin = () => {
    if (!link) return;
    onJoin(link);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Project</DialogTitle>
        </DialogHeader>
        <Input 
          placeholder="Paste invite link..."
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleJoin}>Join</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinProjectModal;

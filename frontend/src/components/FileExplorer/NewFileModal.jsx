import React, { useState } from "react";
import Button from "../UI/Button";

const NewFileModal = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("file");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({ name, type });
    setName("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl shadow-md w-80">
        <h2 className="text-lg font-semibold mb-2">New {type}</h2>

        <input
          className="border p-2 w-full rounded-md mb-2"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border p-2 w-full rounded-md mb-2"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="file">File</option>
          <option value="folder">Folder</option>
        </select>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Create</Button>
        </div>
      </div>
    </div>
  );
};

export default NewFileModal;

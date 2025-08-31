import React from "react";
import Button from "../UI/Button";

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl shadow-md w-96">
        <h2 className="text-lg font-semibold mb-2 text-red-600">Delete Item</h2>
        <p className="mb-4">Are you sure you want to delete this item? This action cannot be undone.</p>
        
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

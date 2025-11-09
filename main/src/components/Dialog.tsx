import React from "react";
import { XIcon, HandHeartIcon, BuildingIcon } from "./Icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

const Dialog: React.FC<DialogProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative z-50 w-full max-w-lg rounded-xl bg-white shadow-lg">
        {children}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Dialog;

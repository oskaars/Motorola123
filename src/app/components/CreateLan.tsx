// components/CreateLan.tsx
"use client";
import React from "react";

const CreateLan: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-2xl font-bold text-white">Create LAN Room</h3>
      <input
        type="text"
        placeholder="Enter Room Name"
        className="p-2 rounded bg-gray-800 text-white"
      />
      <button className="px-4 py-2 bg-green-500 rounded text-white">
        Create
      </button>
    </div>
  );
};

export default CreateLan;

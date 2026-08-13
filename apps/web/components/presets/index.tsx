import React from "react";

export function PresetSelector() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button className="p-4 border rounded-lg hover:bg-gray-50">Story</button>
      <button className="p-4 border rounded-lg hover:bg-gray-50">Post</button>
    </div>
  );
}

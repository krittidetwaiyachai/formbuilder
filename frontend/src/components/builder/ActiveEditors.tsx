"use client";

import { ActiveEditor } from "@/types/collaboration";

interface ActiveEditorsProps {
  editors: ActiveEditor[];
}

export default function ActiveEditors({ editors }: ActiveEditorsProps) {
  if (editors.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b">
      <span className="text-xs font-medium text-gray-600">Active editors:</span>
      <div className="flex items-center gap-2">
        {editors.map((editor) => (
          <div
            key={editor.userId}
            className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-gray-200"
            title={editor.userName}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: editor.userColor }}
            >
              {editor.userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-700">{editor.userName}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}


import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  count: number;
  color: string;
  children: ReactNode;
  collapsed?: boolean;
}

export default function KanbanColumn({ id, title, count, color, children, collapsed }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  if (collapsed) {
    return (
      <div className="w-48 flex-shrink-0">
        <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
          <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
        </div>
        <div ref={setNodeRef} className={`min-h-[100px] rounded-lg p-1 transition-colors ${isOver ? 'bg-blue-50' : ''}`}>
          <p className="text-xs text-gray-400 text-center py-4">{count} stavki</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 flex-shrink-0">
      <div className={`flex items-center gap-2 mb-3 pb-2 border-b-2 ${color}`}>
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-[200px] rounded-lg p-1 transition-colors ${isOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

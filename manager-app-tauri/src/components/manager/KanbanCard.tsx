import { useDraggable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface Props {
  id: string;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export default function KanbanCard({ id, disabled, children, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      className={`bg-white rounded-lg border p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? 'shadow-lg opacity-80 z-50' : 'shadow-sm hover:shadow-md'
      } ${disabled ? 'cursor-default opacity-70' : ''}`}
    >
      {children}
    </div>
  );
}

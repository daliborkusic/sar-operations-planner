import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-[375px] h-[812px] bg-white rounded-[40px] shadow-2xl border-4 border-gray-800 overflow-hidden relative flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[24px] bg-gray-800 rounded-b-xl z-10" />
      <div className="flex-1 overflow-y-auto pt-8">{children}</div>
    </div>
  );
}

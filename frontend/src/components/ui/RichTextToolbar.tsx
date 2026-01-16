import React from 'react';

interface RichTextToolbarProps {
  id: string;
  orientation?: 'horizontal' | 'vertical';
}

export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({ id, orientation = 'horizontal' }) => {
  const isVertical = orientation === 'vertical';

  return (
    <div
      id={id}
      className={`ql-toolbar ql-snow flex gap-2 animate-slide-down bg-white/95 backdrop-blur-sm shadow-xl border border-gray-100 rounded-2xl p-2 w-fit items-center ring-1 ring-black/5 relative z-50 transition-all duration-200 ${
        isVertical ? 'flex-col min-w-[40px]' : 'flex-wrap mb-4 px-5 py-2 mx-auto rounded-full'
      }`}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.ql-link')) {
          e.preventDefault();
        }
        e.stopPropagation();
      }}
    >
      <select className="ql-header" defaultValue="">
        <option value="1"></option>
        <option value="2"></option>
        <option value="3"></option>
        <option value=""></option>
      </select>

      <div className={`${isVertical ? 'h-px w-full' : 'w-px h-4'} bg-gray-200 my-1`}></div>

      <button type="button" className="ql-bold"></button>
      <button type="button" className="ql-italic"></button>
      <button type="button" className="ql-underline"></button>
      <button type="button" className="ql-strike"></button>

      <div className={`${isVertical ? 'h-px w-full' : 'w-px h-4'} bg-gray-200 my-1`}></div>

      <button type="button" className="ql-list" value="ordered"></button>
      <button type="button" className="ql-list" value="bullet"></button>

      <div className={`${isVertical ? 'h-px w-full' : 'w-px h-4'} bg-gray-200 my-1`}></div>

      <button type="button" className="ql-link"></button>
      <button type="button" className="ql-clean"></button>
    </div>
  );
};

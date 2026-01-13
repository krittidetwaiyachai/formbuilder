import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  theme?: 'snow' | 'bubble';
  modules?: any;
  onFocus?: () => void;
}

const defaultModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
};

const bubbleModules = {
  toolbar: [
    ['bold', 'italic', 'underline', 'link'],
    [{ 'header': 1 }, { 'header': 2 }],
    ['clean']
  ]
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  placeholder,
  className,
  theme = 'snow',
  modules,
  onFocus
}) => {
  return (
    <div className={`rich-text-editor-wrapper ${theme} ${className || ''}`}>
      <ReactQuill 
        theme={theme}
        value={value}
        onChange={onChange}
        modules={modules || (theme === 'bubble' ? bubbleModules : defaultModules)}
        formats={formats}
        placeholder={placeholder}
        onFocus={onFocus}
      />
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import './RichTextEditor.css';
import { LinkDialog } from './LinkDialog';

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
  const quillRef = useRef<ReactQuill>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const pendingLinkHandlerRef = useRef<((url: string | false) => void) | null>(null);

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule('toolbar');
      
      toolbar.addHandler('link', function(value: any) {
        if (value) {
          const range = quill.getSelection();
          if (range && range.length > 0) {
            pendingLinkHandlerRef.current = (url: string | false) => {
              if (url) {
                quill.format('link', url);
              }
            };
            setShowLinkDialog(true);
          }
        } else {
          quill.format('link', false);
        }
      });
    }
  }, []);

  const handleLinkConfirm = (url: string) => {
    if (pendingLinkHandlerRef.current) {
      pendingLinkHandlerRef.current(url);
      pendingLinkHandlerRef.current = null;
    }
    setShowLinkDialog(false);
  };

  const handleLinkCancel = () => {
    pendingLinkHandlerRef.current = null;
    setShowLinkDialog(false);
  };

  return (
    <>
      <div className={`rich-text-editor-wrapper ${theme} ${className || ''}`}>
        <ReactQuill 
          ref={quillRef}
          theme={theme}
          value={value}
          onChange={onChange}
          modules={modules || (theme === 'bubble' ? bubbleModules : defaultModules)}
          formats={formats}
          placeholder={placeholder}
          onFocus={onFocus}
        />
      </div>
      
      <LinkDialog
        isOpen={showLinkDialog}
        onConfirm={handleLinkConfirm}
        onCancel={handleLinkCancel}
      />
    </>
  );
};

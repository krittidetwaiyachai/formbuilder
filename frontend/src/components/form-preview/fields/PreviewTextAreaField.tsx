import React, { useRef, useEffect } from 'react';
import { Field } from '@/types';
import { useForm } from 'react-hook-form';
import { FileText, Bold, Italic, Underline, Link as LinkIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { PreviewLabel } from '../PreviewLabel';

interface PreviewFieldProps {
  field: Field;
  register: ReturnType<typeof useForm>['register'];
  errors: any;
  questionNumber?: number;
  isPublic?: boolean;
  watch?: ReturnType<typeof useForm>['watch'];
  setValue?: ReturnType<typeof useForm>['setValue'];
}

export const PreviewTextAreaField: React.FC<PreviewFieldProps> = ({ field, register, errors, questionNumber, isPublic, watch, setValue }) => {
  const fieldName = `field_${field.id}`;
  const fieldError = errors[fieldName];
  const editorRef = useRef<HTMLDivElement>(null);

  const options = field.options || {};
  const validation = field.validation || {};
  const { labelAlignment = 'TOP', subLabel, width, customWidth, hoverText, readOnly, defaultValue, rows = 4, shrink, editorMode } = options;
  const { maxLength, minLength, hasEntryLimits, type: validationType } = validation;
  const isRichText = editorMode === 'RICH_TEXT';
  const watchedValue = watch ? watch(fieldName) : undefined;

  // Initialize Rich Text Content
  useEffect(() => {
    if (isRichText && editorRef.current && isPublic) {
       // Initialize with current form value (persistence) or default value
       const initialContent = watchedValue || defaultValue;
       if (initialContent && !editorRef.current.innerHTML) {
          editorRef.current.innerHTML = initialContent;
       }
    }
    // Only run on mount or when mode changes, do NOT re-run on watchedValue change to avoid cursor jumps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRichText, isPublic]);

  // State for toolbar active buttons
  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    insertUnorderedList: false,
    insertOrderedList: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    justifyFull: false,
    fontSize: '3', // Default numeric value for 'normal' size (3 is roughly 16px/normal in execCommand)
  });

  // Check active formatting
  const checkFormats = () => {
    if (!isRichText || !isPublic || readOnly) return;
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      insertUnorderedList: document.queryCommandState('insertUnorderedList'),
      insertOrderedList: document.queryCommandState('insertOrderedList'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
      justifyFull: document.queryCommandState('justifyFull'),
      fontSize: document.queryCommandValue('fontSize') || '3',
    });
  };

  // Sync Rich Text to Form
  const handleInput = () => {
    checkFormats();
    if (editorRef.current && setValue) {
      setValue(fieldName, editorRef.current.innerHTML, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleKeyUp = () => checkFormats();
  const handleMouseUp = () => checkFormats();

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
        editorRef.current.focus();
    }
    checkFormats();
  };

  const isRowLayout = labelAlignment === 'LEFT' || labelAlignment === 'RIGHT';

  const validationRules: any = {
    required: field.required ? 'This field is required' : false,
  };

  if (hasEntryLimits) {
      if (maxLength) {
           validationRules.maxLength = {
                value: maxLength,
                message: `Max length is ${maxLength} characters`
           };
      }
      if (minLength) {
           validationRules.minLength = {
                value: minLength,
                message: `Min length is ${minLength} characters`
           };
      }
  }

   if (validationType) {
      if (validationType === 'Email') {
          validationRules.pattern = {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
          };
      } else if (validationType === 'URL') {
           validationRules.pattern = {
              value: /^(https?:\/\/)?[\da-z\.-]+\.[a-z\.]{2,6}(\/[\w \.-]*)*\/?$/,
              message: "Invalid URL"
          };
      } else if (validationType === 'Alphabetic') {
           validationRules.pattern = {
              value: /^[a-zA-Z\s]*$/,
              message: "Only alphabetic characters allowed"
          };
      } else if (validationType === 'Alphanumeric') {
           validationRules.pattern = {
              value: /^[a-zA-Z0-9\s]*$/,
              message: "Only alphanumeric characters allowed"
          };
      }  else if (validationType === 'Numeric') {
           validationRules.pattern = {
              value: /^[0-9\s]*$/,
              message: "Only numeric characters allowed"
          };
      }
  }


  return (
    <div className={`mb-4 w-full ${isRowLayout ? 'flex items-start gap-4' : ''}`}>
      <div className={`${isRowLayout ? 'w-40 flex-shrink-0 pt-2' : 'mb-3'} ${labelAlignment === 'RIGHT' ? 'text-right' : ''}`}>
        <PreviewLabel field={field} questionNumber={questionNumber} isPublic={isPublic} htmlFor={fieldName} />
        {subLabel && subLabel !== 'Sublabel' && (
           <p className="mt-1 text-sm text-gray-500 font-normal">{subLabel}</p>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="relative group" title={hoverText}>
          {!isPublic && (
            <div className="absolute left-3 top-4 pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
          )}
          
          {isPublic ? (
            isRichText ? (
                // Rich Text Editor Mode
                <div style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}} className="w-full">
                    <div className={`border ${fieldError ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-200'} rounded-lg overflow-hidden bg-white shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black`}>
                        {/* Toolbar */}
                        {!readOnly && (
                            <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap items-center gap-1 select-none">
                                {/* Text Style */}
                                <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.bold ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Bold"
                                    >
                                      <Bold className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.italic ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Italic"
                                    >
                                      <Italic className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('underline'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.underline ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Underline"
                                    >
                                      <Underline className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Alignment */}
                                <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('justifyLeft'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.justifyLeft ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Align Left"
                                    >
                                      <AlignLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('justifyCenter'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.justifyCenter ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Align Center"
                                    >
                                      <AlignCenter className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('justifyRight'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.justifyRight ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Align Right"
                                    >
                                      <AlignRight className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('justifyFull'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.justifyFull ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Justify"
                                    >
                                      <AlignJustify className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Lists */}
                                <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.insertUnorderedList ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Bullet List"
                                    >
                                      <List className="w-4 h-4" />
                                    </button>
                                    <button 
                                      type="button" 
                                      onMouseDown={(e) => { e.preventDefault(); execCmd('insertOrderedList'); }} 
                                      className={`p-1.5 rounded transition-colors ${activeFormats.insertOrderedList ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-gray-600'}`}
                                      title="Numbered List"
                                    >
                                      <ListOrdered className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Link */}
                                <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1.5 mr-1">
                                     <button 
                                       type="button" 
                                       onMouseDown={(e) => { 
                                         e.preventDefault(); 
                                         const url = prompt('Enter URL'); 
                                         if(url) execCmd('createLink', url); 
                                     }} 
                                     className="p-1.5 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                                     title="Link"
                                     >
                                      <LinkIcon className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Font Size */}
                                <div className="flex items-center gap-1">
                                     <select
                                        onMouseDown={(e) => e.stopPropagation()} // Allow click to options
                                        onChange={(e) => {
                                            execCmd('fontSize', e.target.value);
                                        }}
                                        value={activeFormats.fontSize}
                                        className="h-7 text-xs border border-gray-300 rounded px-1 min-w-[60px] focus:outline-none focus:border-black bg-white"
                                        title="Font Size"
                                     >
                                        <option value="1">Small (1)</option>
                                        <option value="2">Small (2)</option>
                                        <option value="3">Normal</option>
                                        <option value="4">Large (4)</option>
                                        <option value="5">Large (5)</option>
                                        <option value="6">Huge (6)</option>
                                        <option value="7">Huge (7)</option>
                                     </select>
                                </div>
                            </div>
                        )}
                        {/* Editable Area */}
                        <div
                            ref={editorRef}
                            contentEditable={!readOnly}
                            onInput={handleInput}
                            onKeyUp={handleKeyUp}
                            onMouseUp={handleMouseUp}
                            className={`w-full px-4 py-3 min-h-[120px] outline-none text-base text-gray-900 leading-relaxed ${
                              readOnly ? 'bg-gray-50 cursor-not-allowed text-gray-500' : 'bg-white'
                            } [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer`}
                            style={{ minHeight: rows ? `${rows * 24}px` : 'auto' }}
                        />
                        {/* Hidden input for validation syncing if needed, though setValue handles validation */}
                        <input type="hidden" {...register(fieldName, validationRules)} />
                    </div>
                </div>
            ) : (
                // Normal Textarea
                <textarea
                    id={fieldName}
                    {...register(fieldName, validationRules)}
                    placeholder={field.placeholder || "Type your answer here..."}
                    defaultValue={defaultValue}
                    readOnly={readOnly}
                    rows={shrink ? Math.max(2, rows - 2) : rows}
                    maxLength={hasEntryLimits && maxLength ? maxLength : undefined}
                    style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                    className={`w-full px-4 ${shrink ? 'py-2 text-base' : 'py-3 text-base'} border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all resize-none ${
                        fieldError ? 'border-red-500 bg-red-50' : 'hover:border-gray-300'
                    } ${readOnly ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                />
            )
          ) : (
            // Builder Preview (Mock)
            <textarea
                id={fieldName}
                {...register(fieldName, validationRules)}
                placeholder={field.placeholder}
                defaultValue={defaultValue}
                readOnly={readOnly}
                rows={rows}
                maxLength={hasEntryLimits && maxLength ? maxLength : undefined}
                style={width === 'FIXED' && customWidth ? { maxWidth: `${customWidth}px` } : {}}
                className={`w-full pl-10 pr-4 py-3 border-2 ${
                    fieldError ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                } rounded-lg text-black text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all ${
                    readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
                }`}
            />
          )}
        </div>

        {hasEntryLimits && maxLength && isPublic && (
          <p className="mt-1 text-xs text-gray-400 text-right">
            Max {maxLength} characters
          </p>
        )}

        {fieldError && (
            <p className="mt-1 text-sm text-red-600">{fieldError.message as string}</p>
        )}
      </div>
    </div>
  );
};

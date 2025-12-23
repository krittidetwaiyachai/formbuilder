import { Form } from '@/types';

interface FormSettingsPropertiesProps {
  currentForm: Form;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
  handleFormUpdate: (field: string, value: any) => void;
}

export function FormSettingsProperties({
  currentForm,
  formTitle,
  setFormTitle,
  formDescription,
  setFormDescription,
  handleFormUpdate,
}: FormSettingsPropertiesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-black mb-4">Form Settings</h3>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Title
        </label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => {
            setFormTitle(e.target.value);
            handleFormUpdate('title', e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
              e.stopPropagation();
            }
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Description
        </label>
        <textarea
          value={formDescription}
          onChange={(e) => {
            setFormDescription(e.target.value);
            handleFormUpdate('description', e.target.value);
          }}
          rows={3}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
              e.stopPropagation();
            }
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black mb-1">
          Status
        </label>
        <select
          value={currentForm.status}
          onChange={(e) => handleFormUpdate('status', e.target.value)}
          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-black bg-white select-text"
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
              e.stopPropagation();
            }
          }}
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isQuiz"
          checked={currentForm.isQuiz || false}
          onChange={(e) => handleFormUpdate('isQuiz', e.target.checked)}
          className="h-4 w-4 text-black focus:ring-black border-gray-400 rounded"
        />
        <label htmlFor="isQuiz" className="ml-2 block text-sm text-black">
          Enable Quiz Mode
        </label>
      </div>
    </div>
  );
}

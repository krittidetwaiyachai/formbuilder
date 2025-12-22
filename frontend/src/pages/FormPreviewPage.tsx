import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { Form } from '@/types';
import { useFormStore } from '@/store/formStore';
import FormFieldRenderer from '@/components/form-preview/FormFieldRenderer';
import DeviceFrame from '@/components/form-preview/DeviceFrame';
import { CheckCircle, Monitor, Tablet, Smartphone } from 'lucide-react';

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function FormPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentForm } = useFormStore();
  
  // ตรวจสอบว่ามาจากหน้าไหน: ถ้ามี currentForm ใน store แสดงว่ามาจาก builder (edit/create)
  const isFromBuilder = !!(currentForm && currentForm.id === id) || location.state?.fromBuilder;
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{ score: number; totalScore: number } | null>(null);
  const [device, setDevice] = useState<DeviceType>('desktop');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  useEffect(() => {
    // ใช้ currentForm จาก store ถ้ามี (มาจาก builder) หรือโหลดจาก API
    if (currentForm && currentForm.id === id) {
      setForm(currentForm);
      setLoading(false);
    } else if (id) {
      loadForm();
    }
  }, [id, currentForm]);

  // Prevent text selection (Ctrl+A) globally on this page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A (Cmd+A on Mac) - but allow in input fields
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const target = e.target as HTMLElement;
        // Allow Ctrl+A in input, textarea, and contenteditable elements
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const loadForm = async () => {
    try {
      const response = await api.get(`/forms/${id}`);
      setForm(response.data.form);
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!form) return;

    setSubmitting(true);
    try {
      const answers = form.fields?.map((field) => {
        const fieldName = `field_${field.id}`;
        const value = data[fieldName];
        return {
          fieldId: field.id,
          value: Array.isArray(value) ? value.join(', ') : String(value || ''),
        };
      }) || [];

      const response = await api.post('/responses', {
        formId: form.id,
        answers,
      });

      if (form.isQuiz) {
        const submission = response.data.submission || response.data;
        if (submission?.score !== undefined) {
          setScore({
            score: submission.score || 0,
            totalScore: submission.totalScore || 0,
          });
        }
      }

      setSubmitted(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Form not found</p>
          <button
            onClick={() => {
              if (isFromBuilder) {
                navigate(-1);
              } else {
                navigate('/dashboard');
              }
            }}
            className="mt-4 text-black hover:text-gray-700 underline"
          >
            {isFromBuilder ? 'Go Back' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-black mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-2">Thank you!</h2>
          <p className="text-gray-700 mb-6">Your response has been submitted successfully.</p>
          {form.isQuiz && score && (
            <div className="bg-gray-100 rounded-lg p-4 mb-6 border border-gray-300">
              <p className="text-sm text-black mb-2">Your Score:</p>
              <p className="text-3xl font-bold text-black">
                {score.score} / {score.totalScore}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                {((score.score / score.totalScore) * 100).toFixed(1)}%
              </p>
            </div>
          )}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white select-none" onKeyDown={(e) => {
      // Prevent Ctrl+A (Cmd+A on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      {/* Header with device selector */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-center">
            {/* Device Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDevice('desktop')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  device === 'desktop'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  device === 'tablet'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Tablet className="h-4 w-4" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  device === 'mobile'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
        </div>
      </div>

      {/* Preview Content */}
      <DeviceFrame device={device}>
        <div className={device === 'mobile' ? 'pt-8' : ''}>
          <h1 className={`${device === 'mobile' ? 'text-xl' : device === 'tablet' ? 'text-2xl' : 'text-3xl'} font-bold text-black mb-2`}>{form.title}</h1>
          {form.description && (
            <p className={`text-gray-700 mb-8 ${device === 'mobile' ? 'text-sm' : ''}`}>{form.description}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {form.fields && form.fields.length > 0 ? (
              <div className="space-y-6 max-w-lg">
                {form.fields
                  .filter((field) => !(field.validation as any)?.hidden)
                  .map((field) => (
                  <FormFieldRenderer
                    key={field.id}
                    field={field}
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                This form has no fields yet.
              </p>
            )}

            {form.fields && form.fields.length > 0 && (
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            )}
          </form>
        </div>
      </DeviceFrame>
    </div>
  );
}

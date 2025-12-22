import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { FileText } from 'lucide-react';

interface RegisterForm {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError('');
      await registerUser(data.email, data.password, data.firstName, data.lastName);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <FileText className="h-12 w-12 text-black" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-gray-100 border border-gray-400 text-black px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email address
              </label>
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-black bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-gray-700">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black">
                Password
              </label>
              <input
                {...register('password', { required: 'Password is required', minLength: 6 })}
                type="password"
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-black bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm select-text"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                    e.stopPropagation();
                  }
                }}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-gray-700">{errors.password.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-black">
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-black bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm select-text"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-black">
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-400 placeholder-gray-500 text-black bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black sm:text-sm select-text"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                      e.stopPropagation();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              Register
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-black hover:text-gray-700 underline"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


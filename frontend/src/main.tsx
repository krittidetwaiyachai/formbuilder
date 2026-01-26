
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'
import './i18n';

if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
      return;
    }
    originalError.call(console, ...args);
  };
}


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
    });
  });
}

import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToasterProvider } from './components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <ToasterProvider>
      <App />
    </ToasterProvider>
  </GoogleOAuthProvider>,
)

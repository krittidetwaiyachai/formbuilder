import { Link } from "react-router-dom";
import { FileText, LayoutDashboard, User } from "lucide-react";
import LanguageSwitcher from "./common/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormBuilder</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('dashboard')}
            </Link>
            <Link 
              to="/demo" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              {t('demo')}
            </Link>
            
            <LanguageSwitcher />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('admin')}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


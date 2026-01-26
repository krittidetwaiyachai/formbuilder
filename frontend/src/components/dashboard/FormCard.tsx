import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form as FormSchema } from "@/types";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  ExternalLink, 
  FileText, 
  Calendar,
  Eye,
  BarChart2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { mockActiveEditors } from "@/lib/mock-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

interface FormCardProps {
  form: FormSchema;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
}

export default function FormCard({ form, onDelete, onDuplicate, onEdit, onView }: FormCardProps) {
  const { t } = useTranslation();
  
  
  const activeEditors = mockActiveEditors.filter((e: any) => e.fieldId === form.id) || [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      { }
      {activeEditors.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 z-10" />
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                {form.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                {form.description || t('dashboard.form_card.no_description')}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(form.id)}>
                <Edit className="w-4 h-4 mr-2" />
                {t('dashboard.context.edit')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onView(form.id)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('dashboard.context.preview')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(form.id)}>
                <Copy className="w-4 h-4 mr-2" />
                {t('dashboard.context.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(form.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('dashboard.context.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        { }
        {activeEditors.length > 0 && (
          <div className="flex -space-x-2 overflow-hidden mb-4 pl-1">
            {activeEditors.slice(0, 3).map((editor: any) => (
              <div
                key={editor.userId}
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                style={{ backgroundColor: editor.userColor }}
                title={editor.userName}
              >
                {editor.userName.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeEditors.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                +{activeEditors.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{form.responseCount || 0} {t('dashboard.form_card.responses')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{form.viewCount || 0} {t('dashboard.form_card.views')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{t('dashboard.form.updated_prefix')}{formatDate(form.updatedAt)}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-2">
          <Button asChild variant="outline" className="w-full justify-center">
            <Link href={`/builder/${form.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              {t('dashboard.form_card.edit')}
            </Link>
          </Button>
          <Button asChild variant="default" className="w-full justify-center">
            <Link href={`/preview/${form.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              {t('dashboard.form_card.preview')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center">
            <Link href={`/analytics/${form.id}`}>
              <BarChart2 className="h-4 w-4 mr-2" />
              {t('dashboard.form_card.analytics')}
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full justify-center">
            <Link href={`/activity/${form.id}`}>
              <Clock className="h-4 w-4 mr-2" />
              {t('dashboard.form_card.activity')}
            </Link>
          </Button>
      </div>
    </div>
  );
}


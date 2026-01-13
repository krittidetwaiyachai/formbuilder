
import React, { useEffect, useRef } from 'react';
import { 
  FileText, 
  Eye, 
  BarChart3, 
  Clock, 
  Copy, 
  Trash2, 
  Users,
  Link as LinkIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DashboardContextMenuProps {
  formId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onAnalytics: () => void;
  onActivity: () => void;
  onCopyLink: () => void;
  onDuplicate: () => void;
  onCollaborators: () => void;
  onDelete: () => void;
}

interface MenuItem {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    danger?: boolean;
}

interface MenuGroup {
    label: string;
    items: MenuItem[];
}

export function DashboardContextMenu({ 
  position, 
  onClose,
  onEdit,
  onPreview,
  onAnalytics,
  onActivity,
  onCopyLink,
  onDuplicate,
  onCollaborators,
  onDelete
}: DashboardContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    const handleScroll = () => onClose();
    window.addEventListener('scroll', handleScroll, true); 
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  // We'll do a simple check to see if it overflows right or bottom
  const getAdjustedStyle = () => {
      let top = position.y;
      let left = position.x;

      if (typeof window !== 'undefined') {
          if (left + 240 > window.innerWidth) {
              left = window.innerWidth - 250;
          }
          if (top + 350 > window.innerHeight) {
              top = top - 350; 
          }
      }
      return { top, left };
  };

  const style = getAdjustedStyle();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const menuItems: MenuGroup[] = [
    {
      label: t('dashboard.context.group.main'),
      items: [
        { icon: <FileText className="w-4 h-4" />, label: t('dashboard.context.edit'), onClick: onEdit },
        { icon: <Eye className="w-4 h-4" />, label: t('dashboard.context.preview'), onClick: onPreview },
      ]
    },
    {
      label: t('dashboard.context.group.management'),
      items: [
        { icon: <BarChart3 className="w-4 h-4" />, label: t('dashboard.context.analytics'), onClick: onAnalytics },
        { icon: <Clock className="w-4 h-4" />, label: t('dashboard.context.activity'), onClick: onActivity },
        { icon: <Users className="w-4 h-4" />, label: t('dashboard.context.collaborators'), onClick: onCollaborators },
      ]
    },
    {
      label: t('dashboard.context.group.share'),
      items: [
        { icon: <LinkIcon className="w-4 h-4" />, label: t('dashboard.context.copy_link'), onClick: onCopyLink },
        { icon: <Copy className="w-4 h-4" />, label: t('dashboard.context.duplicate'), onClick: onDuplicate },
      ]
    },
    {
      label: t('dashboard.context.group.danger'),
      items: [
        { icon: <Trash2 className="w-4 h-4 text-red-500" />, label: t('dashboard.context.delete'), onClick: onDelete, danger: true },
      ]
    }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 w-60 py-2 animate-in fade-in zoom-in-95 duration-150 origin-top-left"
      style={{ top: style.top, left: style.left }}
    >
      {menuItems.map((group, groupIndex) => (
        <div key={groupIndex} className={groupIndex !== 0 ? "border-t border-gray-100 mt-1 pt-1" : ""}>
          {group.items.map((item, itemIndex) => (
            <button
              key={itemIndex}
              onClick={(e) => {
                e.stopPropagation();
                handleAction(item.onClick);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-[13px] font-medium transition-colors ${
                  item.danger 
                  ? 'text-red-500 hover:bg-red-50' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <span className={item.danger ? 'text-red-500' : 'text-gray-400 group-hover:text-black'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

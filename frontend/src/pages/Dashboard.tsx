import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '@/lib/api';
import { Form } from '@/types';
import { useAuthStore } from '@/store/authStore';
import LoginModal from '@/components/auth/LoginModal';
import { useTranslation } from 'react-i18next';
import FormDetailsModal from '@/components/dashboard/FormDetailsModal';
import CollaboratorListModal from '@/components/dashboard/CollaboratorListModal';
import { DashboardContextMenu } from '@/components/dashboard/DashboardContextMenu';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { motion } from 'framer-motion';
import Loader from '@/components/common/Loader';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor, pointerWithin } from '@dnd-kit/core';
import { useFolders } from '@/hooks/useFolders';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SearchFilters from '@/components/dashboard/SearchFilters';
import FolderFilters from '@/components/dashboard/FolderFilters';
import EmptyState from '@/components/dashboard/EmptyState';
import DashboardFormCard from '@/components/dashboard/DashboardFormCard';
import FoldersSection from '@/components/dashboard/FoldersSection';
import CreateFolderModal from '@/components/dashboard/CreateFolderModal';
import { useToast } from '@/components/ui/toaster';

import UngroupedFormsSection from '@/components/dashboard/UngroupedFormsSection';
import MobileFormsSection from '@/components/mobile/MobileFormsSection';
import MobileSearchFilters from '@/components/mobile/MobileSearchFilters';
import MobileMoveFolderSheet from '@/components/mobile/MobileMoveFolderSheet';
import MobileFilterSheet from '@/components/mobile/MobileFilterSheet';
import MobileProfileSheet from '@/components/mobile/MobileProfileSheet';

interface FormWithStats extends Form {
  responseCount: number;
  viewCount: number;
  _count?: { responses: number };
}

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormWithStats | null>(null);
  const [collaboratorModalData, setCollaboratorModalData] = useState<{ isOpen: boolean; collaborators: any[]; formTitle: string; formId: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; formId: string } | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // Added sort state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false); // Added sheet state
  const [isMobileMoveFolderSheetOpen, setIsMobileMoveFolderSheetOpen] = useState(false); // Added sheet state
  const [activeMobileFolderId, setActiveMobileFolderId] = useState<string | null>(null);
  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const navigate = useNavigate();
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderDeleteConfirmOpen, setFolderDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();
  
  const { folders, createFolder, updateFolder, deleteFolder, moveFormToFolder, refreshFolders } = useFolders();

  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);

  // Drag and Drop State
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeForm = forms.find(f => f.id === activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );





  // Particle animation logic
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random particles only on client side to avoid hydration mismatch
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 2, // 2-12px
      duration: Math.random() * 20 + 10, // 10-30s
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadForms();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

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

  const loadForms = async () => {
    try {
      const response = await api.get('/forms');
      const formsData: FormWithStats[] = response.data?.forms || (Array.isArray(response.data) ? response.data : []);
      
      setForms(formsData);
    } catch (error) {
      console.error('Failed to load forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const createNewForm = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    
    try {
      setIsCreating(true);
      const res = await api.post('/forms', {
        title: 'Untitled Form',
        description: '',
      });
      // Navigate to the builder with the new real ID
      navigate(`/forms/${res.data.form.id}/builder`);
    } catch (error) {
      console.error('Failed to create form:', error);
      toast({
        variant: "error",
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_create')
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteForm = async (formId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFormToDelete(formId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!formToDelete) return;

    try {
      await api.delete(`/forms/${formToDelete}`);
      loadForms(); 
      toast({
        variant: "success",
        title: t('dashboard.toast.deleted'),
        description: t('dashboard.toast.deleted')
      });
    } catch (error) {
      console.error('Failed to delete form:', error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to delete form. Please try again."
      });
    } finally {
      setFormToDelete(null);
    }
  };

  const handleDuplicateForm = async (formId: string) => {
    try {
      await api.post(`/forms/${formId}/clone`);
      loadForms();
      toast({
        variant: "success",
        title: t('dashboard.toast.duplicated'),
        description: t('dashboard.toast.duplicated')
      });
    } catch (error) {
      console.error('Failed to clone form:', error);
      toast({
        variant: "error",
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_duplicate')
      });
    }
  };

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}/view`;
    navigator.clipboard.writeText(url);
    toast({
      variant: "success",
      title: t('dashboard.toast.link_copied'),
      description: t('dashboard.toast.link_copied')
    });
  };

  const handleDeleteFolderClick = (folderId: string) => {
    setFolderToDelete(folderId);
    setFolderDeleteConfirmOpen(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;

    try {
      await deleteFolder(folderToDelete);
      // Refresh forms immediately to show them as ungrouped
      await loadForms();
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast({
        variant: "error",
        title: t('dashboard.toast.error'),
        description: t('dashboard.toast.error_folder_delete')
      });
    } finally {
      setFolderToDelete(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, formId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, formId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(i18n.language === 'th' ? 'th-TH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
                         (filterStatus === 'PUBLISHED' && form.status === 'PUBLISHED') ||
                         (filterStatus === 'DRAFT' && form.status === 'DRAFT') ||
                         (filterStatus === 'ARCHIVED' && form.status === 'ARCHIVED');
    
    // Mobile Folder Filter
    const matchesFolder = activeMobileFolderId === null 
        ? true 
        : activeMobileFolderId === 'ungrouped' 
            ? !form.folderId 
            : form.folderId === activeMobileFolderId;

    return matchesSearch && matchesStatus && matchesFolder;
  }).sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOrder === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <Loader className="mb-4" />
          <p className="text-gray-500 font-medium">{t('dashboard.loading')}</p>
        </motion.div>
      </div>
    );
  }



  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const formId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('folder-')) {
      const folderId = overId.replace('folder-', '');
      await moveFormToFolder(formId, folderId);
      await loadForms();
      await refreshFolders();
    } else if (overId === 'ungrouped') {
      await moveFormToFolder(formId, null);
      await loadForms();
      await refreshFolders();
    }
  };

  const ungroupedForms = filteredForms.filter(f => !f.folderId);


  return (
    <div className="h-full bg-gray-50 overflow-hidden select-none flex flex-col relative" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      {/* Background Particles - Reduced opacity for cleaner look */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
            animate={{ 
              opacity: [0.1, 0.4, 0.1], 
              y: [`${particle.y}%`, `${particle.y - 20}%`, `${particle.y}%`],
              x: [`${particle.x}%`, `${particle.x + 5}%`, `${particle.x}%`] 
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: particle.delay 
            }}
            className="absolute rounded-full bg-gradient-to-br from-indigo-100/30 to-purple-100/30 blur-xl"
            style={{ 
              width: particle.size * 5, 
              height: particle.size * 5,
            }}
          />
        ))}
      </div>

      {/* DashboardHeader - hidden on desktop, shown on mobile */}
      <div className="md:hidden">
        <DashboardHeader
          username={user?.firstName}
          onCreateForm={createNewForm}
          isCreating={isCreating}
          onLogin={() => setIsLoginModalOpen(true)}
          onProfileClick={() => setIsProfileSheetOpen(true)}
        />
      </div>

      <MobileSearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => setIsMobileFilterOpen(true)}
        activeFiltersCount={(filterStatus !== 'All' ? 1 : 0) + (sortOrder !== 'newest' ? 1 : 0)}
        folders={folders}
        activeFolderId={activeMobileFolderId}
        onFolderSelect={setActiveMobileFolderId}
        onCreateFolder={() => setIsCreateFolderModalOpen(true)}
      />



        {/* Mobile: Simple List View */}
        <MobileFormsSection
          forms={filteredForms}
          onCreateForm={createNewForm}
          isCreating={isCreating}
          loading={loading}
          onRefresh={loadForms}
          onDelete={(id) => handleDeleteForm(id)}
          onMove={(id) => {
             setActiveId(id);
             setIsMobileMoveFolderSheetOpen(true);
          }}
        />

        <MobileMoveFolderSheet
            isOpen={isMobileMoveFolderSheetOpen}
            onClose={() => {
                setIsMobileMoveFolderSheetOpen(false);
                setActiveId(null);
            }}
            folders={folders}
            onSelectFolder={async (folderId) => {
                if (activeId) {
                    await moveFormToFolder(activeId, folderId);
                    await loadForms();
                    toast({
                        variant: "success",
                        title: t('dashboard.toast.moved'),
                        description: t('dashboard.toast.moved_desc')
                    });
                }
            }}
            onCreateFolder={() => {
                setIsMobileMoveFolderSheetOpen(false);
                setIsCreateFolderModalOpen(true);
            }}
        />

        {/* Desktop: Grid with Folders & Drag-and-Drop */}
        <div className="hidden md:block flex-1 overflow-y-auto">
          {/* DashboardHeader for desktop - scrolls with content */}
          <DashboardHeader
            username={user?.firstName}
            onCreateForm={createNewForm}
            isCreating={isCreating}
            onLogin={() => setIsLoginModalOpen(true)}
            onProfileClick={() => setIsProfileSheetOpen(true)}
          />
          
          {/* SearchFilters - sticky on desktop */}
          <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <SearchFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
              />
            </div>
          </div>
          
          <DndContext 
            sensors={sensors} 
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart} 
            onDragEnd={handleDragEnd}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
              <FolderFilters
                folders={folders}
                activeFolderId={activeMobileFolderId}
                onFolderSelect={setActiveMobileFolderId}
                onCreateFolder={() => setIsCreateFolderModalOpen(true)}
                showIndividualFolders={!(activeMobileFolderId === null && !searchTerm)}
                isAuthenticated={isAuthenticated}
                onLoginRequired={() => setIsLoginModalOpen(true)}
              />
              {activeMobileFolderId === null && !searchTerm && (
                <FoldersSection 
                  folders={folders}
                  forms={forms}
                  onUpdateFolder={updateFolder}
                  onDeleteFolder={handleDeleteFolderClick}
                  onFormClick={(formId) => navigate(`/forms/${formId}/builder`)}
                  currentUserId={user?.id}
                  formatDate={formatDate}
                  onContextMenu={handleContextMenu}
                  onViewDetails={(e, form) => {
                    e.stopPropagation();
                    setSelectedForm(form);
                  }}
                  onDeleteForm={handleDeleteForm}
                  onCollaboratorsClick={(e, collaborators, title, formId) => {
                     e.stopPropagation();
                     setCollaboratorModalData({
                       isOpen: true,
                       collaborators,
                       formTitle: title,
                       formId
                     });
                  }}
                />
              )}

              {filteredForms.length === 0 && folders.length === 0 && !searchTerm ? (
                <EmptyState searchTerm={searchTerm} onCreateForm={createNewForm} />
              ) : (
                <UngroupedFormsSection
                  forms={activeMobileFolderId === null ? ungroupedForms : filteredForms}
                  foldersCount={folders.length}
                  user={user}
                  navigate={navigate}
                  handleContextMenu={handleContextMenu}
                  setSelectedForm={setSelectedForm}
                  handleDeleteForm={handleDeleteForm}
                  setCollaboratorModalData={setCollaboratorModalData}
                  formatDate={formatDate}
                  droppableId={activeMobileFolderId || 'ungrouped'}
                  title={
                    activeMobileFolderId === 'ungrouped' 
                      ? t('dashboard.ungrouped_forms')
                      : activeMobileFolderId
                        ? folders.find(f => f.id === activeMobileFolderId)?.name
                        : undefined
                  }
                />
              )}
            </div>
          <DragOverlay>
            {activeForm ? (
              <div 
                className="opacity-90 scale-105 cursor-grabbing" 
                style={{ width: '300px' }} // Approximate grid width
              >
                  <DashboardFormCard
                    form={activeForm}
                    currentUserId={user?.id}
                    onCardClick={() => {}}
                    onContextMenu={() => {}}
                    onViewDetails={() => {}}
                    onDelete={() => {}}
                    onCollaboratorsClick={() => {}}
                    formatDate={formatDate}
                  />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      


      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
      
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={async (name, color) => {
          try {
            await createFolder(name, color);
            toast({
              variant: "success",
              title: t('dashboard.toast.folder_created'),
              description: t('dashboard.toast.folder_created')
            });
          } catch (error) {
            toast({
              variant: "error",
              title: t('dashboard.toast.error'),
              description: t('dashboard.toast.error_folder_create') || 'Failed to create folder'
            });
          }
        }}
      />
      
      <FormDetailsModal 
        form={selectedForm} 
        onClose={() => setSelectedForm(null)} 
        onRequestLogin={() => setIsLoginModalOpen(true)}
        onOpenCollaborators={() => {
          if (selectedForm) {
            const allEditors = [selectedForm.createdBy, ...(selectedForm.collaborators || [])].filter(Boolean);
            setCollaboratorModalData({
              isOpen: true,
              collaborators: allEditors,
              formTitle: selectedForm.title,
              formId: selectedForm.id
            });
          }
        }}
      />

      <CollaboratorListModal
        isOpen={!!collaboratorModalData}
        onClose={() => setCollaboratorModalData(null)}
        collaborators={collaboratorModalData?.collaborators || []}
        formTitle={collaboratorModalData?.formTitle || ''}
        formId={collaboratorModalData?.formId || ''}
        onUpdate={loadForms}
      />


      {contextMenu && (
        <DashboardContextMenu
          formId={contextMenu.formId}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onEdit={() => navigate(`/forms/${contextMenu.formId}/builder`)}
          onPreview={() => window.open(`/forms/${contextMenu.formId}/preview`, '_blank')}
          onAnalytics={() => navigate(`/forms/${contextMenu.formId}/analytics`)}
          onActivity={() => navigate(`/forms/${contextMenu.formId}/activity`)}
          onCopyLink={() => handleCopyLink(contextMenu.formId)}
          onDuplicate={() => handleDuplicateForm(contextMenu.formId)}
          onCollaborators={() => {
             const form = forms.find(f => f.id === contextMenu.formId);
             if (form) {
                const allEditors = [form.createdBy, ...(form.collaborators || [])].filter(Boolean);
                setCollaboratorModalData({
                    isOpen: true,
                    collaborators: allEditors,
                    formTitle: form.title,
                    formId: form.id
                });
             }
          }}
          onDelete={() => handleDeleteForm(contextMenu.formId)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('dashboard.confirm.delete_form.title')}
        description={t('dashboard.confirm.delete_form.description')}
        confirmText={t('dashboard.confirm.delete')}
        cancelText={t('dashboard.confirm.cancel')}
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={folderDeleteConfirmOpen}
        onOpenChange={setFolderDeleteConfirmOpen}
        title={t('dashboard.confirm.delete_folder.title')}
        description={t('dashboard.confirm.delete_folder.description')}
        confirmText={t('dashboard.confirm.delete_folder')}
        cancelText={t('dashboard.confirm.cancel')}
        onConfirm={confirmDeleteFolder}
        variant="destructive"
      />
      <MobileFilterSheet
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
      />
      
      <MobileProfileSheet
        isOpen={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        username={user?.firstName || 'User'}
      />
    </div>
  );
}

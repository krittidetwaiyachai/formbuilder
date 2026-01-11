import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { Form } from '@/types';
import { useAuthStore } from '@/store/authStore';
import LoginModal from '@/components/auth/LoginModal';
import FormDetailsModal from '@/components/dashboard/FormDetailsModal';
import CollaboratorListModal from '@/components/dashboard/CollaboratorListModal';
import { DashboardContextMenu } from '@/components/dashboard/DashboardContextMenu';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '@/components/common/Loader';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { useFolders } from '@/hooks/useFolders';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SearchFilters from '@/components/dashboard/SearchFilters';
import EmptyState from '@/components/dashboard/EmptyState';
import DashboardFormCard from '@/components/dashboard/DashboardFormCard';
import FoldersSection from '@/components/dashboard/FoldersSection';
import CreateFolderModal from '@/components/dashboard/CreateFolderModal';
import DraggableFormCard from '@/components/dashboard/DraggableFormCard';
import UngroupedFormsSection from '@/components/dashboard/UngroupedFormsSection';

interface FormWithStats extends Form {
  responseCount: number;
  viewCount: number;
  _count?: { responses: number };
}

export default function DashboardPage() {
  const [forms, setForms] = useState<FormWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<FormWithStats | null>(null);
  const [collaboratorModalData, setCollaboratorModalData] = useState<{ isOpen: boolean; collaborators: any[]; formTitle: string; formId: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; formId: string } | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [folderDeleteConfirmOpen, setFolderDeleteConfirmOpen] = useState(false);
  
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

  // Scroll hint logic
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(true);



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
      alert('Cannot create form at this moment.');
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
    } catch (error) {
      console.error('Failed to delete form:', error);
      alert('Failed to delete form. Please try again.');
    } finally {
      setFormToDelete(null);
    }
  };

  const handleDuplicateForm = async (formId: string) => {
    try {
      await api.post(`/forms/${formId}/clone`);
      loadForms();
    } catch (error) {
      console.error('Failed to clone form:', error);
      alert('Failed to duplicate form.');
    }
  };

  const handleCopyLink = (formId: string) => {
    const url = `${window.location.origin}/forms/${formId}/view`;
    navigator.clipboard.writeText(url);
    // You could add a toast here if you had one
    alert('Link copied to clipboard!');
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
      alert('Failed to delete folder. Please try again.');
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
    return date.toLocaleString('en-US', {
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
                         (filterStatus === 'Published' && form.status === 'PUBLISHED') ||
                         (filterStatus === 'Draft' && form.status === 'DRAFT') ||
                         (filterStatus === 'Archived' && form.status === 'ARCHIVED');
    return matchesSearch && matchesStatus;
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
          <p className="text-gray-500 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }



  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop } = scrollContainerRef.current;
      setShowScrollHint(scrollTop < 50);
    }
  };

  const scrollToContent = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const start = container.scrollTop;
    const target = window.innerHeight - 100;
    const distance = target - start;
    const duration = 800; // ms
    let startTime: number | null = null;

    const easeInOutQuad = (t: number) => {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    };

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const ease = easeInOutQuad(progress);

      container.scrollTop = start + distance * ease;

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };



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
  const getFormsInFolder = (folderId: string) => {
    return forms.filter(f => f.folderId === folderId);
  };

  return (
    <div className="h-full bg-gray-50/50 overflow-hidden select-none flex flex-col relative" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        e.stopPropagation();
      }
    }}>
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, x: `${particle.x}%`, y: `${particle.y}%` }}
            animate={{ 
              opacity: [0.3, 0.8, 0.3], 
              y: [`${particle.y}%`, `${particle.y - 20}%`, `${particle.y}%`],
              x: [`${particle.x}%`, `${particle.x + 5}%`, `${particle.x}%`] 
            }}
            transition={{ 
              duration: particle.duration, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: particle.delay 
            }}
            className="absolute rounded-full bg-gradient-to-br from-indigo-200/20 to-purple-200/20 blur-sm"
            style={{ 
              width: particle.size * 4, 
              height: particle.size * 4,
            }}
          />
        ))}
      </div>

      <DashboardHeader 
        username={user?.firstName}
        onCreateForm={createNewForm}
        isCreating={isCreating}
      />

      <div className="flex-shrink-0 z-10 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <SearchFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-y-auto bg-gray-50/50 pb-20 scroll-smooth" 
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="max-w-7xl mx-auto px-8 py-8">
            <FoldersSection 
              folders={folders}
              forms={forms} // Pass all forms so folder can find them
              onCreateFolder={() => setIsCreateFolderModalOpen(true)}
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

            {filteredForms.length === 0 && folders.length === 0 ? (
              <EmptyState searchTerm={searchTerm} onCreateForm={createNewForm} />
            ) : (
              <UngroupedFormsSection
                forms={ungroupedForms}
                foldersCount={folders.length}
                user={user}
                navigate={navigate}
                handleContextMenu={handleContextMenu}
                setSelectedForm={setSelectedForm}
                handleDeleteForm={handleDeleteForm}
                setCollaboratorModalData={setCollaboratorModalData}
                formatDate={formatDate}
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
      
      {/* Scroll Hint Button */}
      <AnimatePresence>
        {filteredForms.length > 4 && showScrollHint && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
            >
                <div className="relative pointer-events-auto cursor-pointer" onClick={scrollToContent}>
                    {/* Pulsing Ring */}
                    <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gray-400 rounded-full blur-sm"
                    />
                    
                    {/* Orbiting Particles */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            animate={{ 
                                rotate: 360,
                                scale: [1, 1.2, 1]
                            }}
                            transition={{ 
                                rotate: { duration: 3 + i, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                            }}
                            className="absolute inset-0"
                        >
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2" />
                        </motion.div>
                    ))}

                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-xl border border-gray-200 text-black hover:scale-110 hover:bg-gray-50 transition-all duration-300 z-10"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </motion.div>
                </div>
                

            </motion.div>
        )}
      </AnimatePresence>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
      
      <CreateFolderModal
        isOpen={isCreateFolderModalOpen}
        onClose={() => setIsCreateFolderModalOpen(false)}
        onCreate={(name, color) => createFolder(name, color)}
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
        title="Delete Form?"
        description="Are you sure you want to delete this form? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      <ConfirmDialog
        open={folderDeleteConfirmOpen}
        onOpenChange={setFolderDeleteConfirmOpen}
        title="Delete Folder?"
        description="Are you sure you want to delete this folder? Forms inside will be moved to All Forms."
        confirmText="Delete Folder"
        cancelText="Cancel"
        onConfirm={confirmDeleteFolder}
        variant="destructive"
      />
    </div>
  );
}

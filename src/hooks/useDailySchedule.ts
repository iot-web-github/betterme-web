import { useState, useEffect, useCallback } from 'react';
import { ScheduleTemplate, TaskCategory, TaskPriority } from '@/types/schedule';
import { v4 as uuidv4 } from 'uuid';

const TEMPLATES_STORAGE_KEY = 'smart-schedule-templates';

const getStoredTemplates = (): ScheduleTemplate[] => {
  try {
    const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTemplates = (templates: ScheduleTemplate[]) => {
  localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
};

export const useDailySchedule = () => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTemplates = getStoredTemplates();
    setTemplates(storedTemplates);
    setIsLoading(false);
  }, []);

  const addTemplate = useCallback((templateData: Omit<ScheduleTemplate, 'id'>) => {
    const newTemplate: ScheduleTemplate = {
      ...templateData,
      id: uuidv4(),
    };
    
    setTemplates(prev => {
      const updated = [...prev, newTemplate];
      saveTemplates(updated);
      return updated;
    });
    
    return newTemplate;
  }, []);

  const updateTemplate = useCallback((templateId: string, updates: Partial<ScheduleTemplate>) => {
    setTemplates(prev => {
      const updated = prev.map(template =>
        template.id === templateId
          ? { ...template, ...updates }
          : template
      );
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const deleteTemplate = useCallback((templateId: string) => {
    setTemplates(prev => {
      const updated = prev.filter(template => template.id !== templateId);
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const toggleTemplateActive = useCallback((templateId: string) => {
    setTemplates(prev => {
      const updated = prev.map(template =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      );
      saveTemplates(updated);
      return updated;
    });
  }, []);

  const getTemplatesForDay = useCallback((dayOfWeek: number) => {
    return templates.filter(t => t.isActive && t.daysOfWeek.includes(dayOfWeek));
  }, [templates]);

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
    getTemplatesForDay,
  };
};

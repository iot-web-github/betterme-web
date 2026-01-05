import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleTemplate {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string;
  category?: string;
  priority: string;
  description?: string;
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
}

export const useScheduleTemplatesDB = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('schedule_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = useCallback(async (templateData: Omit<ScheduleTemplate, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('schedule_templates')
        .insert({
          ...templateData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => [...prev, data]);
      toast({ title: 'Template added' });
      return data;
    } catch (error) {
      console.error('Error adding template:', error);
      toast({ title: 'Failed to add template', variant: 'destructive' });
      return null;
    }
  }, [user, toast]);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<ScheduleTemplate>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('schedule_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;
      setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating template:', error);
      toast({ title: 'Failed to update template', variant: 'destructive' });
    }
  }, [user, toast]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('schedule_templates')
        .delete()
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      toast({ title: 'Template deleted' });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: 'Failed to delete template', variant: 'destructive' });
    }
  }, [user, toast]);

  const toggleTemplateActive = useCallback(async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      await updateTemplate(templateId, { is_active: !template.is_active });
    }
  }, [templates, updateTemplate]);

  const getTemplatesForDay = useCallback((dayOfWeek: number) => {
    return templates.filter(t => t.is_active && t.days_of_week.includes(dayOfWeek));
  }, [templates]);

  return {
    templates,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    toggleTemplateActive,
    getTemplatesForDay,
    refetch: fetchTemplates
  };
};

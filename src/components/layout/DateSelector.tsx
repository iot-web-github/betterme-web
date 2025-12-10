import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface DateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}
export const DateSelector = ({
  selectedDate,
  onDateChange
}: DateSelectorProps) => {
  const today = new Date().toISOString().split('T')[0];
  const getWeekDays = () => {
    const selected = new Date(selectedDate);
    const days = [];
    const day = selected.getDay();
    const diff = selected.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(selected);
    monday.setDate(diff);
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push(date);
    }
    return days;
  };
  const weekDays = getWeekDays();
  const navigateWeek = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 7 : -7));
    onDateChange(current.toISOString().split('T')[0]);
  };
  const goToToday = () => {
    onDateChange(today);
  };
  return <div className="flex items-center gap-4">
      
      
      {selectedDate !== today && <Button variant="outline" size="sm" onClick={goToToday} className="text-xs">
          Today
        </Button>}
    </div>;
};
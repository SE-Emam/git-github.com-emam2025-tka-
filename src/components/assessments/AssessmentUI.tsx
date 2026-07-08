import * as React from 'react';
import { motion } from 'motion/react';
import { Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  showNotes?: boolean;
}

export const RatingScale: React.FC<RatingScaleProps> = ({ 
  value, 
  onChange, 
  max = 5, 
  label, 
  notes, 
  onNotesChange,
  showNotes = true
}) => {
  return (
    <div className="space-y-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-lg hover:shadow-slate-200/20 group">
      {label && <p className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-widest">{label}</p>}
      
      <div className="flex flex-wrap items-center gap-3">
        {[...Array(max)].map((_, i) => {
          const rating = i + 1;
          const isActive = value >= rating;
          
          return (
            <motion.button
              key={rating}
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(rating)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border-2",
                isActive 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                  : "bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-primary/50"
              )}
            >
              {rating}
            </motion.button>
          );
        })}
        
        <div className="ml-auto">
          <span className={cn(
            "text-xs font-black uppercase tracking-widest",
            value === 5 ? "text-green-500" : value >= 3 ? "text-blue-500" : value > 0 ? "text-orange-500" : "text-slate-400"
          )}>
            {value === 5 ? "ممتاز" : value === 4 ? "جيد جداً" : value === 3 ? "جيد" : value === 2 ? "مقبول" : value === 1 ? "ضعيف" : "لم يتم التقييم"}
          </span>
        </div>
      </div>

      {showNotes && onNotesChange && (
        <motion.div 
          initial={false}
          animate={{ opacity: value > 0 ? 1 : 0.5 }}
          className="relative"
        >
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="أضف ملاحظاتك هنا..."
            className="w-full h-20 bg-white dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </motion.div>
      )}
    </div>
  );
};

export const StarRating: React.FC<{ value: number, onChange: (val: number) => void, label?: string }> = ({ value, onChange, label }) => {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {label && <p className="font-black text-slate-800 dark:text-slate-100 uppercase text-sm tracking-[0.2em]">{label}</p>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star 
              size={48} 
              className={cn(
                "transition-colors duration-300",
                value >= star ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-800 fill-transparent"
              )} 
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export const AssessmentSection: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
  <section className="space-y-6">
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h2>
        <div className="h-1 w-12 bg-primary rounded-full mt-1" />
      </div>
    </div>
    <div className="grid gap-6">
      {children}
    </div>
  </section>
);

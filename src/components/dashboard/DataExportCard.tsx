import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { exportUserDataAsZip } from '@/lib/dataExportZip';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, FileArchive, Loader2, Shield } from 'lucide-react';

export const DataExportCard = () => {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) {
      toast.error('Please sign in to export your data');
      return;
    }

    setExporting(true);
    
    try {
      await exportUserDataAsZip(user.id);
      toast.success('Data exported successfully!', {
        description: 'Your ZIP file has been downloaded.',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data', {
        description: 'Please try again later.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-info to-success flex items-center justify-center">
          <FileArchive className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Export Your Data</h3>
          <p className="text-xs text-muted-foreground">Download all your data as ZIP</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Shield className="w-4 h-4 shrink-0 mt-0.5 text-success" />
          <p>Your data is private and secure. Export includes all tasks, goals, analytics, and preferences in both JSON and CSV formats.</p>
        </div>

        <Button
          onClick={handleExport}
          disabled={exporting || !user}
          className="w-full gap-2 h-10"
          variant="outline"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Preparing export...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download All Data (.zip)
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

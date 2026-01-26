import { useState } from 'react';
import { useToast } from '@/components/ui/toaster';
import { useTranslation } from 'react-i18next';

export const useChartExport = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyChartToClipboard = async (chartId: string) => {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) return;
      
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartElement, { backgroundColor: '#ffffff' });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setCopySuccess(chartId);
            setTimeout(() => setCopySuccess(null), 2000);
            toast({
              title: t('analytics.chart_copied'),
              description: t('analytics.chart_copied'), 
              variant: "success",
              duration: 2000
            });
          } catch {
            const link = document.createElement('a');
            link.download = `${chartId}.png`;
            link.href = canvas.toDataURL();
            link.click();
            setCopySuccess(chartId);
            setTimeout(() => setCopySuccess(null), 2000);
            toast({
              title: t('analytics.chart_downloaded'),
              description: t('analytics.chart_downloaded'),
              variant: "success",
              duration: 2000
            });
          }
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to copy chart:', error);
      toast({
        title: t('auth.error'),
        description: t('analytics.export_failed'),
        variant: "error"
      });
    }
  };

  return { copyChartToClipboard, copySuccess };
};

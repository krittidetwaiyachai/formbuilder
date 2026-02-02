import { useState } from 'react';
import { useToast } from '@/components/ui/toaster';
import { useTranslation } from 'react-i18next';

const downloadImage = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

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
          const isSecureContext = window.isSecureContext ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1';

          if (isSecureContext && navigator.clipboard && navigator.clipboard.write) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              setCopySuccess(chartId);
              setTimeout(() => setCopySuccess(null), 2000);
              toast({
                title: t('analytics.chart_copied'),
                description: t('analytics.chart_copied_desc'),
                variant: "success",
                duration: 2000
              });
            } catch (err) {
              console.error('Clipboard write failed:', err);
              downloadImage(blob, chartId);
              toast({
                title: t('analytics.chart_downloaded', 'ดาวน์โหลดรูปกราฟ'),
                description: t('analytics.chart_downloaded_desc', 'ไม่สามารถคัดลอกได้ จึงดาวน์โหลดเป็นไฟล์แทน'),
                variant: "default",
                duration: 3000
              });
            }
          } else {
            downloadImage(blob, chartId);
            toast({
              title: t('analytics.chart_downloaded', 'ดาวน์โหลดรูปกราฟ'),
              description: t('analytics.clipboard_not_available', 'การคัดลอกใช้ได้เฉพาะ HTTPS หรือ localhost เท่านั้น'),
              variant: "default",
              duration: 3000
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

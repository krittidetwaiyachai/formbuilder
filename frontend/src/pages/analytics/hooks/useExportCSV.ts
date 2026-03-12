import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface ExportProgress {
    status: 'processing' | 'completed' | 'failed';
    loaded: number;
    total: number;
    error?: string;
}

export function useExportCSV(formId: string) {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState<ExportProgress | null>(null);

    const startExport = useCallback(async () => {
        try {
            setIsExporting(true);
            setProgress({ status: 'processing', loaded: 0, total: 100 }); // initial state

            // 1. Start the job
            const response = await api.post(`/responses/form/${formId}/export/start`);
            const jobId = response.data.id;

            // 2. Listen to SSE progress
            const source = new EventSource(`${import.meta.env.VITE_API_URL}/responses/export/progress/${jobId}`);

            source.onmessage = (event) => {
                try {
                    const data: ExportProgress = JSON.parse(event.data);
                    setProgress(data);

                    if (data.status === 'completed' || data.status === 'failed') {
                        source.close();
                        setIsExporting(false);

                        if (data.status === 'completed') {
                            // 3. Trigger download when ready
                            window.location.href = `${import.meta.env.VITE_API_URL}/responses/export/download/${jobId}`;
                            setTimeout(() => {
                                setProgress(null);
                            }, 3000);
                        } else if (data.status === 'failed') {
                            alert('Export failed: ' + (data.error || 'Unknown error'));
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse SSE data", e);
                }
            };

            source.onerror = (err) => {
                console.error("SSE Error:", err);
                source.close();
                setIsExporting(false);
                setProgress({ status: 'failed', loaded: 0, total: 0, error: 'Connection lost' });
            };

        } catch (error) {
            console.error('Failed to start export:', error);
            setIsExporting(false);
            setProgress({ status: 'failed', loaded: 0, total: 0, error: 'Start failed' });
        }
    }, [formId]);

    return { isExporting, progress, startExport };
}

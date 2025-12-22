import { FormSchema, FormSubmission } from "@/types/form";
import { ActivityLog, ActiveEditor } from "@/types/collaboration";

// In-memory data store
// In production, this would be replaced with a database

class DataStore {
  private forms: Map<string, FormSchema> = new Map();
  private submissions: Map<string, FormSubmission> = new Map();
  private activityLogs: Map<string, ActivityLog> = new Map();
  private activeEditors: Map<string, Map<string, ActiveEditor>> = new Map(); // formId -> userId -> ActiveEditor
  private formViews: Map<string, Set<string>> = new Map(); // formId -> Set of view IDs (for tracking unique views)

  // Forms
  getAllForms(): FormSchema[] {
    return Array.from(this.forms.values());
  }

  getForm(id: string): FormSchema | undefined {
    return this.forms.get(id);
  }

  createForm(form: FormSchema): FormSchema {
    this.forms.set(form.id, form);
    return form;
  }

  updateForm(id: string, updates: Partial<FormSchema>): FormSchema | null {
    const existing = this.forms.get(id);
    if (!existing) return null;
    
    const updated = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };
    this.forms.set(id, updated);
    return updated;
  }

  deleteForm(id: string): boolean {
    // Also delete related submissions and activity logs
    const submissionsToDelete = Array.from(this.submissions.values())
      .filter(s => s.formId === id)
      .map(s => s.id);
    
    submissionsToDelete.forEach(subId => this.submissions.delete(subId));
    
    const logsToDelete = Array.from(this.activityLogs.values())
      .filter(log => log.formId === id)
      .map(log => log.id);
    
    logsToDelete.forEach(logId => this.activityLogs.delete(logId));
    
    this.activeEditors.delete(id);
    this.formViews.delete(id);
    
    return this.forms.delete(id);
  }

  incrementFormView(id: string): void {
    const form = this.forms.get(id);
    if (form) {
      const views = this.formViews.get(id) || new Set();
      const viewId = `${Date.now()}-${Math.random()}`;
      views.add(viewId);
      this.formViews.set(id, views);
      
      this.updateForm(id, {
        viewCount: views.size,
      });
    }
  }

  // Submissions
  getAllSubmissions(formId?: string): FormSubmission[] {
    const all = Array.from(this.submissions.values());
    if (formId) {
      return all.filter(s => s.formId === formId);
    }
    return all;
  }

  getSubmission(id: string): FormSubmission | undefined {
    return this.submissions.get(id);
  }

  createSubmission(submission: FormSubmission): FormSubmission {
    this.submissions.set(submission.id, submission);
    
    // Update form response count
    const form = this.forms.get(submission.formId);
    if (form) {
      const existingSubmissions = this.getAllSubmissions(submission.formId);
      this.updateForm(submission.formId, {
        responseCount: existingSubmissions.length,
      });
    }
    
    return submission;
  }

  deleteSubmission(id: string): boolean {
    const submission = this.submissions.get(id);
    if (!submission) return false;
    
    const deleted = this.submissions.delete(id);
    
    // Update form response count
    const form = this.forms.get(submission.formId);
    if (form) {
      const existingSubmissions = this.getAllSubmissions(submission.formId);
      this.updateForm(submission.formId, {
        responseCount: existingSubmissions.length,
      });
    }
    
    return deleted;
  }

  // Activity Logs
  getActivityLogs(formId: string): ActivityLog[] {
    return Array.from(this.activityLogs.values())
      .filter(log => log.formId === formId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  createActivityLog(log: ActivityLog): ActivityLog {
    this.activityLogs.set(log.id, log);
    return log;
  }

  // Active Editors
  getActiveEditors(formId: string): ActiveEditor[] {
    const editors = this.activeEditors.get(formId);
    if (!editors) return [];
    
    // Filter out inactive editors (not seen in last 30 seconds)
    const now = Date.now();
    const active: ActiveEditor[] = [];
    
    editors.forEach(editor => {
      const lastSeen = new Date(editor.lastSeen).getTime();
      if (now - lastSeen < 30000) { // 30 seconds
        active.push(editor);
      }
    });
    
    return active;
  }

  updateActiveEditor(formId: string, editor: ActiveEditor): void {
    if (!this.activeEditors.has(formId)) {
      this.activeEditors.set(formId, new Map());
    }
    
    const editors = this.activeEditors.get(formId)!;
    editors.set(editor.userId, editor);
  }

  removeActiveEditor(formId: string, userId: string): void {
    const editors = this.activeEditors.get(formId);
    if (editors) {
      editors.delete(userId);
    }
  }

  // Analytics helpers
  getAnalyticsData(formId: string) {
    const form = this.forms.get(formId);
    if (!form) return null;

    const submissions = this.getAllSubmissions(formId);
    const views = this.formViews.get(formId) || new Set();
    
    const totalViews = views.size;
    const totalSubmissions = submissions.length;
    const submissionRate = totalViews > 0 ? (totalSubmissions / totalViews) * 100 : 0;
    
    // Calculate bounce rate (views without submissions within 5 seconds)
    // For simplicity, we'll use a mock bounce rate
    const bounceRate = totalViews > 0 ? ((totalViews - totalSubmissions) / totalViews) * 100 : 0;
    
    // Daily visits (last 7 days)
    const dailyVisits: Array<{ date: string; views: number; submissions: number }> = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Count submissions for this day
      const daySubmissions = submissions.filter(s => {
        const subDate = new Date(s.submittedAt);
        return subDate.toDateString() === date.toDateString();
      }).length;
      
      // For views, we'll estimate based on submissions (in real app, track views separately)
      const dayViews = Math.max(daySubmissions * 3, 0); // Rough estimate
      
      dailyVisits.push({
        date: dateStr,
        views: dayViews,
        submissions: daySubmissions,
      });
    }
    
    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    submissions.forEach(sub => {
      const device = sub.device || 'desktop';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });
    
    const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
    const deviceBreakdown = Object.entries(deviceCounts).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: totalDevices > 0 ? (count / totalDevices) * 100 : 0,
    }));
    
    return {
      totalViews,
      totalSubmissions,
      submissionRate: Number(submissionRate.toFixed(1)),
      bounceRate: Number(bounceRate.toFixed(1)),
      dailyVisits,
      deviceBreakdown,
    };
  }
}

// Singleton instance
export const dataStore = new DataStore();

// Initialize with mock data if needed
export function initializeDataStore() {
  // You can seed initial data here if needed
}


export interface Report {
  id: string;
  name: string;
  date: string;
  url: string;
}

const API_URL = 'http://localhost:3000/api/reports';

// --- CONFIGURACIÓN DE MODO SIMULACIÓN ---
// Cambia esto a false cuando tengas el servidor (backend) corriendo.
const USE_MOCK = true;
const STORAGE_KEY = 'cootransures_reports';

export const reportService = {
  fetchReports: async (): Promise<Report[]> => {
    // Si estamos en modo simulación, usamos localStorage
    if (USE_MOCK) {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    // Modo Real: Petición al Servidor
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      return [];
    }
  },

  uploadReport: async (file: File): Promise<Report | null> => {
    // Si estamos en modo simulación, simulamos una subida lenta
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReport: Report = {
            id: crypto.randomUUID(),
            name: file.name,
            date: new Date().toLocaleDateString(),
            url: '#' // URL falsa, no abrirá nada real
          };
          const existing = localStorage.getItem(STORAGE_KEY);
          const reports = existing ? JSON.parse(existing) : [];
          const updated = [newReport, ...reports];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          resolve(newReport);
        }, 800);
      });
    }

    // Modo Real: Subida con Multipart Form
    const formData = new FormData();
    formData.append('report', file);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      return await response.json();
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Error: Backend no detectado. Si estás probando sin servidor, activa USE_MOCK = true en reportService.ts');
      return null;
    }
  },

  deleteReport: async (id: string): Promise<boolean> => {
    if (USE_MOCK) {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) return false;
      const reports = JSON.parse(existing) as Report[];
      const updated = reports.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Delete Error:', error);
      return false;
    }
  }
};


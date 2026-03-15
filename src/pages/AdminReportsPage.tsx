import React, { useState, useEffect } from 'react';
import { reportService, type Report } from '../services/reportService';
import './AdminReportsPage.css';

const AdminReportsPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [reports, setReports] = useState<Report[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Check if there is a saved token to persist session (sessionStorage)
        const savedToken = sessionStorage.getItem('cootransures_auth_token');
        if (savedToken) {
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            reportService.fetchReports().then(setReports).catch(err => {
                console.error('Error fetching reports:', err);
                if (err.message.includes('401') || err.message.includes('403')) {
                    handleLogout();
                }
            });
        }
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const result = await reportService.login(username, password);

        if (result.success) {
            setIsAuthenticated(true);
        } else {
            setError(result.message || 'Credenciales incorrectas');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('cootransures_auth_token');
        setIsAuthenticated(false);
        setReports([]);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            const file = e.target.files[0];
            try {
                await reportService.uploadReport(file);
                const latestReports = await reportService.fetchReports();
                setReports(latestReports);
            } catch (err: any) {
                console.error('Upload error:', err);
                alert(err.message || 'Error al subir el archivo');
            } finally {
                setIsUploading(false);
                e.target.value = '';
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este informe?')) {
            const success = await reportService.deleteReport(id);
            if (success) {
                setReports(await reportService.fetchReports());
            } else {
                alert('Error eliminando el informe');
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-login-container">
                <div className="login-box">
                    <h2>Administración de Informes</h2>
                    <p>Acceso restringido a la Jefa de Cooperativa</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="login-input"
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                        {error && <p className="error-text">{error}</p>}
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Ingresar</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard container section">
            <div className="dashboard-header">
                <h2>CRM - Gestión de Informes</h2>
                <button onClick={handleLogout} className="btn-secondary logout-btn">Cerrar Sesión</button>
            </div>

            <div className="admin-actions">
                <div className="upload-card">
                    <h3>Subir Nuevo Informe</h3>
                    <p>Selecciona un archivo PDF para publicarlo en la web visible para todos.</p>
                    <label className={`upload-btn ${isUploading ? 'disabled' : ''}`}>
                        {isUploading ? 'Subiendo...' : 'Seleccionar PDF'}
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleUpload}
                            disabled={isUploading}
                            hidden
                        />
                    </label>
                </div>
            </div>

            <div className="admin-reports-list">
                <h3>Informes Publicados</h3>
                {reports.length === 0 ? (
                    <p className="no-reports">No hay informes publicados actualmente.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Nombre del Archivo</th>
                                    <th>Fecha de Subida</th>
                                    <th>ID</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>
                                            <div className="file-info">
                                                <span className="file-icon">📄</span>
                                                {report.name}
                                            </div>
                                        </td>
                                        <td>{report.date}</td>
                                        <td className="monospace">{String(report.id).substring(0, 8)}...</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(report.id)}
                                                className="btn-delete"
                                                title="Eliminar informe"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReportsPage;

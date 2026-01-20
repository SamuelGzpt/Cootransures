import React, { useState, useEffect } from 'react';
import { reportService, type Report } from '../services/reportService';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        reportService.fetchReports().then(setReports);
    }, []);

    return (
        <div className="reports-dashboard container section">
            <div className="dashboard-header public-header">
                <h2>Informes y Balances</h2>
                <p>Documentación pública de la cooperativa COOTRANSURES</p>
            </div>

            <div className="reports-list">
                {reports.length === 0 ? (
                    <div className="no-reports-public">
                        <p>No hay informes disponibles en este momento.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>Documento</th>
                                    <th>Fecha de Publicación</th>
                                    <th style={{ textAlign: 'right' }}>Descarga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.id}>
                                        <td>
                                            <div className="report-name-cell">
                                                <span className="file-icon-large">📄</span>
                                                <span className="file-name-text">{report.name}</span>
                                            </div>
                                        </td>
                                        <td>{report.date}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <a href={report.url} className="btn-download" onClick={(e) => e.preventDefault()}>
                                                Descargar PDF
                                            </a>
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

export default ReportsPage;

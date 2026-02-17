import React, { type ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout">
            <Navbar />
            <main>{children}</main>
            <footer style={{
                backgroundColor: '#1a252f', /* Matches bottom of contact gradient */
                color: '#ecf0f1',
                padding: '1rem',
                textAlign: 'center',
                marginTop: 'auto',
                fontSize: '0.9rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div className="container">
                    <p style={{ margin: 0 }}>© 2026 Cootransures. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

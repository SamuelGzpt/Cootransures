import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoFinal from '../assets/Slider/LOGO_final.png';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const getLink = (id: string) => {
        return location.pathname === '/' ? id : `/${id}`;
    };

    const handleNavClick = () => setMenuOpen(false);

    return (
        <>
            <nav className="navbar">
                <div className="container navbar-content">
                    <a href={getLink('#inicio')} className="logo">
                        <img src={logoFinal} alt="Cootransures Logo" className="navbar-logo-img" />
                    </a>

                    {/* Desktop links */}
                    <ul className="nav-links">
                        <li><a href={getLink('#inicio')}>Inicio</a></li>
                        <li><a href={getLink('#quienes-somos')}>Quiénes Somos</a></li>
                        <li><a href={getLink('#servicios')}>Servicios</a></li>
                        <li><a href={getLink('#transport-solution')}>Transport Solution</a></li>
                        <li><Link to="/informes">Informes</Link></li>
                        <li><a href={getLink('#contactanos')} className="btn-contact">Contáctanos</a></li>
                    </ul>

                    {/* Hamburger button — only visible on mobile */}
                    <button
                        className="hamburger"
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </nav>

            {/* Mobile overlay menu */}
            <div className={`mobile-overlay ${menuOpen ? 'open' : ''}`}>
                <ul className="mobile-nav-links">
                    <li><a href={getLink('#inicio')} onClick={handleNavClick}>Inicio</a></li>
                    <li><a href={getLink('#quienes-somos')} onClick={handleNavClick}>Quiénes Somos</a></li>
                    <li><a href={getLink('#servicios')} onClick={handleNavClick}>Servicios</a></li>
                    <li><a href={getLink('#transport-solution')} onClick={handleNavClick}>Transport Solution</a></li>
                    <li><Link to="/informes" onClick={handleNavClick}>Informes</Link></li>
                    <li>
                        <a href={getLink('#contactanos')} className="btn-contact-mobile" onClick={handleNavClick}>
                            Contáctanos
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Navbar;

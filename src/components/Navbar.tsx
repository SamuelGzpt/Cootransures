import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const location = useLocation();

    const getLink = (id: string) => {
        return location.pathname === '/' ? id : `/${id}`;
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <a href={getLink('#inicio')} className="logo">
                    <span className="logo-text">COOTRANSURES</span>
                </a>

                <ul className="nav-links">
                    <li><a href={getLink('#inicio')}>Inicio</a></li>
                    <li><a href={getLink('#quienes-somos')}>Quiénes Somos</a></li>
                    <li><a href={getLink('#servicios')}>Servicios</a></li>
                    <li><Link to="/informes">Informes</Link></li>
                    <li><a href={getLink('#contactanos')} className="btn-contact">Contáctanos</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

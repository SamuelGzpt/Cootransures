import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ShieldCheck, Star, Users } from 'lucide-react';
import './ServiceSlider.css';

// Import images
// Import images from slider folder for better relevance
import corporateImg from '../assets/Slider/carro_garaje.jpeg';
import touristImg from '../assets/Slider/FotoCarroCascada.jpeg';
import schoolImg from '../assets/Slider/FotoTransporteEscolar.jpeg';

interface Service {
    id: number;
    title: string;
    description: string;
    image: string;
    badge: string;
    icon: React.ReactNode;
}

const services: Service[] = [
    {
        id: 1,
        title: "Transporte Empresarial",
        description: "Elevamos la productividad de su empresa con soluciones de movilidad corporativa puntuales, cómodas y seguras. Nuestra flota moderna garantiza que su personal llegue a tiempo y descansado.",
        image: corporateImg,
        badge: "Corporativo",
        icon: <Users size={20} />
    },
    {
        id: 2,
        title: "Transporte Turístico",
        description: "Descubra nuevos destinos con la máxima comodidad. Nuestros buses están equipados para viajes largos, ofreciendo vistas panorámicas y un ambiente relajado para que el viaje sea parte de la experiencia.",
        image: touristImg,
        badge: "Turismo",
        icon: <Star size={20} />
    },
    {
        id: 3,
        title: "Transporte Escolar",
        description: "La seguridad de los estudiantes es nuestra prioridad. Conductores certificados y vehículos monitoreados para brindar tranquilidad a padres e instituciones educativas en cada ruta.",
        image: schoolImg,
        badge: "Escolar",
        icon: <ShieldCheck size={20} />
    }
];

const ServiceSlider: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const slideRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(() => {
            handleNext();
        }, 6000);

        return () => resetTimeout();
    }, [currentIndex]);

    useEffect(() => {
        // Animation on slide change
        const tl = gsap.timeline();

        if (contentRef.current && imageRef.current) {
            tl.fromTo(contentRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
            );

            tl.fromTo(imageRef.current,
                { scale: 1.1, opacity: 0.8 },
                { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
                "-=0.6"
            );
        }
    }, [currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === services.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? services.length - 1 : prev - 1));
    };

    return (
        <div className="service-slider-container">
            {services.map((service, index) => (
                <div
                    key={service.id}
                    className={`service-slide ${index === currentIndex ? 'active' : ''}`}
                    style={{ zIndex: index === currentIndex ? 1 : 0 }}
                >
                    {index === currentIndex && (
                        <>
                            <div className="service-content" ref={contentRef}>
                                <div className="service-badges">
                                    <span className="badge">{service.badge}</span>
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                                <div className="slide-actions">
                                    {/* Optional: Add a button here if needed */}
                                </div>
                            </div>
                            <div className="service-image-container">
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="service-image"
                                    ref={imageRef}
                                />
                            </div>
                        </>
                    )}
                </div>
            ))}

            <div className="slider-controls">
                <button className="slider-btn" onClick={handlePrev} aria-label="Previous slide">
                    <ChevronLeft size={24} />
                </button>
                <div className="slider-dots">
                    {services.map((_, idx) => (
                        <span
                            key={idx}
                            className={`slider-dot ${idx === currentIndex ? 'active' : ''}`}
                            onClick={() => setCurrentIndex(idx)}
                        />
                    ))}
                </div>
                <button className="slider-btn" onClick={handleNext} aria-label="Next slide">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default ServiceSlider;

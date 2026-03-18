import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PhotoSlider: React.FC = () => {
    const topRowRef = useRef<HTMLDivElement>(null);
    const bottomRowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const top = topRowRef.current;
        const bottom = bottomRowRef.current;

        if (top && bottom) {
            let topOriginalCount = parseInt(top.getAttribute('data-count-top') || '0', 10);
            let bottomOriginalCount = parseInt(bottom.getAttribute('data-count-bottom') || '0', 10);

            // Clone elements only once (protects against React Strict Mode double-invocations)
            if (top.getAttribute('data-cloned') !== 'true') {
                topOriginalCount = top.children.length;
                bottomOriginalCount = bottom.children.length;
                
                top.setAttribute('data-cloned', 'true');
                top.setAttribute('data-count-top', topOriginalCount.toString());
                bottom.setAttribute('data-count-bottom', bottomOriginalCount.toString());

                const topChildren = Array.from(top.children) as HTMLElement[];
                const bottomChildren = Array.from(bottom.children) as HTMLElement[];

                topChildren.forEach(child => top.appendChild(child.cloneNode(true)));
                bottomChildren.forEach(child => bottom.appendChild(child.cloneNode(true)));
            }

            let topAnim: gsap.core.Tween;
            let bottomAnim: gsap.core.Tween;

            const setupAnimations = () => {
                const firstOriginalTop = top.children[0] as HTMLElement;
                const firstClonedTop = top.children[topOriginalCount] as HTMLElement;
                
                if (!firstOriginalTop || !firstClonedTop) return;
                
                // OffsetLeft gives exact distance handling any gaps between start of original and clone
                const singleSetWidthTop = firstClonedTop.offsetLeft - firstOriginalTop.offsetLeft;
                if (singleSetWidthTop <= 0) return;

                if (topAnim) topAnim.kill();
                topAnim = gsap.to(top, { // Add explicit fromTo maybe? Actually, just to is fine
                    x: -singleSetWidthTop,
                    duration: 90,
                    ease: "linear",
                    repeat: -1
                });

                const firstOriginalBottom = bottom.children[0] as HTMLElement;
                const firstClonedBottom = bottom.children[bottomOriginalCount] as HTMLElement;
                const singleSetWidthBottom = firstClonedBottom.offsetLeft - firstOriginalBottom.offsetLeft;

                // Ensure bottomAnim is started from -width to 0
                if (bottomAnim) bottomAnim.kill();
                bottomAnim = gsap.fromTo(bottom, {
                    x: -singleSetWidthBottom
                }, {
                    x: 0,
                    duration: 90,
                    ease: "linear",
                    repeat: -1
                });
            };

            // Init animations
            setupAnimations();

            // Update animations sizes when images load affecting width
            const ro = new ResizeObserver(() => {
                setupAnimations();
            });
            ro.observe(top);

            return () => {
                ro.disconnect();
                if (topAnim) topAnim.kill();
                if (bottomAnim) bottomAnim.kill();
            };
        }
    }, []);

    // Load logo
    const logoUrl = new URL('../assets/Slider/LOGO_final.png', import.meta.url).href;

    // Load all jpeg images from the slider folder
    const imagesGlob = import.meta.glob('../assets/Slider/*.jpeg', { eager: true, as: 'url' });
    const imageUrls = Object.values(imagesGlob) as string[];

    // Shuffle images to make them varied on each load
    const shuffledImages = React.useMemo(() => {
        return [...imageUrls].sort(() => Math.random() - 0.5);
    }, []);

    // Split all images into two halves
    const halfIndex = Math.ceil(shuffledImages.length / 2);
    const topImages = shuffledImages.slice(0, halfIndex);
    const bottomImages = shuffledImages.slice(halfIndex);

    // Intercalar el logo asegurando que haya una separación adecuada (ej. mínimo 3 imágenes)
    // para evitar que al repetirse el slider (loop) queden dos logos muy juntos.
    const insertLogo = (images: string[], logo: string) => {
        const result: string[] = [];
        const gap = 4; // Insertar logo cada 4 imágenes
        for (let i = 0; i < images.length; i++) {
            // Aseguramos que al insertar un logo, queden suficientes imágenes hacia el final
            // para que no choque con el primer logo del siguiente ciclo (el loop).
            if (i % gap === 0) {
                const remaining = images.length - i;
                if (i === 0 || remaining >= gap - 1) {
                    result.push(logo);
                }
            }
            result.push(images[i]);
        }
        return result;
    };

    // Prepare rows
    const topRowItems = insertLogo(topImages, logoUrl);
    const bottomRowItems = insertLogo(bottomImages, logoUrl);

    const renderItems = (items: string[]) => items.map((src, i) => {
        const isLogo = src.includes('LOGO_final.png'); // Matches LOGO_v3.png, LOGO.png etc.
        return (
            <img
                key={i}
                src={src}
                alt={isLogo ? "Cootransures Logo" : `Slide ${i}`}
                className={`photo-item ${isLogo ? 'photo-logo' : ''}`}
            />
        );
    });

    return (
        <section className="photo-slider">
            <div className="row top-row" ref={topRowRef}>
                {renderItems(topRowItems)}
            </div>
            <div className="row bottom-row" ref={bottomRowRef}>
                {renderItems(bottomRowItems)}
            </div>
        </section>
    );
};

export default PhotoSlider;

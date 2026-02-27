import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PhotoSlider: React.FC = () => {
    const topRowRef = useRef<HTMLDivElement>(null);
    const bottomRowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const top = topRowRef.current;
        const bottom = bottomRowRef.current;

        if (top && bottom) {
            // Prevent duplicate cloning if already running (React Strict Mode)
            if (top.getAttribute('data-cloned') === 'true') return;
            top.setAttribute('data-cloned', 'true');
            bottom.setAttribute('data-cloned', 'true');

            // Measure initial width (Set A)
            // Note: In flex gap scenarios, scrollWidth might not account for the final gap if not explicit,
            // but the difference method is safer.
            const initialWidthTop = top.scrollWidth;

            // Duplicate items
            const topChildren = Array.from(top.children) as HTMLElement[];
            const bottomChildren = Array.from(bottom.children) as HTMLElement[];

            topChildren.forEach(child => top.appendChild(child.cloneNode(true)));
            bottomChildren.forEach(child => bottom.appendChild(child.cloneNode(true)));

            // Measure new width to get exact length of one set + one gap
            // The scrollWidth now includes: Set A + Gaps + Set A + Gaps (roughly)
            // The "period" is the width added.
            const finalWidthTop = top.scrollWidth;
            const singleSetWidth = finalWidthTop - initialWidthTop;

            // Top Row: Move LEFT (0 -> -width)
            gsap.to(top, {
                x: -singleSetWidth,
                duration: 90, // Even slower speed
                ease: "linear",
                repeat: -1
            });

            // Bottom Row: Move RIGHT (-width -> 0)
            // Start at -width (visualizing the clone set)
            // Animate to 0 (visualizing the original set)
            // seamless jump back to -width
            gsap.fromTo(bottom, {
                x: -singleSetWidth
            }, {
                x: 0,
                duration: 90, // Even slower speed
                ease: "linear",
                repeat: -1
            });
        }
    }, []);

    // Load logo
    const logoUrl = new URL('../assets/Slider/LOGO_final.png', import.meta.url).href;

    // Load all jpeg images from the slider folder
    const imagesGlob = import.meta.glob('../assets/Slider/*.jpeg', { eager: true, as: 'url' });
    const imageUrls = Object.values(imagesGlob);

    // Prepare rows
    // Top: 4 images + Logo
    const topRowItems = [...imageUrls.slice(0, 4), logoUrl];

    // Bottom: Logo + 4 images (taking the ones not used in top if possible, or just the next 4)
    // If there are exactly 8 images, we take 4..8.
    const bottomRowItems = [logoUrl, ...imageUrls.slice(4, 8)];

    const renderItems = (items: string[]) => items.map((src, i) => {
        const isLogo = src.includes('LOGO'); // Matches LOGO_v3.png, LOGO.png etc.
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

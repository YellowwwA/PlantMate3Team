
import React, { useEffect, useRef, useState } from "react";
import "../styles/MainPage.css"; // 스타일은 기존 유지

const Carousel = ({ mixedData = [] }) => {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);

  const REPEAT_COUNT = 50;
  const SLIDE_WIDTH = 275;
  const VISIBLE_COUNT = 5;

  const repeatedItems = Array(REPEAT_COUNT)
    .fill(null)
    .flatMap(() => mixedData);

  useEffect(() => {
    const interval = setInterval(() => setIndex((prev) => prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!trackRef.current || repeatedItems.length === 0) return;

    const totalSlides = repeatedItems.length;
    if (index >= totalSlides - VISIBLE_COUNT) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(0px)`;
      setIndex(1);
    } else {
      trackRef.current.style.transition = "transform 0.6s ease-in-out";
      trackRef.current.style.transform = `translateX(-${index * SLIDE_WIDTH}px)`;
    }
  }, [index, repeatedItems.length]);

  return (
    <div className="carousel-outer final-carousel">
      <div className="carousel-track final-carousel-track" ref={trackRef}>
        {repeatedItems.map((plant, idx) => (
          <div
            key={`${plant.name}-${idx}`}
            className={`carousel-slide ${idx === index ? "active" : "inactive"}`}
          >
            <div className="plant-card">
              <div
                className="plant-image"
                style={{ backgroundImage: `url(${plant.img})` }}
              />
              <div className="plant-info">
                <h3>{plant.name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;

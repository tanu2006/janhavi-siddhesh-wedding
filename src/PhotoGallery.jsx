
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./PhotoGallery.css";

const photos = [
  "/gallery/couple-main.JPG",
  "/gallery/IMG_2496.JPG",
  "/gallery/078A3739.JPG",
  "/gallery/078A3690.JPG",
];

function PhotoGallery() {
  const [activeIndex, setActiveIndex] = useState(0);

  const previousPhoto = () => {
    setActiveIndex((current) =>
      (current - 1 + photos.length) % photos.length
    );
  };

  const nextPhoto = () => {
    setActiveIndex((current) =>
      (current + 1) % photos.length
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) =>
        (current + 1) % photos.length
      );
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="photo-gallery-carousel">
      {photos.map((photo, index) => {
        const position =
          (index - activeIndex + photos.length) % photos.length;

        let positionClass = "gallery-hidden";

        if (position === 0) positionClass = "gallery-center";
        if (position === 1) positionClass = "gallery-right";
        if (position === photos.length - 1)
          positionClass = "gallery-left";

        return (
          <img
            key={photo}
            src={photo}
            alt={`Wedding gallery photograph ${index + 1}`}
            className={`gallery-photo ${positionClass}`}
          />
        );
      })}

      <button
        className="gallery-arrow gallery-prev"
        onClick={previousPhoto}
        aria-label="Previous photograph"
      >
        <ChevronLeft />
      </button>

      <button
        className="gallery-arrow gallery-next"
        onClick={nextPhoto}
        aria-label="Next photograph"
      >
        <ChevronRight />
      </button>

      <div className="gallery-dots">
        {photos.map((photo, index) => (
          <button
            key={photo}
            className={`gallery-dot ${
              activeIndex === index ? "active" : ""
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Show photograph ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default PhotoGallery;

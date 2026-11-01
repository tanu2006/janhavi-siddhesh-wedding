
import PhotoGallery from "./PhotoGallery";
import { useEffect, useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import "./App.css";

const englishPages = [
  "/pages/page1.png",
  "/pages/page2.png",
  "/pages/page3.png",
  "/pages/page4.png",
  "/pages/page5.png",
];

const marathiPages = [
  "/pages-marathi/page1.png",
  "/pages-marathi/page2.png",
  "/pages-marathi/page3.png",
  "/pages-marathi/page4.png",
  "/pages-marathi/page5.png",
];

const weddingDate = new Date(
  "2026-12-04T12:00:00+05:30"
).getTime();

function getTimeLeft() {
  const difference = Math.max(0, weddingDate - Date.now());

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    finished: difference === 0,
  };
}

function App() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [entered, setEntered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState("en");

  const audioRef = useRef(null);
  const soundContextRef = useRef(null);

// Soft wedding bell sound
function playButtonSound() {
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) return;

  if (!soundContextRef.current) {
    soundContextRef.current = new AudioContextClass();
  }

  const context = soundContextRef.current;

  if (context.state === "suspended") {
    context.resume();
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";

  oscillator.frequency.setValueAtTime(
    880,
    context.currentTime
  );

  oscillator.frequency.exponentialRampToValueAtTime(
    1320,
    context.currentTime + 0.18
  );

  gain.gain.setValueAtTime(0.0001, context.currentTime);

  gain.gain.exponentialRampToValueAtTime(
    0.12,
    context.currentTime + 0.025
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    context.currentTime + 0.65
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 0.7);
}
 

  const isMarathi = language === "mr";

  const pages = isMarathi ? marathiPages : englishPages;

  const coverImage = isMarathi
    ? "/opening/cover-marathi.png"
    : "/opening/cover.png";

  // Live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Start music and invitation after visitor clicks
  async function enterInvitation() {
    playButtonSound();
    setEntered(true);

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Music could not start:", error);
        setIsPlaying(false);
      }
    }
  }

  // Music play and pause control
  async function toggleMusic() {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Music could not start:", error);
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }

 // Automatic scrolling first, manual scrolling after completion
useEffect(() => {
  if (!entered) return;

  let animationFrame;
  let cancelled = false;

  async function startScrolling() {
    const invitation = document.querySelector(".invitation");

    if (!invitation) return;

    // Wait for all invitation images to load
    const images = Array.from(
      invitation.querySelectorAll("img")
    );

    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();

        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );

    if (cancelled) return;

    // Start from the top
    window.scrollTo(0, 0);

    const firstPage = invitation.querySelector(".invitation-page");
    const pageHeight = firstPage?.offsetHeight || 1440;

    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;

    if (maxScroll <= 0) return;

    // Original speed: 18 seconds per page
    const duration = (maxScroll / pageHeight) * 18000;

    const startTime = performance.now();

    function animate(now) {
      if (cancelled) return;

      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const currentPosition = maxScroll * progress;

      // Keep automatic scrolling in control
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Automatic scrolling is now complete.
        // Native manual scrolling is available.
        window.scrollTo(0, maxScroll);
      }
    }

    animationFrame = requestAnimationFrame(animate);
  }

  startScrolling();

  return () => {
    cancelled = true;
    cancelAnimationFrame(animationFrame);
  };
}, [entered]);

  return (
    <>
      <audio
        ref={audioRef}
        src="/music/wedding-song.mp3"
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {!entered && (
        <div className="welcome-screen">

          {/* Opening cover */}
          <img
            src={coverImage}
            alt="Janhavi and Siddhesh wedding invitation cover"
            className="welcome-cover"
          />

          {/* Language selector */}
          <div className="language-switcher">
            <button
              className={`language-option ${
                language === "en" ? "active-language" : ""
              }`}
              onClick={() => {
  playButtonSound();
  setLanguage("en");
}}
            >
              ENGLISH
            </button>

            <span className="language-divider">|</span>

            <button
              className={`language-option ${
                language === "mr" ? "active-language" : ""
              }`}
              onClick={() => {
  playButtonSound();
  setLanguage("mr");
}}
            >
              मराठी
            </button>
          </div>

          {/* Enter invitation */}
          <button
            className="enter-invitation-button"
            onClick={enterInvitation}
          >
            {isMarathi ? "आमंत्रण पहा" : "ENTER INVITATION"}
          </button>

        </div>
      )}

      {entered && (
        <>
          <main className="invitation">
            {pages.map((page, index) => (
              <section
                className={`invitation-page ${
                  index === 2 ? "page-three" : ""
                }`}
                id={`page-${index}`}
                key={page}
              >
                {index === 3 ? (
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=The+Sissom+Riverside%2C+Dhavte%2C+Khopoli-Pen+Road%2C+Maharashtra+402107"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-image-link"
                    aria-label="Open wedding venue location in Google Maps"
                  >
                    <img
                      src={page}
                      alt={`Invitation page ${index + 1}`}
                    />
                  </a>
                ) : (
                  <img
                    src={page}
                    alt={`Invitation page ${index + 1}`}
                  />
                )}

                {index === 2 && <PhotoGallery />}

                {index === 3 && (
                  <a
                    className="directions-link"
                    href="https://www.google.com/maps/search/?api=1&query=The+Sissom+Riverside%2C+Dhavte%2C+Khopoli-Pen+Road%2C+Maharashtra+402107"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Get directions to The Sissom Riverside"
                  />
                )}

                {/* Countdown */}
                {index === 2 && (
                  <div className="countdown-overlay">
                    {timeLeft.finished ? (
                      <div className="wedding-started">
                        {isMarathi
                          ? "लग्नसोहळा सुरू झाला आहे!"
                          : "THE WEDDING HAS BEGUN!"}
                      </div>
                    ) : (
                      <>
                        <div className="countdown-heading">
                          {isMarathi ? "उलटगणती" : "COUNTDOWN"}
                        </div>

                        <div className="countdown-values">
                          <div className="countdown-unit">
                            <strong>{timeLeft.days}</strong>
                            <span>{isMarathi ? "दिवस" : "Days"}</span>
                          </div>

                          <div className="countdown-unit">
                            <strong>
                              {String(timeLeft.hours).padStart(2, "0")}
                            </strong>
                            <span>{isMarathi ? "तास" : "Hours"}</span>
                          </div>

                          <div className="countdown-unit">
                            <strong>
                              {String(timeLeft.minutes).padStart(2, "0")}
                            </strong>
                            <span>{isMarathi ? "मिनिटे" : "Minutes"}</span>
                          </div>

                          <div className="countdown-unit">
                            <strong>
                              {String(timeLeft.seconds).padStart(2, "0")}
                            </strong>
                            <span>{isMarathi ? "सेकंद" : "Seconds"}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </section>
            ))}
          </main>

          {/* Music control */}
          <button
            className="music-control"
            onClick={toggleMusic}
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? <Volume2 /> : <VolumeX />}
          </button>
        </>
      )}

      <style>{`
        .welcome-screen {
          position: fixed;
          inset: 0;
          z-index: 2000;
          background: #061638;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #e8bd65;
          padding: 20px;
        }

        .welcome-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .welcome-content p {
          letter-spacing: 4px;
          font-size: 12px;
        }

        .welcome-content h1 {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: clamp(38px, 7vw, 68px);
          font-weight: 400;
          margin: 0;
        }

        .welcome-content span {
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 22px;
        }

        .welcome-content button {
          margin-top: 25px;
          padding: 14px 32px;
          border: 1px solid #e8bd65;
          background: transparent;
          color: #e8bd65;
          letter-spacing: 2px;
          cursor: pointer;
        }

        .language-switcher {
          position: absolute;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 17px;
          border: 1px solid #e8bd65;
          border-radius: 30px;
          background: rgba(6, 22, 56, 0.85);
          white-space: nowrap;
        }

        .language-option {
          border: none;
          background: transparent;
          color: #e8bd65;
          opacity: 0.65;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 25px;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 3px;
        }

        .language-option.active-language {
          opacity: 1;
          font-weight: bold;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .language-divider {
          color: #e8bd65;
          opacity: 0.7;
        }

        .music-control {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 1000;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid #e8bd65;
          background: #061638;
          color: #e8bd65;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .music-control svg {
          width: 21px;
          height: 21px;
        }
      `}</style>
    </>
  );
}

export default App;

import React from 'react';

interface PolaroidItem {
  id: number;
  src: string;
  alt: string;
  style: React.CSSProperties;
  caption: string;
}

interface TravelBannerProps {
  bannerText?: string;
  polaroids?: PolaroidItem[];
  mainText?: string;
}

const TravelBanner: React.FC<TravelBannerProps> = ({ 
  bannerText = 'Your Travel Story', 
  polaroids = [
    {
      id: 1,
      src: '/images/polaroid1.jpeg',
      alt: 'Polaroid 1',
      style: { top: '5%', left: '10%', transform: 'rotate(-10deg)' },
      caption: 'Hawaii Trip',
    },
    {
      id: 2,
      src: '/images/polaroid2.jpeg',
      alt: 'Polaroid 2',
      style: { top: '0%', left: '40%', transform: 'rotate(5deg)' },
      caption: 'Paris 2023',
    },
    {
      id: 3,
      src: '/images/polaroid3.jpeg',
      alt: 'Polaroid 3',
      style: { top: '10%', left: '70%', transform: 'rotate(-3deg)' },
      caption: 'Snowy Alps',
    },
    {
      id: 4,
      src: '/images/polaroid4.webp',
      alt: 'Polaroid 4',
      style: { top: '30%', left: '15%', transform: 'rotate(7deg)' },
      caption: 'Desert Safari',
    },
    {
      id: 5,
      src: '/images/polaroid5.jpg',
      alt: 'Polaroid 5',
      style: { top: '25%', left: '60%', transform: 'rotate(-8deg)' },
      caption: 'Cityscapes',
    },
  ],
  mainText = 'Your 100-word story displayed here'
}) => {
  return (
    <section
      className="travel-banner"
      style={{ 
        backgroundColor: '#f0f0f0',
        padding: '2rem',
        borderRadius: '1rem',
        fontFamily: "'Indie Flower', 'Caveat', cursive",
      }}
    >
      <div 
        className="polaroid-wrapper"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          position: 'relative',
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {polaroids.map((p) => (
          <div
            key={p.id}
            className="polaroid"
            style={{
              ...p.style
            }}
          >
            {/* The “frame” + image */}
            <div className="polaroid-frame">
              <img
                src={p.src}
                alt={p.alt}
              />
            </div>
            {/* Optional caption area */}
            <div
              className="polaroid-caption"
            >
              {p.caption}
            </div>
          </div>
        ))}
      </div>

      <div 
        className="text-content"
        style={{ 
          textAlign: 'center', 
          marginTop: '0rem',
        }}
      >
        <h1
          className="main-title"
          style={{ 
            fontSize: '2.5rem', 
            color: '#4a4a4a', 
            marginBottom: '1rem',
            fontFamily: "'Indie Flower', cursive",
          }}
        >{bannerText}</h1>
        <p 
          className="subtitle"
          style={{ 
            fontSize: '1.3rem', 
            lineHeight: 1.7, 
            color: '#333',
            whiteSpace: 'pre-wrap',
            marginBottom: '1.5rem',
            fontFamily: "'Indie Flower', 'Caveat', cursive",
            letterSpacing: '0.5px',
            fontWeight: 400,
          }}
        >{mainText}</p>
      </div>

      <style jsx>{`
        .travel-banner {
          position: relative; /* So child absolute positions work */
          width: 100%;
          min-height: 100vh;
          background-color: #fdfdfd;
          overflow: hidden;
          padding: 2rem;
        }

        .polaroid-wrapper {
          position: relative;
          width: 100%;
          height: 400px; /* Provide space for polaroids */
          margin-bottom: 4rem;
        }

        /* 
          Each polaroid is absolutely positioned within .polaroid-wrapper.
          The rotate, top, and left props come from inline style.
        */
        .polaroid {
          position: absolute;
          transition: transform 0.3s ease;
          cursor: pointer;
          /* No width here, we define it in the frame or below. */
        }
        .polaroid:hover {
          transform: scale(1.05) rotate(0deg) !important;
        }

        /* 
          The “frame” is the white rectangle that simulates a Polaroid border.
          You can tweak padding, box-shadow, etc. for the effect you want.
        */
        .polaroid-frame {
          background-color: #ffffff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          width: 150px;             /* Adjust to fit your image size */
          padding: 10px 10px 30px;  /* Extra space at the bottom for the “polaroid” look */
        }

        .polaroid-frame img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* 
          The caption can sit below the frame to mimic polaroid writing, 
          or be on the extra padded area itself. Here we put it over the white area.
        */
        .polaroid-caption {
          margin: 0;
          margin-top: -25px; /* Slide it upward if you want it on the white bottom space */
          text-align: center;
          font-size: 0.9rem;
          font-style: italic;
          color: #444;
        }

        .text-content {
          text-align: center;
        }

        .main-title {
          font-size: 3rem;
          margin: 0 0 0.5rem;
          color: #5f4b32;
        }

        .subtitle {
          margin: 0 0 2rem;
          font-size: 1.2rem;
          color: #8c7755;
        }

        .cta-button {
          background-color: transparent;
          border: 2px solid #5f4b32;
          border-radius: 25px;
          color: #5f4b32;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .cta-button:hover {
          background-color: #5f4b32;
          color: #fff;
        }

        @media (max-width: 768px) {
          .polaroid {
            margin: -1.5rem;
          }
          .polaroid-wrapper {
            height: 300px;
          }
          .polaroid-frame {
            width: 120px;
            padding: 8px 8px 24px; /* slightly smaller polaroid on mobile */
          }
          .polaroid-caption {
            font-size: 0.8rem;
            margin-top: -20px;
          }
          .main-title {
            font-size: 2.4rem;
          }
        }
      `}</style>
    </section>
  );
};

export default TravelBanner;

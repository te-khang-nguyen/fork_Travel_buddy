// pages/swagger.js

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'swagger-ui-react/swagger-ui.css'; // Import Swagger UI CSS

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
  const [spec, setSpec] = useState({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSwaggerSpec() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/docs');
        if (!response.ok) throw new Error('Failed to load Swagger JSON');
        const data = await response.json();
        setSpec(data);
      } catch (error) {
        console.error(error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSwaggerSpec();
  }, []);

  return (
    <div className="swagger-container">
      <Head>
        <title>Travel Buddy API Documentation</title>
        <meta name="description" content="API Documentation for Travel Buddy" />
      </Head>
      
      {isLoading && (
        <div className="loading-spinner">
          <p>Loading API documentation...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <h2>Error Loading Documentation</h2>
          <p>{error}</p>
        </div>
      )}

      {spec && (
        <div className="swagger-ui-wrapper">
          <SwaggerUI 
            spec={spec} 
            supportedSubmitMethods={['get', 'post', 'put', 'delete']}
          />
        </div>
      )}

      <style jsx global>{`
        .swagger-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }

        .swagger-ui-wrapper {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        .loading-spinner, .error-message {
          text-align: center;
          padding: 40px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          color: #d9534f;
        }

        @media (max-width: 768px) {
          .swagger-container {
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}

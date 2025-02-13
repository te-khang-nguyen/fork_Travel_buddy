import * as path from 'path';

/**
 * @swagger
 * /api/storage/upload_image:
 *   post:
 *     tags:
 *       - storage
 *     summary: Upload an image to storage
 *     description: Upload an image to the specified storage bucket.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               imageBase64:
 *                 type: string
 *                 description: The base64 encoded image data
 *               bucket:
 *                 type: string
 *                 description: The storage bucket name
 *               title:
 *                 type: string
 *                 description: The title for the image
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 signedUrl:
 *                   type: string
 *                   description: The signed URL of the uploaded image
 *                 message:
 *                   type: string
 *                   example: "File uploaded successfully!"
 *       400:
 *         description: Bad request
 *       405:
 *         description: Method not allowed
 *       500:
 *         description: Internal server error
 */


const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Travel Buddy API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Travel Buddy application',
  },
  servers: [
    {
      url: 'https://fork-travel-buddy.vercel.app', // Add your production URL
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your bearer token in the format "Bearer <token>"'
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: [
    './pages/api/**/*.ts',
    path.join(process.cwd(), 'pages/api/**/*.js'),
    path.join(process.cwd(), 'pages/api/**/*.ts'), 
    path.join(__dirname, 'pages/api/**/*.js'), 
    path.join(__dirname, 'pages/api/**/*.ts'),
    path.join(process.cwd(), '**/*.js'),
    path.join(__dirname, '**/*.js'),
  ],
};

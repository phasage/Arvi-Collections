/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get server health status
 *     tags: [Health & Monitoring]
 *     responses:
 *       200:
 *         description: Server health status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: number
 *                   description: "Server uptime in seconds"
 *                   example: 3600.5
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [demo, connected]
 *                       example: "demo"
 *                     mode:
 *                       type: string
 *                       example: "Demo mode - MongoDB not available"
 *                 cache:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, not available]
 *                       example: "not available"
 *                     hitRate:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       example: 85.5
 *                 imageService:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [cloudinary, local storage]
 *                       example: "local storage"
 *                 performance:
 *                   type: object
 *                   properties:
 *                     averageResponseTime:
 *                       type: number
 *                       description: "Average response time in milliseconds"
 *                       example: 125.5
 *                     totalRequests:
 *                       type: integer
 *                       example: 1250
 *                     errorRate:
 *                       type: string
 *                       description: "Error rate as percentage"
 *                       example: "2.40"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
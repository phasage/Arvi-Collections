/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get system metrics
 *     tags: [Health & Monitoring]
 *     responses:
 *       200:
 *         description: System metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     system:
 *                       type: object
 *                       properties:
 *                         uptime:
 *                           type: number
 *                           description: "System uptime in seconds"
 *                           example: 7200.5
 *                         memory:
 *                           type: object
 *                           properties:
 *                             used:
 *                               type: number
 *                               description: "Memory used in MB"
 *                               example: 128.5
 *                             total:
 *                               type: number
 *                               description: "Total memory in MB"
 *                               example: 512.0
 *                             percentage:
 *                               type: number
 *                               description: "Memory usage percentage"
 *                               example: 25.1
 *                         cpu:
 *                           type: object
 *                           properties:
 *                             usage:
 *                               type: number
 *                               description: "CPU usage percentage"
 *                               example: 15.5
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1500
 *                         successful:
 *                           type: integer
 *                           example: 1425
 *                         errors:
 *                           type: integer
 *                           example: 75
 *                         averageResponseTime:
 *                           type: number
 *                           description: "Average response time in milliseconds"
 *                           example: 145.2
 *                     cache:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: integer
 *                           example: 850
 *                         misses:
 *                           type: integer
 *                           example: 150
 *                         hitRate:
 *                           type: number
 *                           description: "Cache hit rate percentage"
 *                           example: 85.0
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /performance:
 *   get:
 *     summary: Get performance report
 *     tags: [Health & Monitoring]
 *     responses:
 *       200:
 *         description: Performance report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *                     period:
 *                       type: string
 *                       example: "last 24 hours"
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 2500
 *                         successful:
 *                           type: integer
 *                           example: 2375
 *                         failed:
 *                           type: integer
 *                           example: 125
 *                         averageResponseTime:
 *                           type: number
 *                           description: "Average response time in milliseconds"
 *                           example: 135.8
 *                         slowestEndpoint:
 *                           type: object
 *                           properties:
 *                             path:
 *                               type: string
 *                               example: "/api/products"
 *                             averageTime:
 *                               type: number
 *                               example: 245.5
 *                         fastestEndpoint:
 *                           type: object
 *                           properties:
 *                             path:
 *                               type: string
 *                               example: "/api/health"
 *                             averageTime:
 *                               type: number
 *                               example: 15.2
 *                     errors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 125
 *                         byStatusCode:
 *                           type: object
 *                           properties:
 *                             "400":
 *                               type: integer
 *                               example: 45
 *                             "401":
 *                               type: integer
 *                               example: 30
 *                             "404":
 *                               type: integer
 *                               example: 25
 *                             "500":
 *                               type: integer
 *                               example: 25
 *                         mostCommonError:
 *                           type: object
 *                           properties:
 *                             statusCode:
 *                               type: integer
 *                               example: 400
 *                             count:
 *                               type: integer
 *                               example: 45
 *                             message:
 *                               type: string
 *                               example: "Validation error"
 *                     system:
 *                       type: object
 *                       properties:
 *                         averageMemoryUsage:
 *                           type: number
 *                           description: "Average memory usage in MB"
 *                           example: 145.8
 *                         peakMemoryUsage:
 *                           type: number
 *                           description: "Peak memory usage in MB"
 *                           example: 198.5
 *                         averageCpuUsage:
 *                           type: number
 *                           description: "Average CPU usage percentage"
 *                           example: 18.5
 *                         peakCpuUsage:
 *                           type: number
 *                           description: "Peak CPU usage percentage"
 *                           example: 45.2
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /cache/stats:
 *   get:
 *     summary: Get cache statistics
 *     tags: [Health & Monitoring]
 *     responses:
 *       200:
 *         description: Cache statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [connected, disconnected, not available]
 *                       example: "connected"
 *                     connection:
 *                       type: object
 *                       properties:
 *                         host:
 *                           type: string
 *                           example: "localhost"
 *                         port:
 *                           type: integer
 *                           example: 6379
 *                         database:
 *                           type: integer
 *                           example: 0
 *                     performance:
 *                       type: object
 *                       properties:
 *                         hits:
 *                           type: integer
 *                           description: "Total cache hits"
 *                           example: 1250
 *                         misses:
 *                           type: integer
 *                           description: "Total cache misses"
 *                           example: 185
 *                         hitRate:
 *                           type: number
 *                           description: "Cache hit rate percentage"
 *                           example: 87.1
 *                         totalRequests:
 *                           type: integer
 *                           description: "Total cache requests"
 *                           example: 1435
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: string
 *                           description: "Memory used by cache"
 *                           example: "2.5MB"
 *                         peak:
 *                           type: string
 *                           description: "Peak memory usage"
 *                           example: "3.2MB"
 *                         fragmentation:
 *                           type: number
 *                           description: "Memory fragmentation ratio"
 *                           example: 1.15
 *                     keys:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: "Total number of keys"
 *                           example: 125
 *                         expired:
 *                           type: integer
 *                           description: "Number of expired keys"
 *                           example: 15
 *                         evicted:
 *                           type: integer
 *                           description: "Number of evicted keys"
 *                           example: 5
 *                     uptime:
 *                       type: number
 *                       description: "Cache server uptime in seconds"
 *                       example: 86400
 *       503:
 *         description: Cache service unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cache service not available"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "not available"
 *                     fallback:
 *                       type: string
 *                       example: "Using in-memory cache"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 * /images/status:
 *   get:
 *     summary: Get image service status
 *     tags: [Health & Monitoring]
 *     responses:
 *       200:
 *         description: Image service status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider:
 *                       type: string
 *                       enum: [cloudinary, local]
 *                       example: "local"
 *                     status:
 *                       type: string
 *                       enum: [active, configured, not configured, error]
 *                       example: "active"
 *                     configuration:
 *                       type: object
 *                       properties:
 *                         cloudinary:
 *                           type: object
 *                           properties:
 *                             configured:
 *                               type: boolean
 *                               example: false
 *                             cloudName:
 *                               type: string
 *                               example: null
 *                             apiKey:
 *                               type: boolean
 *                               description: "Whether API key is configured"
 *                               example: false
 *                             apiSecret:
 *                               type: boolean
 *                               description: "Whether API secret is configured"
 *                               example: false
 *                         local:
 *                           type: object
 *                           properties:
 *                             uploadsPath:
 *                               type: string
 *                               example: "./uploads"
 *                             maxFileSize:
 *                               type: string
 *                               example: "10MB"
 *                             allowedFormats:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["jpg", "jpeg", "png", "gif", "webp"]
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalUploads:
 *                           type: integer
 *                           description: "Total number of images uploaded"
 *                           example: 125
 *                         totalSize:
 *                           type: string
 *                           description: "Total size of uploaded images"
 *                           example: "45.2MB"
 *                         averageSize:
 *                           type: string
 *                           description: "Average image size"
 *                           example: "361KB"
 *                         optimizationRate:
 *                           type: number
 *                           description: "Image optimization rate percentage"
 *                           example: 65.5
 *                     health:
 *                       type: object
 *                       properties:
 *                         diskSpace:
 *                           type: object
 *                           properties:
 *                             available:
 *                               type: string
 *                               example: "2.5GB"
 *                             used:
 *                               type: string
 *                               example: "45.2MB"
 *                             percentage:
 *                               type: number
 *                               example: 1.8
 *                         lastUpload:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T09:45:00.000Z"
 *                         errors:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               example: 5
 *                             recent:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   timestamp:
 *                                     type: string
 *                                     format: date-time
 *                                   error:
 *                                     type: string
 *                                   file:
 *                                     type: string
 *                               example: []
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
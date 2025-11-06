import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { DataService } from './services/dataService';
import { MockDataService } from './mocks';
import { authMiddleware, AuthenticatedRequest } from './middleware/auth';

// move to env vars later
const PORT = process.env.PORT || 3001;

const app: express.Application = express();

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
});

// Apply authentication middleware
// app.use(authMiddleware.validateClientAuth);

// Health endpoint (infrastructure - no /api prefix for Docker/K8s compatibility)
app.get('/health', DataService.health);

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/refresh', (req: express.Request, res: express.Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            error: 'Missing refresh token',
            message: 'Refresh token is required'
        });
    }

    const result = authMiddleware.refreshAccessToken(refreshToken);

    if (result.success) {
        res.json({
            accessToken: result.accessToken,
            tokenType: 'Bearer',
            expiresIn: 900 // 15 minutes
        });
    } else {
        res.status(401).json({
            error: 'Invalid refresh token',
            message: result.error
        });
    }
});

app.post('/api/auth/generate-tokens', (req: express.Request, res: express.Response) => {
    const { userId, email, name, roles } = req.body;

    if (!userId || !email) {
        return res.status(400).json({
            error: 'Missing required fields',
            message: 'userId and email are required'
        });
    }

    try {
        // Check if JWT_SECRET is available
        const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

        const accessTokenPayload = {
            sub: userId,
            email,
            name,
            roles: roles || ['user'],
            iat: Math.floor(Date.now() / 1000),
            iss: 'gis-bff',
            aud: 'gis-client'
        };

        const accessToken = jwt.sign(accessTokenPayload, jwtSecret, {
            expiresIn: '15m',
            algorithm: 'HS256'
        } as any);

        const refreshToken = authMiddleware.generateRefreshToken(userId, email);

        res.json({
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 900, // 15 minutes
            user: {
                id: userId,
                email,
                name,
                roles
            }
        });

    } catch (error) {
        console.error('Token generation failed:', error);
        res.status(500).json({
            error: 'Token generation failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// ==========================================
// BUSINESS LOGIC ENDPOINTS
// ==========================================

// Parcels endpoints
app.get('/api/parcels', DataService.parcels);
app.get('/api/parcels/:id', DataService.parcelById);

// Features endpoint (legacy)
app.get('/api/features/:id', DataService.featureById);

// Municipalities endpoints
app.get('/api/municipalities', DataService.municipalities);
app.get('/api/municipalities/:number', DataService.municipalityByNumber);

// Vector tiles endpoints
app.get('/api/vector-tiles/capabilities', DataService.vectorTileCapabilities);
app.get('/api/vector-tiles/:z/:x/:y', DataService.vectorTile);

// GeoJSON endpoint for development/debugging
app.get('/api/parcels/geojson', DataService.parcelsGeoJSON);

// WMS endpoints
app.get('/api/wms/capabilities', DataService.wmsCapabilities);
app.get('/api/wms', DataService.wms);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

app.listen(PORT, () => {
    const mockMode = MockDataService.isEnabled();
    console.log(`🚀 BFF API server running on http://localhost:${PORT}`);
    console.log(`📊 Mock mode: ${mockMode ? '🎭 ENABLED' : '🌐 DISABLED'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🗺️  Vector tiles: http://localhost:${PORT}/api/vector-tiles/capabilities`);
    console.log(`🖼️  Image tiles: http://localhost:${PORT}/api/wms/capabilities`);

    if (mockMode) {
        console.log('');
        console.log('🎭 MOCK MODE ACTIVE - Using local mock data');
        console.log('   To switch to real data, set USE_MOCK_DATA=false');
    } else {
        console.log('');
        console.log('🌐 LIVE MODE ACTIVE - Using real backend services');
        console.log('   To switch to mock data, set USE_MOCK_DATA=true');
    }
});

export default app;
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name?: string;
        roles?: string[];
    };
    authToken?: string;
    authMode?: 'jwt' | 'basic' | 'none';
}

export interface AuthConfig {
    apiKey?: string;
    jwtSecret?: string;
    jwtRefreshSecret?: string;
    backendApiKey?: string;
    skipRoutes?: string[];
    enableJwtValidation?: boolean;
    externalServices?: {
        [serviceName: string]: {
            type: 'bearer' | 'apikey' | 'oauth2' | 'basic';
            token?: string;
            apiKey?: string;
            clientId?: string;
            clientSecret?: string;
            username?: string;
            password?: string;
            refreshToken?: string;
            tokenEndpoint?: string;
        };
    };
}

interface JwtPayload {
    sub: string;
    email: string;
    name?: string;
    roles?: string[];
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}

interface RefreshTokenPayload {
    sub: string;
    email: string;
    type: 'refresh';
    iat?: number;
    exp?: number;
}

class AuthMiddleware {
    private config: AuthConfig;

    constructor(config: AuthConfig) {
        this.config = config;
    }

    validateClientAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (this.shouldSkipAuth(req.path)) {
            req.authMode = 'none';
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Authorization header is missing'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        req.authToken = token;

        if (this.config.enableJwtValidation && this.config.jwtSecret) {
            const jwtResult = this.validateJWT(token, req);
            if (jwtResult.success) {
                req.authMode = 'jwt';
                return next();
            } else if (jwtResult.shouldReject) {
                return res.status(401).json({
                    error: 'Invalid JWT token',
                    message: jwtResult.error
                });
            }
        }

        try {
            req.authMode = 'basic';
            console.log(`Basic auth mode for ${req.method} ${req.path}`);
            next();
        } catch (error) {
            console.error('Auth validation error:', error);
            return res.status(401).json({
                error: 'Invalid authentication',
                message: 'Token validation failed'
            });
        }
    };

    private validateJWT(token: string, req: AuthenticatedRequest): { success: boolean; shouldReject: boolean; error?: string } {
        try {
            const decoded = jwt.verify(token, this.config.jwtSecret!) as JwtPayload;

            req.user = {
                id: decoded.sub,
                email: decoded.email,
                name: decoded.name,
                roles: decoded.roles || []
            };

            console.log(`JWT auth successful for user: ${decoded.email} (${decoded.sub})`);
            return { success: true, shouldReject: false };

        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                console.error('JWT validation failed:', error.message);

                if (this.looksLikeJWT(token)) {
                    return { success: false, shouldReject: true, error: error.message };
                } else {
                    return { success: false, shouldReject: false };
                }
            }

            console.error('Unexpected JWT error:', error);
            return { success: false, shouldReject: true, error: 'Token validation failed' };
        }
    }

    private looksLikeJWT(token: string): boolean {
        return token.split('.').length === 3;
    }

    addBackendAuthHeaders = (existingHeaders: Record<string, string> = {}): Record<string, string> => {
        const headers = { ...existingHeaders };

        if (this.config.backendApiKey) {
            headers['X-API-Key'] = this.config.backendApiKey;
        }

        headers['User-Agent'] = 'GIS-BFF/1.0';
        headers['X-Service-Name'] = 'gis-bff';

        return headers;
    };

    getUserContextHeaders = (req: AuthenticatedRequest): Record<string, string> => {
        const headers: Record<string, string> = {};

        if (req.authMode) {
            headers['X-Auth-Mode'] = req.authMode;
        }

        if (req.authToken) {
            headers['X-User-Token'] = req.authToken;
        }

        if (req.user) {
            headers['X-User-ID'] = req.user.id;
            headers['X-User-Email'] = req.user.email;

            if (req.user.name) {
                headers['X-User-Name'] = req.user.name;
            }

            if (req.user.roles && req.user.roles.length > 0) {
                headers['X-User-Roles'] = req.user.roles.join(',');
            }
        }

        return headers;
    };

    private shouldSkipAuth(path: string): boolean {
        const skipRoutes = this.config.skipRoutes || [
            '/health',
            '/api/wms/capabilities',
            '/api/vector-tiles/capabilities'
        ];

        return skipRoutes.some(route => path.startsWith(route));
    }

    generateRefreshToken = (userId: string, email: string): string => {
        const refreshSecret = this.config.jwtRefreshSecret || this.config.jwtSecret!;

        const payload: RefreshTokenPayload = {
            sub: userId,
            email,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(payload, refreshSecret, {
            expiresIn: '7d', // Refresh tokens last longer
            algorithm: 'HS256'
        } as any);
    };

    refreshAccessToken = (refreshToken: string): { success: boolean; accessToken?: string; error?: string } => {
        try {
            const refreshSecret = this.config.jwtRefreshSecret || this.config.jwtSecret!;
            const decoded = jwt.verify(refreshToken, refreshSecret) as RefreshTokenPayload;

            if (decoded.type !== 'refresh') {
                return { success: false, error: 'Invalid refresh token type' };
            }

            const accessTokenPayload = {
                sub: decoded.sub,
                email: decoded.email,
                iat: Math.floor(Date.now() / 1000),
                iss: 'gis-bff',
                aud: 'gis-client'
            };

            const accessToken = jwt.sign(accessTokenPayload, this.config.jwtSecret!, {
                expiresIn: '15m',
                algorithm: 'HS256'
            } as any);

            return { success: true, accessToken };

        } catch (error) {
            console.error('Refresh token validation failed:', error);
            return { success: false, error: 'Invalid or expired refresh token' };
        }
    };

    getOutgoingAuthHeaders = async (serviceName: string, existingHeaders: Record<string, string> = {}): Promise<Record<string, string>> => {
        const headers = { ...existingHeaders };
        const serviceConfig = this.config.externalServices?.[serviceName];

        if (!serviceConfig) {
            console.warn(`No auth config found for service: ${serviceName}`);
            return headers;
        }

        switch (serviceConfig.type) {
            case 'bearer':
                if (serviceConfig.token) {
                    headers['Authorization'] = `Bearer ${serviceConfig.token}`;
                }
                break;

            case 'apikey':
                if (serviceConfig.apiKey) {
                    headers['X-API-Key'] = serviceConfig.apiKey;
                    // Some services use different header names
                    headers['Authorization'] = `ApiKey ${serviceConfig.apiKey}`;
                }
                break;

            case 'basic':
                if (serviceConfig.username && serviceConfig.password) {
                    const credentials = Buffer.from(`${serviceConfig.username}:${serviceConfig.password}`).toString('base64');
                    headers['Authorization'] = `Basic ${credentials}`;
                }
                break;

            case 'oauth2':
                // Handle OAuth2 token refresh if needed
                const token = await this.getOAuth2Token(serviceConfig);
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                break;
        }

        return headers;
    };

    private async getOAuth2Token(serviceConfig: any): Promise<string | null> {
        // Simplified OAuth2 client credentials flow
        if (!serviceConfig.clientId || !serviceConfig.clientSecret || !serviceConfig.tokenEndpoint) {
            console.error('OAuth2 config incomplete');
            return null;
        }

        try {
            const axios = (await import('axios')).default;

            const response = await axios.post(serviceConfig.tokenEndpoint,
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: serviceConfig.clientId,
                    client_secret: serviceConfig.clientSecret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data.access_token;
        } catch (error) {
            console.error('OAuth2 token refresh failed:', error);
            return null;
        }
    }
}

const authConfig: AuthConfig = {
    apiKey: process.env.API_KEY,
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-refresh-secret',
    backendApiKey: process.env.BACKEND_API_KEY || 'backend-service-key',
    enableJwtValidation: process.env.ENABLE_JWT_VALIDATION == 'true',
    skipRoutes: [
        '/health',
        '/api/auth/refresh',
        '/api/auth/generate-tokens',
        '/api/wms/capabilities',
        '/api/vector-tiles/capabilities'
    ],
    externalServices: {
        'gis-api': {
            type: 'apikey',
            apiKey: process.env.GIS_API_KEY
        },
        'wms-service': {
            type: 'basic',
            username: process.env.WMS_USERNAME,
            password: process.env.WMS_PASSWORD
        },
        'oauth-service': {
            type: 'oauth2',
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            tokenEndpoint: process.env.OAUTH_TOKEN_ENDPOINT
        }
    }
};

export const authMiddleware = new AuthMiddleware(authConfig);
export { AuthenticatedRequest };
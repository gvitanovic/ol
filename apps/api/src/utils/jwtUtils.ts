import jwt from 'jsonwebtoken';

export class JwtUtils {

    //  Generate a JWT token for testing purposes
    static generateTestToken(payload: {
        userId: string;
        email: string;
        name?: string;
        roles?: string[];
    }, secret: string = 'your-jwt-secret-change-in-production', expiresIn: string | number = '24h'): string {

        const jwtPayload = {
            sub: payload.userId,
            email: payload.email,
            name: payload.name,
            roles: payload.roles || [],
            iat: Math.floor(Date.now() / 1000),
            iss: 'gis-bff',
            aud: 'gis-client'
        };

        return jwt.sign(jwtPayload, secret, { expiresIn: '24h' } as any);
    }

    static decodeToken(token: string): any {
        return jwt.decode(token);
    }

    static verifyToken(token: string, secret: string): any {
        try {
            return jwt.verify(token, secret);
        } catch (error) {
            throw new Error(`JWT verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static generateExampleTokens(secret?: string) {
        const jwtSecret = secret || process.env.JWT_SECRET || 'your-jwt-secret-change-in-production';

        return {
            adminUser: this.generateTestToken({
                userId: 'admin-123',
                email: 'admin@example.com',
                name: 'Admin User',
                roles: ['admin', 'user']
            }, jwtSecret),

            regularUser: this.generateTestToken({
                userId: 'user-456',
                email: 'user@example.com',
                name: 'Regular User',
                roles: ['user']
            }, jwtSecret),

            viewerUser: this.generateTestToken({
                userId: 'viewer-789',
                email: 'viewer@example.com',
                name: 'Viewer User',
                roles: ['viewer']
            }, jwtSecret)
        };
    }
}
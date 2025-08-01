import 'dotenv/config';

const config = {
    app: {
        port: process.env.PORT || 5001,
        env: process.env.NODE_ENV || 'development'
    },
    db: {
        uri: process.env.MONGODB_URI,
        name: process.env.DB_NAME || 'insuppent'
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '30d'
    }
};

// Validate required environment variables
const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
}

export default config;
// app/modules/auth/auth.controller.js
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import config from '../../../config/index.js';
import { verifyToken, refreshUserData } from './auth.service.js';
import { UserService } from '../user/user.service.js';
import { jwtHelpers } from '../../../helpers/jwtHelpers.js';
import { sessionStore } from '../../../utils/sessionStore.js';

const checkAuth = catchAsync(async (req, res) => {
    console.log('Checking authentication status... request cookies:', req.cookies);
    try {
        // First check for access token as it's our primary auth mechanism
        const accessToken = req.cookies.accessToken;
        const sessionId = req.cookies.sessionId;
        
        if (!accessToken && !sessionId) {
            console.log('No access token or session ID found');
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Not authenticated'
            });
        }

        let userData = null;

        // Try to verify JWT token first
        if (accessToken) {
            try {
                const decoded = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
                
                // Get fresh user data from database
                const user = await UserService.getUserById(decoded.id);
                
                if (user) {
                    userData = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        subscription: user.subscription,
                        status: user.status,
                        purchased: user.purchased,
                        refunded: user.refunded,
                        role: decoded.role
                    };
                }
            } catch (jwtError) {
                console.log('JWT verification failed, trying Redis session:', jwtError.message);
            }
        }

        // If JWT fails or doesn't exist, try Redis session
        if (!userData && sessionId) {
            console.log('🟠 [DEBUG] checkAuth: Attempting Redis session lookup');
            console.log('   Session ID:', sessionId);
            
            try {
                const sessionData = await sessionStore.getUserSession(sessionId);
                console.log('🟠 [DEBUG] Redis session lookup result:', !!sessionData);
                
                if (sessionData) {
                    console.log('🟠 [DEBUG] Session found - User ID:', sessionData.id, 'Email:', sessionData.email);
                    
                    // Get fresh user data from database
                    const user = await UserService.getUserById(sessionData.id);
                    if (user) {
                        userData = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            subscription: user.subscription,
                            status: user.status,
                            purchased: user.purchased,
                            refunded: user.refunded,
                            role: sessionData.role
                        };
                        console.log('✅ [DEBUG] checkAuth: Authentication successful via Redis session for user:', user.email);
                    } else {
                        console.log('❌ [DEBUG] checkAuth: User not found in database for session ID:', sessionData.id);
                    }
                } else {
                    console.log('❌ [DEBUG] checkAuth: No session found in Redis for ID:', sessionId);
                }
            } catch (sessionError) {
                console.error('❌ [DEBUG] checkAuth: Redis session error:', sessionError);
            }
        }

        if (!userData) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Invalid or expired authentication'
            });
        }

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User is authenticated',
            data: userData
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Authentication verification failed'
        });
    }
});

const verifyWordPressAuth = catchAsync(async (req, res) => {
    const { uid, token } = req.query;
    console.log("🚀 ~ token:", token)

    if (!uid || !token) {
        return sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            success: false,
            message: 'UID and token are required',
        });
    }

    // Verify with WordPress
    const verificationResult = await verifyToken(uid, token);

    if (!verificationResult.success) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: verificationResult.message,
        });
    }

    try {
        const wpUser = verificationResult.user;
        console.log('Verified WP User:', wpUser);

        const userCreateData = {
            userid: wpUser.userid,
            name: wpUser.name || wpUser.display_name,
            email: wpUser.email,
            subscription: wpUser.membership || 'Subscriber',
            status: 'Active',
            avatar: wpUser.avatar_url,
        };

        // Try to create user, if exists it will throw an error
        let dbUser = null;
        try {
            dbUser = await UserService.createUser(userCreateData);
            console.log('New user created:', dbUser);
        } catch (error) {
            if (error.statusCode === httpStatus.BAD_REQUEST && error.message === 'Email already exists') {
                // User exists, get their details
                const existingUser = await UserService.getUserByEmail(userCreateData.email);
                dbUser = existingUser;
                console.log('Existing user found:', dbUser);
            } else {
                throw error;
            }
        }

        // Create tokens and user data
        const userData = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            subscription: dbUser.subscription,
            status: dbUser.status,
            purchased: dbUser.purchased,
            refunded: dbUser.refunded,
            role: verificationResult.user.role,
            wpUserId: uid
        };
        
        console.log("🚀 ~ userData:", userData)

        // Create access token
        const accessToken = jwtHelpers.createToken(
            { ...userData },
            config.jwt.secret,
            config.jwt.expires_in
        );

        // Create refresh token
        const refreshToken = jwtHelpers.createToken(
            { id: dbUser.id },
            config.jwt.refresh_secret,
            config.jwt.refresh_expires_in
        );

        // Generate session ID and store session in Redis
        const sessionId = sessionStore.generateSessionId();
        const sessionData = {
            ...userData,
            accessToken,
            refreshToken,
            wpToken: token, // Store original WP token for refresh
            loginAt: new Date().toISOString()
        };

        console.log('🔵 [DEBUG] About to store session in Redis:');
        console.log('   Session ID:', sessionId);
        console.log('   User ID:', sessionData.id);
        console.log('   User Email:', sessionData.email);
        console.log('   User Name:', sessionData.name);
        console.log('   User Role:', sessionData.role);
        console.log('   Session Data Keys:', Object.keys(sessionData));
        console.log('   Full Session Data:', JSON.stringify(sessionData, null, 2));

        // Save session to Redis (24 hours TTL)
        try {
            await sessionStore.saveUserSession(sessionId, sessionData, 24 * 60 * 60);
            console.log('✅ [DEBUG] Session successfully stored in Redis');
            
            // Verify the session was stored by immediately retrieving it
            const verifySession = await sessionStore.getUserSession(sessionId);
            if (verifySession) {
                console.log('✅ [DEBUG] Session verification successful - data retrieved from Redis');
                console.log('   Retrieved User ID:', verifySession.id);
                console.log('   Retrieved User Email:', verifySession.email);
                console.log('   Retrieved Keys:', Object.keys(verifySession));
            } else {
                console.log('❌ [DEBUG] Session verification failed - no data retrieved from Redis');
            }
        } catch (sessionError) {
            console.error('❌ [DEBUG] Failed to store session in Redis:', sessionError);
            throw sessionError;
        }

        const cookieOptions = {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            domain: config.env === 'production' ? config.domain : undefined,
            path: '/'
        };

        // Set session ID cookie
        res.cookie('sessionId', sessionId, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Set cookies
        res.cookie('accessToken', accessToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.cookie('refreshToken', refreshToken, {
            ...cookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Set a non-httpOnly cookie for frontend auth status check
        res.cookie('authStatus', 'true', {
            ...cookieOptions,
            httpOnly: false,
            maxAge: 24 * 60 * 60 * 1000
        });

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'User logged in successfully',
            data: {
                ...userData,
                sessionId // Include session ID in response for debugging
            }
        });

    } catch (error) {
        console.error('Error creating/updating user:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Error creating user account',
        });
    }
});

const getCurrentUser = catchAsync(async (req, res) => {
    try {
        let userData = req.user; // From middleware if available

        console.log('🟢 [DEBUG] getCurrentUser: Initial user from middleware:', !!userData);
        console.log('   User Data:', userData ? JSON.stringify(userData, null, 2) : 'None');
        
        // If no user from middleware, try to get from cookies directly
        if (!userData) {
            const accessToken = req.cookies.accessToken;
            const sessionId = req.cookies.sessionId;
            
            if (!accessToken && !sessionId) {
                return sendResponse(res, {
                    statusCode: httpStatus.UNAUTHORIZED,
                    success: false,
                    message: 'Not authenticated',
                });
            }

            // Try JWT token first
            if (accessToken) {
                try {
                    const decoded = jwtHelpers.verifyToken(accessToken, config.jwt.secret);
                    
                    // Get fresh user data from database
                    const user = await UserService.getUserById(decoded.id);
                    
                    if (user) {
                        userData = {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            subscription: user.subscription,
                            status: user.status,
                            purchased: user.purchased,
                            refunded: user.refunded,
                            role: decoded.role
                        };
                    }
                } catch (jwtError) {
                    console.log('JWT verification failed in getCurrentUser, trying Redis session:', jwtError.message);
                }
            }

            // If JWT fails or doesn't exist, try Redis session
            if (!userData && sessionId) {
                console.log('🟡 [DEBUG] getCurrentUser: Attempting to retrieve session from Redis');
                console.log('   Session ID:', sessionId);
                
                try {
                    const sessionData = await sessionStore.getUserSession(sessionId);
                    console.log('🟡 [DEBUG] Redis session retrieval result:', !!sessionData);
                    
                    if (sessionData) {
                        console.log('🟡 [DEBUG] Session data found in Redis:');
                        console.log('   Session User ID:', sessionData.id);
                        console.log('   Session User Email:', sessionData.email);
                        console.log('   Session User Name:', sessionData.name);
                        console.log('   Session User Role:', sessionData.role);
                        console.log('   Session Login Time:', sessionData.loginAt);
                        console.log('   Session Last Accessed:', sessionData.lastAccessed);
                        console.log('   Session Keys:', Object.keys(sessionData));
                        
                        // Get fresh user data from database
                        const user = await UserService.getUserById(sessionData.id);
                        console.log('🟡 [DEBUG] Database user lookup result:', !!user);
                        
                        if (user) {
                            userData = {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                subscription: user.subscription,
                                status: user.status,
                                purchased: user.purchased,
                                refunded: user.refunded,
                                role: sessionData.role
                            };
                            console.log('✅ [DEBUG] getCurrentUser: Authentication successful via Redis session');
                            console.log('   Final User Data:', JSON.stringify(userData, null, 2));
                        } else {
                            console.log('❌ [DEBUG] User not found in database for session user ID:', sessionData.id);
                        }
                    } else {
                        console.log('❌ [DEBUG] No session data found in Redis for session ID:', sessionId);
                    }
                } catch (sessionError) {
                    console.error('❌ [DEBUG] Error retrieving session from Redis:', sessionError);
                }
            }
        }

        if (!userData) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Not authenticated',
            });
        }

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            data: {
                user: userData,
                isAuthenticated: true,
            },
        });
    } catch (error) {
        console.error('getCurrentUser error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Failed to get current user',
        });
    }
});

const logout = catchAsync(async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        console.log('🔴 [DEBUG] Logout process initiated');
        console.log('   Session ID to delete:', sessionId);
        
        // Delete session from Redis if it exists
        if (sessionId) {
            try {
                // Check if session exists before deletion
                const sessionExists = await sessionStore.sessionExists(sessionId);
                console.log('🔴 [DEBUG] Session exists before deletion:', sessionExists);
                
                const deleteResult = await sessionStore.deleteUserSession(sessionId);
                console.log('🔴 [DEBUG] Session deletion result:', deleteResult);
                console.log(`✅ [DEBUG] Session ${sessionId} deleted from Redis`);
                
                // Verify deletion
                const stillExists = await sessionStore.sessionExists(sessionId);
                console.log('🔴 [DEBUG] Session exists after deletion:', stillExists);
            } catch (deleteError) {
                console.error('❌ [DEBUG] Error deleting session:', deleteError);
            }
        } else {
            console.log('🔴 [DEBUG] No session ID found in cookies for deletion');
        }

        const cookieOptions = {
            httpOnly: true,
            secure: config.env === 'production',
            sameSite: config.env === 'production' ? 'none' : 'lax',
            domain: config.env === 'production' ? config.domain : undefined,
            path: '/'
        };

        // Clear all auth-related cookies with the same settings they were set with
        res.clearCookie('sessionId', cookieOptions);
        res.clearCookie('accessToken', cookieOptions);
        res.clearCookie('refreshToken', cookieOptions);
        res.clearCookie('authStatus', {
            ...cookieOptions,
            httpOnly: false
        });

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to logout'
        });
    }
});

const refreshAuth = catchAsync(async (req, res) => {
    if (!req.session.user) {
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Not authenticated',
        });
    }

    const { uid, token } = req.session.user;
    const verificationResult = await verifyToken(uid, token);

    if (!verificationResult.success) {
        // Clear invalid session
        req.session.destroy(() => { });
        return sendResponse(res, {
            statusCode: httpStatus.UNAUTHORIZED,
            success: false,
            message: 'Session expired or invalid',
        });
    }

    // Update session with fresh data
    req.session.user = {
        ...verificationResult.user,
        uid,
        token,
        authenticatedAt: new Date().toISOString(),
    };

    await new Promise((resolve, reject) => {
        req.session.save((err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        data: {
            user: verificationResult.user,
        },
    });
});

const getSessionInfo = catchAsync(async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        
        if (!sessionId) {
            return sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                success: false,
                message: 'No session ID found'
            });
        }

        const sessionData = await sessionStore.getUserSession(sessionId);
        
        if (!sessionData) {
            return sendResponse(res, {
                statusCode: httpStatus.NOT_FOUND,
                success: false,
                message: 'Session not found or expired'
            });
        }

        // Don't return sensitive data like tokens
        const { accessToken, refreshToken, wpToken, ...safeSessionData } = sessionData;

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'Session information retrieved',
            data: {
                sessionId,
                ...safeSessionData,
                hasTokens: !!(accessToken && refreshToken)
            }
        });
    } catch (error) {
        console.error('Get session info error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to retrieve session information'
        });
    }
});

const clearAllUserSessions = catchAsync(async (req, res) => {
    try {
        if (!req.user) {
            return sendResponse(res, {
                statusCode: httpStatus.UNAUTHORIZED,
                success: false,
                message: 'Not authenticated'
            });
        }

        const clearedCount = await sessionStore.clearUserSessions(req.user.id);

        return sendResponse(res, {
            statusCode: httpStatus.OK,
            success: true,
            message: 'All user sessions cleared',
            data: {
                clearedSessions: clearedCount
            }
        });
    } catch (error) {
        console.error('Clear all sessions error:', error);
        return sendResponse(res, {
            statusCode: httpStatus.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to clear sessions'
        });
    }
});

export {
    verifyWordPressAuth,
    getCurrentUser,
    logout,
    refreshAuth,
    checkAuth,
    getSessionInfo,
    clearAllUserSessions,
};
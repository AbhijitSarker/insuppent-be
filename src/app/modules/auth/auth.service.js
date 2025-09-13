import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const wpBaseUrl = process.env.WP_BASE_URL || 'https://staging2.insuppent.com';

const verifyToken = async (uid, token) => {
  const verifyEndpoint = `${wpBaseUrl}/wp-json/wprsb/v1/verify?uid=${uid}&token=${token}`;

  try {
    const response = await axios.get(verifyEndpoint, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': process.env.FRONTEND_URL || 'http://localhost:5173',
        'Referer': process.env.FRONTEND_URL || 'http://localhost:5173'
      }
    });
    console.log('WordPress verification response:', response.data);
    if (response.data && response.data.valid) {
      return {
        success: true,
        user: response.data.user
      };
    }

    return {
      success: false,
      message: 'Invalid token or user'
    };
  } catch (error) {
    console.error('WordPress verification error:', error.me);
    return {
      success: false,
      message: 'Failed to verify with WordPress'
    };
  }
};

const refreshUserData = async (uid, token) => {
  // This method can be used to refresh user data when needed
  return verifyToken(uid, token);
};

export {
  verifyToken,
  refreshUserData
};
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const wpBaseUrl = process.env.WP_BASE_URL || 'https://staging2.insuppent.com';
const verifyEndpoint = `${wpBaseUrl}/wp-json/wprsb/v1/verify?uid=16&token=3HUDfA1joV4VlB1XG2GBsMfwkpc7RCfdfgBloIpp5yH`;

const verifyToken = async (uid, token) => {
  console.log(verifyEndpoint)
  try {
    const response = await axios.get(verifyEndpoint);
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
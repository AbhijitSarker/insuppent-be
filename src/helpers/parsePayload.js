export const parsePayload = (payload) => {
    if (typeof payload === 'object' && Object.keys(payload).length === 1) {
        try {
            const key = Object.keys(payload)[0];
            return JSON.parse(key);
        } catch (error) {
            console.error('Failed to parse stringified JSON key:', error);
        }
    }
    return payload;
};
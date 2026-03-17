import axiosInstance from "../../../services/axiosInstance";

/**
 * Toggles the like status of a video
 * @param {string} videoId 
 * @returns {Promise}
 */
export const toggleVideoLike = async (videoId) => {
    try {
        const response = await axiosInstance.post(`likes/toggle/video/${videoId}`);
        return response.data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};

/**
 * Fetches all liked videos for the current user
 * @returns {Promise}
 */
export const getLikedVideos = async () => {
    try {
        const response = await axiosInstance.get("likes/getlikedvideos");
        return response.data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};

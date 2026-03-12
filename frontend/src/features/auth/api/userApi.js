import axiosInstance from "../../../services/axiosInstance";

/**
 * Fetches the watch history for the current user
 * @returns {Promise}
 */
export const getWatchHistory = async () => {
    try {
        const response = await axiosInstance.get("/users/watch-history");
        return response.data;
    } catch (error) {
        throw error?.response?.data || error;
    }
};

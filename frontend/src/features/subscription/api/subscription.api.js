import axiosInstance from "../../../services/axiosInstance";

export const toggleSubscription = async (channelId) => {
  try {
    const response = await axiosInstance.post(`subscriptions/channel/${channelId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling subscription:", error);
    throw error;
  }
};

export const getSubscribedChannels = async (subscriberId) => {
  try {
    const response = await axiosInstance.get(`subscriptions/user/${subscriberId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching subscribed channels:", error);
    throw error;
  }
};

export const getChannelSubscribers = async (channelId) => {
  try {
    const response = await axiosInstance.get(`subscriptions/channel/${channelId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching channel subscribers:", error);
    throw error;
  }
};

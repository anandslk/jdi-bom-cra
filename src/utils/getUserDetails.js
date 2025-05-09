import { loadPlatformAPI } from "./helpers";

export default async function getUserDetails() {
  try {
    const PlatformAPI = await loadPlatformAPI();
    const user = await PlatformAPI.getUser();
    // console.log(" User details retrieved successfully:", user);
    // console.log("User ID:", user?.id);
    // console.log("User name:", user?.name);
    // console.log("User email:", user?.email);
    // console.log("User roles:", user?.roles);
    // console.log("User preferences:", user?.preferences);

    return user;
  } catch (error) {
    console.error(" Error getting user details:", error);
    return null; // Or throw the error, depending on how you want to handle it
  }
}

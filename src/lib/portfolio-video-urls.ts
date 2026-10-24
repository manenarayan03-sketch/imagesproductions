import storedUrls from "./portfolio-video-urls.json";

const portfolioVideoUrls = storedUrls as Record<string, string> & { hero?: string };

export default portfolioVideoUrls;

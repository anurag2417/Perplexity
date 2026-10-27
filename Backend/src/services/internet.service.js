import { tavily as Tavily } from "@tavily/core";

export const searchInternet = async ({ query }) => {
    if (!process.env.TAVILY_API_KEY) {
        throw new Error("TAVILY_API_KEY is not configured");
    }

    const tavily = Tavily({
        apiKey: process.env.TAVILY_API_KEY,
    });
    const results = await tavily.search(query, {
        maxResults: 5,
    });

    return JSON.stringify(results);
};
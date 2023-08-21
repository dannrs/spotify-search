import { AccessToken } from "@spotify/web-api-ts-sdk";

// Load environment variables
const client_id = process.env.SPOTIFY_CLIENT_ID as string;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET as string;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN as string;

// Create a base64-encoded string using client_id and client_secret
const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

// Function to get a new access token using the refresh token
export const getAccessToken = async (): Promise<AccessToken> => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  });

  return response.json();
};

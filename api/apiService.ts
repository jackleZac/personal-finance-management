import Constants from 'expo-constants';

// This module provides a service to interact with APIs.
const API_CORE_URL = Constants.expoConfig?.extra?.apiCoreUrl;

// This function fetches data from the API and handles errors.
// It takes an endpoint, method, token, optional parameters, and optional body as arguments.
export const apiCoreRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  token: string,
  params: Record<string, any> = {},
  body?: Record<string, any>
): Promise<T> => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_CORE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  console.log(`Fetching from: ${url}`);

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // Add body to the request if provided and method is not GET
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch ${endpoint}: ${response.status} - ${errorText}`);
  }

  return response.json();
};

export const apiCoreDownload = async (
  endpoint: string,
  method: string = 'GET',
  token: string,
  params: Record<string, any> = {},
): Promise<Response> => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_CORE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;

  const requestOptions: RequestInit = {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Download failed: ${response.status} - ${errorText}`);
  }

  return response;
};

// This function fetches data from external APIs and handles errors.
export const apiExternalRequest = async <T>(
  endpoint: string,
): Promise<T> => {
  console.log(`Fetching from: ${endpoint}`);
  const response = await fetch(endpoint);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch external data: ${response.status} - ${errorText}`);
  }

  return response.json();
}
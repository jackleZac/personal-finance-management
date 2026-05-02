import { apiExternalRequest } from "./apiService";

// This function fetches currency exchange rates from an external API.
export const fetchCurrencyExchangeRates = async (apiKey: string, baseCurrency: string) => {
  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCurrency}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Exchange rate API response:', JSON.stringify(data, null, 2));
    if (data.result !== 'success') {
      throw new Error(`Exchange rate API error: ${data['error-type'] || 'Unknown error'}`);
    }
    return data;
  } catch (err) {
    console.error('Fetch exchange rates failed:', err);
    throw err;
  }
};


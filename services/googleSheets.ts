import { ScoutingData, INITIAL_DATA } from '../types';
import { TSV_SCHEMA, APP_CONFIG } from '../constants';

export const generateTSV = (data: ScoutingData): string => {
  return TSV_SCHEMA.map(key => {
    const val = data[key as keyof ScoutingData];
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return String(val).replace(/\t/g, ' ').replace(/\n/g, ' '); // Sanitize tabs/newlines
  }).join('\t');
};

export const uploadToGoogleSheets = async (data: ScoutingData): Promise<boolean> => {
  if (!APP_CONFIG.googleScriptUrl || APP_CONFIG.googleScriptUrl.includes("YOUR_")) {
    console.warn("Google Script URL not configured.");
    return false;
  }

  // Transform data for the script - assuming the script accepts JSON key-value pairs
  // Or sending as a raw row. Let's send structured JSON for flexibility.
  try {
    const response = await fetch(APP_CONFIG.googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors', // 'no-cors' is often required for Google Apps Script Web Apps
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // With no-cors, we can't actually check response.ok. 
    // We assume success if no network error thrown.
    return true; 
  } catch (error) {
    console.error("Upload failed", error);
    return false;
  }
};
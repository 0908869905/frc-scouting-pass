
import { ScoutingData } from '../types';
import { TSV_SCHEMA_MATCH, TSV_SCHEMA_PIT, APP_CONFIG } from '../constants';

const MATCH_LEVEL_ABBREV: Record<string, string> = {
  'Practice': 'P',
  'Quals': 'QM',
  'Playoffs': 'PO',
  'Test': 'X'
};

const ROBOT_POS_ABBREV: Record<string, string> = {
  'Red 1': 'R1',
  'Red 2': 'R2',
  'Red 3': 'R3',
  'Blue 1': 'B1',
  'Blue 2': 'B2',
  'Blue 3': 'B3'
};

// Convert PathPoint array to compact string format: "x1,y1|x2,y2|..."
const pathToString = (path: { x: number; y: number }[]): string => {
  if (!path || path.length === 0) return 'None';
  return path.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('|');
};

// Helper to format comments
// Returns the raw comment text. Supports Chinese and other Unicode characters.
const formatComments = (data: ScoutingData): string => {
  return (data.comments && data.comments.trim() !== '') ? data.comments.trim() : 'None';
};

// Safely stringify JSON with Unicode escaping to ensure correct transmission
// across no-cors requests to Google Apps Script (which can sometimes mangle raw UTF-8).
// JSON.parse on the server handles unicode escapes automatically.
function safeJsonStringify(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/[^\x00-\x7F]/g, c => {
    return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

export const generateTSV = (data: ScoutingData): string => {
  const schema = data.mode === 'Pit' ? TSV_SCHEMA_PIT : TSV_SCHEMA_MATCH;
  
  return schema.map(key => {
    // Custom formatted fields
    if (key === 'comments') {
        // Replace tabs and newlines to maintain TSV structure
        // We DO NOT escape unicode here, as TSV is not JSON.
        // We want raw Chinese characters in the QR Code.
        return formatComments(data).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }

    if (key === 'autoPath') {
      return pathToString(data.autoPath);
    }

    const val = data[key as keyof ScoutingData];
    
    // 1. Booleans -> 1 / 0
    if (typeof val === 'boolean') return val ? '1' : '0';

    // 2. Arrays (tags) -> joined or None
    if (Array.isArray(val)) {
       return val.length > 0 ? val.join(',') : 'None';
    }

    // 3. Empty/Null/Undefined -> None
    // This catches empty strings like defendedBy="", comments="", etc.
    if (val === undefined || val === null || String(val).trim() === '') {
        return 'None';
    }

    // 4. Abbreviations
    if (key === 'matchLevel') {
        return MATCH_LEVEL_ABBREV[String(val)] || String(val);
    }
    if (key === 'robotPosition') {
        return ROBOT_POS_ABBREV[String(val)] || String(val);
    }
    
    // 5. Default string handling
    return String(val).replace(/\t/g, ' ').replace(/\n/g, ' '); 
  }).join('\t');
};

export const uploadToGoogleSheets = async (data: ScoutingData): Promise<boolean> => {
  if (!APP_CONFIG.googleScriptUrl || APP_CONFIG.googleScriptUrl.includes("YOUR_")) {
    console.warn("Google Script URL not configured.");
    return false;
  }

  // Create a copy to transform values for upload consistency with TSV
  const payload: Record<string, unknown> = { ...data };

  // Abbreviations
  if (payload.matchLevel && MATCH_LEVEL_ABBREV[payload.matchLevel]) {
      payload.matchLevel = MATCH_LEVEL_ABBREV[payload.matchLevel];
  }
  
  if (payload.robotPosition && ROBOT_POS_ABBREV[payload.robotPosition]) {
      payload.robotPosition = ROBOT_POS_ABBREV[payload.robotPosition];
  }

  // Format Comments - Raw for uploadToGoogleSheets because safeJsonStringify handles escaping
  payload.comments = formatComments(data);

  // Convert autoPath to string format
  payload.autoPath = pathToString(data.autoPath);

  // Iterate over all keys to apply consistency rules
  Object.keys(payload).forEach(key => {
    const val = payload[key];

    // Booleans -> 1 / 0
    if (typeof val === 'boolean') {
      payload[key] = val ? 1 : 0;
    } 
    // Arrays -> 'None' if empty
    else if (Array.isArray(val)) {
        payload[key] = val.length > 0 ? val.join(',') : 'None';
    }
    // Empty/Null -> 'None'
    // comments is already formatted and non-empty, so it skips this
    else if (val === undefined || val === null || String(val).trim() === '') {
        payload[key] = 'None';
    }
  });

  try {
    const response = await fetch(APP_CONFIG.googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use safeJsonStringify to escape unicode characters (e.g. Chinese)
      // This prevents encoding issues on the receiving Google Apps Script side
      // JSON.parse(e.postData.contents) in GAS will automatically convert \uXXXX back to Chinese.
      body: safeJsonStringify(payload)
    });
    return true; 
  } catch (error) {
    console.error("Upload failed", error);
    return false;
  }
};

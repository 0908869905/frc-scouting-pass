
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

// Helper to format comments with status flags "1 0 0 0 Comment..."
const formatComments = (data: ScoutingData): string => {
  const flags = [
    data.robotDied ? '1' : '0',
    data.tippedOver ? '1' : '0',
    data.droppedCoral ? '1' : '0',
    data.droppedAlgae ? '1' : '0'
  ];
  const text = (data.comments && data.comments.trim() !== '') ? data.comments.trim() : 'None';
  return `${flags.join(' ')} ${text}`;
};

export const generateTSV = (data: ScoutingData): string => {
  const schema = data.mode === 'Pit' ? TSV_SCHEMA_PIT : TSV_SCHEMA_MATCH;
  
  return schema.map(key => {
    // Custom formatted fields
    if (key === 'comments') {
        return formatComments(data).replace(/\t/g, ' ').replace(/\n/g, ' ');
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
  const payload: any = { ...data };

  // Abbreviations
  if (payload.matchLevel && MATCH_LEVEL_ABBREV[payload.matchLevel]) {
      payload.matchLevel = MATCH_LEVEL_ABBREV[payload.matchLevel];
  }
  
  if (payload.robotPosition && ROBOT_POS_ABBREV[payload.robotPosition]) {
      payload.robotPosition = ROBOT_POS_ABBREV[payload.robotPosition];
  }

  // Format Comments with flags
  payload.comments = formatComments(data);

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
      body: JSON.stringify(payload)
    });
    return true; 
  } catch (error) {
    console.error("Upload failed", error);
    return false;
  }
};

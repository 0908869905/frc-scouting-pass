
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

export const generateTSV = (data: ScoutingData): string => {
  const schema = data.mode === 'Pit' ? TSV_SCHEMA_PIT : TSV_SCHEMA_MATCH;
  
  return schema.map(key => {
    const val = data[key as keyof ScoutingData];
    
    // Abbreviate Match Level
    if (key === 'matchLevel') {
        return MATCH_LEVEL_ABBREV[String(val)] || String(val);
    }

    // Abbreviate Robot Position
    if (key === 'robotPosition') {
        return ROBOT_POS_ABBREV[String(val)] || String(val);
    }
    
    if (key === 'tags' && Array.isArray(val)) {
       return val.join(',');
    }

    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (val === undefined || val === null) return '';
    
    return String(val).replace(/\t/g, ' ').replace(/\n/g, ' '); // Sanitize
  }).join('\t');
};

export const uploadToGoogleSheets = async (data: ScoutingData): Promise<boolean> => {
  if (!APP_CONFIG.googleScriptUrl || APP_CONFIG.googleScriptUrl.includes("YOUR_")) {
    console.warn("Google Script URL not configured.");
    return false;
  }

  // Create a copy to transform values for upload consistency with TSV
  const payload: any = { ...data };

  if (payload.matchLevel && MATCH_LEVEL_ABBREV[payload.matchLevel]) {
      payload.matchLevel = MATCH_LEVEL_ABBREV[payload.matchLevel];
  }
  
  if (payload.robotPosition && ROBOT_POS_ABBREV[payload.robotPosition]) {
      payload.robotPosition = ROBOT_POS_ABBREV[payload.robotPosition];
  }

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

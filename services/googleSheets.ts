
import { ScoutingData, PathPoint } from '../types';
import { TSV_SCHEMA_MATCH, TSV_SCHEMA_PIT, TSV_SCHEMA_PATH, APP_CONFIG } from '../constants';

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

// --- Douglas-Peucker path simplification ---
// Removes redundant intermediate points while preserving path shape.
// Tolerance is in percentage-coordinate units (0-100 range).
function perpendicularDistance(p: PathPoint, a: PathPoint, b: PathPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0 && dy === 0) {
    return Math.sqrt((p.x - a.x) ** 2 + (p.y - a.y) ** 2);
  }
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / Math.sqrt(dx * dx + dy * dy);
}

function douglasPeucker(points: PathPoint[], tolerance: number): PathPoint[] {
  if (points.length <= 2) return points;

  let maxDist = 0;
  let maxIdx = 0;
  const first = points[0];
  const last = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], first, last);
    if (d > maxDist) { maxDist = d; maxIdx = i; }
  }

  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, maxIdx + 1), tolerance);
    const right = douglasPeucker(points.slice(maxIdx), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

// Simplify path for QR export. Tolerance 1.0 ≈ 1% of field width (~16cm).
export function simplifyPath(points: PathPoint[], tolerance: number = 1.0): PathPoint[] {
  if (points.length <= 2) return points;
  return douglasPeucker(points, tolerance);
}

// Convert PathPoint array to compact string: "x,y|x,y|..."
// Applies Douglas-Peucker simplification + integer rounding for minimal QR size.
const pathToString = (path: PathPoint[]): string => {
  if (!path || path.length === 0) return 'None';
  const simplified = simplifyPath(path);
  return simplified.map(p => `${Math.round(p.x)},${Math.round(p.y)}`).join('|');
};

// Trim a string value; returns '' for blank/non-string. Caller decides fallback.
const formatTextField = (value: unknown): string => {
  return typeof value === 'string' ? value.trim() : '';
};

// TSV keys whose empty/blank value should output '' (not 'None').
// All other empty string/null/undefined values keep the legacy 'None' fallback
// so PreMatch fields (scouterName, teamNumber, etc.) still surface as 'None' when blank.
const PRESERVE_EMPTY_KEYS = new Set<string>([
  'comments',
  'collisionTeamNumbers',
  'ratingPushTrench',
  'ratingPushBump',
  'ratingShoot',
  'ratingHuman',
  'ratingDefense',
  'ratingIntakeFuel',
  'ratingTransportFuel',
  'ratingShootFuel',
]);

// Safely stringify JSON with Unicode escaping to ensure correct transmission
// across no-cors requests to Google Apps Script (which can sometimes mangle raw UTF-8).
// JSON.parse on the server handles unicode escapes automatically.
function safeJsonStringify(obj: Record<string, unknown>): string {
  return JSON.stringify(obj).replace(/[^\x00-\x7F]/g, c => {
    return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

// Generate TSV for path-only QR code (includes match identifier)
export const generatePathTSV = (data: ScoutingData): string => {
  return TSV_SCHEMA_PATH.map(key => {
    if (key === 'autoPath') {
      return pathToString(data.autoPath);
    }
    const val = data[key as keyof ScoutingData];
    return String(val ?? 'None');
  }).join('\t');
};

export const generateTSV = (data: ScoutingData): string => {
  const schema = data.mode === 'Pit' ? TSV_SCHEMA_PIT : TSV_SCHEMA_MATCH;
  
  return schema.map(key => {
    // Custom formatted text field - sanitize for TSV structure but keep raw Unicode.
    if (key === 'comments') {
        return formatTextField(data.comments).replace(/\t/g, ' ').replace(/\n/g, ' ');
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

    // 3. Empty/Null/Undefined -> None (or '' for PRESERVE_EMPTY_KEYS)
    if (val === undefined || val === null || String(val).trim() === '') {
        return PRESERVE_EMPTY_KEYS.has(key) ? '' : 'None';
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

  // PostMatch free-text: trim; PRESERVE_EMPTY_KEYS keeps it as '' below instead of 'None'.
  payload.comments = formatTextField(data.comments);
  payload.collisionTeamNumbers = formatTextField(data.collisionTeamNumbers);

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
    // Empty/Null -> 'None' (or '' for PRESERVE_EMPTY_KEYS)
    else if (val === undefined || val === null || String(val).trim() === '') {
        payload[key] = PRESERVE_EMPTY_KEYS.has(key) ? '' : 'None';
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

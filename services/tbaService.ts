import { APP_CONFIG } from '../constants';

export const fetchTeamNumber = async (eventCode: string, matchKey: string): Promise<string | null> => {
  if (!APP_CONFIG.tbaApiKey || APP_CONFIG.tbaApiKey.includes("YOUR_")) return null;

  try {
    const response = await fetch(`https://www.thebluealliance.com/api/v3/match/${eventCode}_${matchKey}`, {
      headers: {
        'X-TBA-Auth-Key': APP_CONFIG.tbaApiKey
      }
    });
    
    if (response.ok) {
        // This is a simplified fetch. Real implementation requires parsing alliances based on robotPosition
        // For now, we return null to force manual entry, as this is complex to map correctly without robust error handling
        return null; 
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}
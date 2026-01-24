import { createContext, useContext, useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    // Headers
    scouterName: "Scouter Name",
    eventCode: "Event Code",
    matchLevel: "Match Level",
    matchNumber: "Match Number",
    robotPosition: "Robot Position",
    teamNumber: "Team Number",
    autoHeader: "[Auto]",
    teleopHeader: "[Teleop]",
    
    // Auto
    leaveZone: "Leave Starting Zone",
    autoFuel: "Fuel Scored (Active Hub)",
    towerLevel1: "Tower Level 1",
    autoPath: "Auto Path",
    clearPath: "Clear",
    undoPath: "Undo",
    savePath: "Save Image",
    drawPathHint: "Draw robot path with finger",

    // Teleop
    teleFuel: "Fuel Scored (Active Hub)",
    teleTower: "Tower Climb (End Game)",

    // Post Match
    defenseRating: "Defense Rating (0-5)",
    driverRating: "Driver Skill (0-5)",
    speedRating: "Speed Rating (0-5)",
    defendedBy: "Defended By (Team #)",
    robotDied: "Robot Died/Disabled",
    tippedOver: "Tipped Over",
    comments: "Comments",
    commentsPlaceholder: "Strategy, strengths, weaknesses...",

    // QR & Common
    saveSubmit: "Save & Submit",
    saving: "Saving...",
    savedSent: "Saved & Sent!",
    savedOffline: "Saved (Offline)",
    error: "Error",
    reset: "Reset Form for Next Match",
    resetWarning: "Resetting creates a new form. Previous data is kept in History.",
    copyTSV: "Copy TSV",
    rawTSV: "Raw TSV",
    compressed: "Compressed",
    showLabels: "Show Data Labels",
    hideLabels: "Hide Data Labels",

    // History & Settings
    history: "Match History",
    settings: "Settings",
    oneHanded: "One-Handed Mode",
    leftHanded: "Left Handed",
    rightHanded: "Right Handed",
    done: "Done",
    pendingUploads: "Pending Uploads",
    allSynced: "All Synced",
    syncPending: "Sync Pending",
    syncing: "Syncing...",
    retry: "Retry",
    records: "records",
    
    // UI
    next: "Next",
    prev: "Prev",
    scanFinish: "Scan to Finish",
    match: "Match",
    
    // Enums
    "Practice": "Practice", 
    "Quals": "Quals", 
    "Playoffs": "Playoffs", 
    "Test": "Test",
    
    "Red 1": "Red 1", "Red 2": "Red 2", "Red 3": "Red 3",
    "Blue 1": "Blue 1", "Blue 2": "Blue 2", "Blue 3": "Blue 3",
    
    "None": "None", 
    "Parked": "Parked", 
    "Level 1": "Level 1",
    "Level 2": "Level 2",
    "Level 3": "Level 3",
    "Failed": "Failed"
  },
  zh: {
    // Headers
    scouterName: "偵察員姓名",
    eventCode: "賽事代碼",
    matchLevel: "比賽層級",
    matchNumber: "場次",
    robotPosition: "機器人位置",
    teamNumber: "隊伍編號",
    autoHeader: "[自動階段]",
    teleopHeader: "[手動階段]",
    
    // Auto
    leaveZone: "離開起始區",
    autoFuel: "得分燃料 (活躍 Hub)",
    towerLevel1: "塔樓層級 1",
    autoPath: "自動路徑",
    clearPath: "清除",
    undoPath: "撤銷",
    savePath: "儲存圖片",
    drawPathHint: "用手指繪製機器人路徑",

    // Teleop
    teleFuel: "得分燃料 (活躍 Hub)",
    teleTower: "攀爬塔樓 (終局)",

    // Post Match
    defenseRating: "防守評分 (0-5)",
    driverRating: "駕駛技術 (0-5)",
    speedRating: "速度評分 (0-5)",
    defendedBy: "被誰防守 (隊伍號碼)",
    robotDied: "機器人死亡/失效",
    tippedOver: "翻倒",
    comments: "備註",
    commentsPlaceholder: "策略、優勢、劣勢...",

    // QR & Common
    saveSubmit: "儲存並提交",
    saving: "儲存中...",
    savedSent: "已儲存並發送!",
    savedOffline: "已儲存 (離線)",
    error: "錯誤",
    reset: "重置表單 (下一場)",
    resetWarning: "重置將建立新表單。之前的資料保留在紀錄中。",
    copyTSV: "複製 TSV",
    rawTSV: "原始 TSV",
    compressed: "壓縮格式",
    showLabels: "顯示資料標籤",
    hideLabels: "隱藏資料標籤",

    // History & Settings
    history: "比賽紀錄",
    settings: "設定",
    oneHanded: "單手模式",
    leftHanded: "左手慣用",
    rightHanded: "右手慣用",
    done: "完成",
    pendingUploads: "待上傳",
    allSynced: "已同步",
    syncPending: "同步待傳項目",
    syncing: "同步中...",
    retry: "重試",
    records: "筆紀錄",

    // UI
    next: "下一步",
    prev: "上一步",
    scanFinish: "掃描完成",
    match: "場次",

    // Enums
    "Practice": "練習賽", 
    "Quals": "資格賽", 
    "Playoffs": "季後賽", 
    "Test": "測試",
    
    "Red 1": "紅 1", "Red 2": "紅 2", "Red 3": "紅 3",
    "Blue 1": "藍 1", "Blue 2": "藍 2", "Blue 3": "藍 3",
    
    "None": "無", 
    "Parked": "停泊", 
    "Level 1": "層級 1",
    "Level 2": "層級 2",
    "Level 3": "層級 3",
    "Failed": "失敗"
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', lang);
  }, [lang]);

  const t = (key: string): string => {
    const langTranslations = translations[lang] as Record<string, string>;
    return langTranslations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

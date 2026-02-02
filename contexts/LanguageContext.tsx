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
    alliance: "Alliance",
    teamNumber: "Team Number",
    autoHeader: "[Auto]",
    teleopHeader: "[Teleop]",
    penaltyHeader: "[Penalty]",
    postMatchHeader: "Post Match",

    // Auto
    autoFuel: "Fuel Scored",
    autoPath: "Auto Path",
    clearPath: "Clear",
    undoPath: "Undo",
    savePath: "Save Image",
    drawPathHint: "Draw robot path with finger",
    autoClimbStatus: "Climb Status",
    autoClimbTime: "Climb Time (sec)",

    // Teleop
    teleFuel: "Fuel Scored",
    teleClimbStatus: "Climb Status (End Game)",
    teleClimbTime: "Climb Time (sec)",
    bumpCount: "Bump Crossings",
    trenchCount: "Trench Crossings",
    fuelDroppedOnBump: "Fuel Dropped on Bump",

    // Penalty
    penaltyCount: "Penalty Count",
    minorPenalty: "Minor",
    majorPenalty: "Major",

    // Post Match
    defenseRating: "Defense Rating (0-5)",
    driverSkill: "Driver Skill (0-5)",
    speedRating: "Speed Rating (0-5)",
    robotDied: "Robot Died/Disabled",
    almostTipped: "Almost Tipped",
    ridingOnBall: "Riding on Fuel",
    comments: "Comments",
    commentsPlaceholder: "Strategy, strengths, weaknesses...",
    // Climb Position (5 positions)
    climbPosition: "Climb Position",
    LeftSide: "Left Side",
    Left: "Left",
    Center: "Center",
    Right: "Right",
    RightSide: "Right Side",

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

    // Validation
    teamNumberInvalid: "Team number must be a positive integer",
    autoStartWarning: "Path should start in the Starting Zone (center area)",
    startingZone: "Starting Zone",

    // Match Level Enums
    "Practice": "Practice",
    "Quals": "Quals",
    "Playoffs": "Playoffs",
    "Test": "Test",

    // Alliance
    "Red": "Red",
    "Blue": "Blue",

    // Auto Climb Status
    "autoNone": "None",
    "autoLevel1": "Level 1",
    "autoFailed": "Failed",

    // Teleop Climb Status
    "None": "None",
    "Level1": "Level 1",
    "Level2": "Level 2",
    "Level3": "Level 3",
    "Failed": "Failed"
  },
  zh: {
    // Headers
    scouterName: "偵察員姓名",
    eventCode: "賽事代碼",
    matchLevel: "比賽層級",
    matchNumber: "場次",
    alliance: "聯盟",
    teamNumber: "隊伍編號",
    autoHeader: "[自動階段]",
    teleopHeader: "[手動階段]",
    penaltyHeader: "[犯規]",
    postMatchHeader: "賽後",

    // Auto
    autoFuel: "進球燃料數",
    autoPath: "自動路徑",
    clearPath: "清除",
    undoPath: "撤銷",
    savePath: "儲存圖片",
    drawPathHint: "用手指繪製機器人路徑",
    autoClimbStatus: "攀爬狀態",
    autoClimbTime: "攀爬時間 (秒)",

    // Teleop
    teleFuel: "進球燃料數",
    teleClimbStatus: "攀爬狀態 (終局)",
    teleClimbTime: "攀爬時間 (秒)",
    bumpCount: "穿越 Bump 次數",
    trenchCount: "穿越 Trench 次數",
    fuelDroppedOnBump: "穿越 Bump 時 Fuel 掉落",

    // Penalty
    penaltyCount: "犯規次數",
    minorPenalty: "輕微犯規",
    majorPenalty: "重大犯規",

    // Post Match
    defenseRating: "防守評分 (0-5)",
    driverSkill: "駕駛技術 (0-5)",
    speedRating: "速度評分 (0-5)",
    robotDied: "機器人死亡/失效",
    almostTipped: "差點翻車",
    ridingOnBall: "騎在 Fuel 上",
    comments: "備註",
    commentsPlaceholder: "策略、優勢、劣勢...",
    // Climb Position (5 positions)
    climbPosition: "攀爬位置",
    LeftSide: "左側",
    Left: "左",
    Center: "中",
    Right: "右",
    RightSide: "右側",

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

    // Validation
    teamNumberInvalid: "隊伍編號必須是正整數",
    autoStartWarning: "路徑應從起始區域開始（中間區域）",
    startingZone: "起始區域",

    // Match Level Enums
    "Practice": "練習賽",
    "Quals": "資格賽",
    "Playoffs": "季後賽",
    "Test": "測試",

    // Alliance
    "Red": "紅",
    "Blue": "藍",

    // Auto Climb Status
    "autoNone": "無",
    "autoLevel1": "層級 1",
    "autoFailed": "失敗",

    // Teleop Climb Status
    "None": "無",
    "Level1": "層級 1",
    "Level2": "層級 2",
    "Level3": "層級 3",
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

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

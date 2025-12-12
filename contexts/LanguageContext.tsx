
import React, { createContext, useContext, useState, useEffect } from 'react';

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
    humanPlayer: "Human Player in Processor Area?",
    autoHeader: "[Auto]",
    teleopHeader: "[Teleop]",
    
    // Auto
    leaveZone: "Leave Starting Zone",
    coralScoring: "Coral Scoring",
    algaeScoring: "Algae Scoring",
    l4Success: "L4 Success",
    l4Fail: "L4 Fail",
    l3Success: "L3 Success",
    l3Fail: "L3 Fail",
    l2Success: "L2 Success",
    l2Fail: "L2 Fail",
    l1Success: "L1 Success",
    l1Fail: "L1 Fail",
    processorHit: "Processor Hit",
    processorMiss: "Processor Miss",
    netHit: "Net Hit",
    netMiss: "Net Miss",

    // Teleop
    pickupSource: "Pickup Source",
    opponentProcessor: "Opponent Processor Shot?",
    endGame: "End Game",
    bargeTimer: "Barge Timer",
    finalStatus: "Final Status",

    // Post Match
    driverSkill: "Driver Skill (0-5)",
    defenseRating: "Defense Rating (0-5)",
    speedRating: "Speed Rating (0-5)",
    coopBonus: "Coop Bonus Met?",
    defendedBy: "Defended By (Team #)",
    robotDied: "Robot Died/Disabled",
    tippedOver: "Tipped Over",
    droppedCoral: "Dropped Coral (2+)",
    droppedAlgae: "Dropped Algae (2+)",
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
    
    "Coral Station": "Coral Station", 
    "Floor": "Floor", 
    "Both": "Both", 
    "Not Attempted": "Not Attempted",
    
    "None": "None", 
    "Parked": "Parked", 
    "Deep Cage": "Deep Cage", 
    "Shallow Cage": "Shallow Cage", 
    "Failed Deep": "Failed Deep", 
    "Failed Shallow": "Failed Shallow"
  },
  zh: {
    // Headers
    scouterName: "偵察員姓名",
    eventCode: "賽事代碼",
    matchLevel: "比賽層級",
    matchNumber: "場次",
    robotPosition: "機器人位置",
    teamNumber: "隊伍編號",
    humanPlayer: "人類玩家在處理區？",
    autoHeader: "[自動階段]",
    teleopHeader: "[手動階段]",
    
    // Auto
    leaveZone: "離開起始區",
    coralScoring: "珊瑚得分",
    algaeScoring: "藻類得分",
    l4Success: "L4 成功",
    l4Fail: "L4 失敗",
    l3Success: "L3 成功",
    l3Fail: "L3 失敗",
    l2Success: "L2 成功",
    l2Fail: "L2 失敗",
    l1Success: "L1 成功",
    l1Fail: "L1 失敗",
    processorHit: "處理器命中",
    processorMiss: "處理器失誤",
    netHit: "網命中",
    netMiss: "網失誤",

    // Teleop
    pickupSource: "拾取來源",
    opponentProcessor: "射入對手處理器？",
    endGame: "終局",
    bargeTimer: "登船計時",
    finalStatus: "最終狀態",

    // Post Match
    driverSkill: "駕駛技術 (0-5)",
    defenseRating: "防守評分 (0-5)",
    speedRating: "速度評分 (0-5)",
    coopBonus: "達成合作獎勵？",
    defendedBy: "被誰防守 (隊伍號碼)",
    robotDied: "機器人死亡/失效",
    tippedOver: "翻倒",
    droppedCoral: "掉落珊瑚 (2+)",
    droppedAlgae: "掉落藻類 (2+)",
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
    
    "Coral Station": "珊瑚站", 
    "Floor": "地面", 
    "Both": "兩者", 
    "Not Attempted": "未嘗試",
    
    "None": "無", 
    "Parked": "停泊", 
    "Deep Cage": "深籠", 
    "Shallow Cage": "淺籠", 
    "Failed Deep": "深籠失敗", 
    "Failed Shallow": "淺籠失敗"
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app_language', lang);
  }, [lang]);

  const t = (key: string): string => {
    // @ts-ignore
    return translations[lang][key] || key;
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

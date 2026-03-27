// js/i18n.js — 国际化 / Internationalization
// 用法：import { i18n, t } from '../i18n.js';
//       t('key') 获取当前语言对应的文字

const _dict = {
  en: {
    // ── Menu ─────────────────────────────────────────────────────────
    btn_play: "PLAY",
    btn_settings: "Settings",
    btn_achieves: "Achieves",
    menu_subtitle: "----   you help you   ----",

    // ── Result ───────────────────────────────────────────────────────
    btn_back_menu: "Back to Menu",
    btn_restart: "Restart Level",
    btn_next_level: "Next Level",
    result_win: "Level Complete!",
    result_lose: "Game Over",
    result_press_r: "Press R to Restart",

    // ── Setting Window ───────────────────────────────────────────────
    win_title: "⚙  Settings",
    win_sound: "🔊 Sound",
    win_bgm: "BGM",
    win_sfx: "SFX",
    win_language: "🌐 Language",
    win_keybind: "⌨ Controls",
    win_credits: "📜 Credits",
    win_credits_content:
      "Game Design & Development:\nTeam 13\n\nSpecial Thanks:\nBristol University",
    pause_title: "⏸  Paused",
    pause_hint: "Game is paused",
    pause_resume: "▶  Resume",
    pause_setting: "⚙  Setting",
    pause_hint_btn: "💡  Hint",
    pause_restart: "🔄  Restart Level",
    pause_back_level_choice: "🗺  Back to Level Choice",
    pause_back_menu: "⏏  Back to Menu",
    hint_title: "💡  Hint",
    keybind_reset_title: "Reset to default",
    keybind_conflict: "The key {KEY} is already bound to {ACTION}",
    keybind_jump: "Jump",
    keybind_moveLeft: "Move Left",
    keybind_moveRight: "Move Right",
    keybind_interaction: "Interaction",
    keybind_record: "Record/Stop",
    keybind_replay: "Replay",
    keybind_teleportCheckpoint: "Teleport to Checkpoint",

    // ── Record HUD ───────────────────────────────────────────────────
    rec_title_standby: "Phantom Recorder Standby",
    rec_title_recording: "Recording: actions being recorded",
    rec_title_ready: "Record Complete",
    rec_title_replaying: "Replaying",
    rec_sub_max: "Press {KEY} to Start Recording | Max Record Duration",
    rec_sub_press_e_end: "Press {KEY} to end early",
    rec_sub_press_replay_end: "Press {KEY} to end replay early",
    rec_sub_ready_prefix:
      "Press {REPLAY} to replay | {RECORD} to re-record  Recorded",
    rec_hud_label: "RECORD HUD",
    rec_blocked_air: "Land first to record!",
    level1_missed_prompt:
      "Wait... did I just miss something? let me carefully check the noticeboard content",
    level1_replay_prompt:
      "...He is repeating every step I just did.\nI think... I cannot touch him? Is it really impossible to touch him?",
    level1_title: "Rule",
    level1_info_left: "level 1\nRule",
    level1_info_right: "Difficulty\nTutorial 💜",
    level2_title: "Higher",
    level2_info_left: "level 2\nHigher",
    level2_info_right: "Difficulty\n💜💜",
    level2_jump_higher_prompt: "How can I jump much higher?",
    level2_jump_hint_window:
      'Congratulations!\n You\'ve unlocked the achievement: \n"<span class="rainbow-wave">P</span><span class="rainbow-wave">e</span><span class="rainbow-wave">r</span><span class="rainbow-wave">s</span><span class="rainbow-wave">e</span><span class="rainbow-wave">v</span><span class="rainbow-wave">e</span><span class="rainbow-wave">r</span><span class="rainbow-wave">a</span><span class="rainbow-wave">n</span><span class="rainbow-wave">c</span><span class="rainbow-wave">e</span>"!\n(Hint: hint is in the pause menu, not here haha)',
    level3_signboard_prompt: "Which key was it to interact again?",
    level3_title: "Electricity",
    level3_info_left: "level 3\nElectricity",
    level3_info_right: "Difficulty\n💜💜💜",
    level4_title: "Trap",
    level4_info_left: "level 4\nTrap",
    level4_info_right: "Difficulty\n💜💜",
    level5_title: "Jail",
    level5_info_left: "level 5\nJail",
    level5_info_right: "Difficulty\n💜💜💜💜",
    level6_title: "Checkpoint",
    level6_room2_title: "“Jump Off The Bridge”",
    level6_info_left: "level 6\nCheckpoint",
    level6_info_right: "Difficulty\n💜💜💜",
    level7_title: "Level 7",
    level7_info_left: "level 7",
    level7_info_right: "Difficulty\n💜",
    level8_title: "Level 8",
    level8_info_left: "level 8\nBoom & Bunker",
    level8_info_right: "Difficulty\n💜💜💜",
    hint_level8:
    "Use both selves to press the two buttons and make the chest appear. Open it to get 2 bombs. During replay, press [1] to place a bomb at the Past Self's position. Destroy the rock pile and the laser bunker, then reach the portal.",
    level8_room0_prompt:
      "Press both buttons at the same time.\nThe chest will appear near one of them.",
    level8_room1_prompt:
      "A bomb can clear the rock pile.\nRecord a route, then replay it.",
    level8_room2_prompt:
      "The bunker only threatens the Present Self.\nIt stops targeting during recording and replay.",
    level8_hud_bombs: "Bombs",
    level8_hud_objectives: "Obstacles",
    level8_hud_place_bomb: "[1] Place bomb during replay",
    level8_notice_chest_spawned: "The chest has appeared.",
    level8_notice_opened_chest:
      "You got 2 bombs. Press [1] to place during replay.",
    level8_notice_move_closer: "Move closer to the chest first.",
    level8_notice_need_replay: "Bombs can only be placed during replay.",
    level8_notice_need_chest: "Open the chest first.",
    level8_notice_no_bombs: "No bombs left.",
    level8_notice_exit_ready:
      "Both obstacles are cleared. The exit portal is now open.",
    level9_title: "Level 9",
    level9_info_left: "level 9",
    level9_info_right: "Difficulty\n💜",
    level10_title: "Level 10",
    level10_info_left: "level 10",
    level10_info_right: "Difficulty\n💜",
    module_btn_label: "Install Module",
    module_installation_complete:
      "Installation Complete\n Now you can see the record HUD",
    first_record_prompt:
      "You have successfully learned to record your actions!\nPress the record key again to start~\nMax recording duration: 5 seconds",
    click_to_close: "Click anywhere to close",

    // ── Achievement ─────────────────────────────────────────────────
    achievement_unlocked: "New Achievement Unlocked!",
    achiev_title: "Achievements",
    achiev_locked: "???",
    achiev_locked_desc: "Complete the required task to unlock this achievement",

    // ── World Select ─────────────────────────────────────────────────
    world_1: "Demo 2",
    world_2: "World 2",
    world_3: "Demo 1",

    // ── NPC Default Dialogue ─────────────────────────────────────────
    npc_default_line1: "Hi there! Nice to meet you!",
    npc_default_line2: "Good luck on your adventure!",
    npc_default_exhausted: "I've already told you everything I know.",
    npc_continue_hint: "[{KEY}] Continue",
  },

  zh: {
    // ── Menu ─────────────────────────────────────────────────────────
    btn_play: "开始",
    btn_settings: "设置",
    btn_achieves: "成就",
    menu_subtitle: "----   能自渡者，方得天助   ----",

    // ── Result ───────────────────────────────────────────────────────
    btn_back_menu: "返回菜单",
    btn_restart: "重新开始当前关卡",
    btn_next_level: "下一关",
    result_win: "~恭喜通关~",
    result_lose: "游戏结束",
    result_press_r: "按 R 键重新开始",

    // ── Setting Window ───────────────────────────────────────────────
    win_title: "⚙  设置",
    win_sound: "🔊 音效设置",
    win_bgm: "背景音乐",
    win_sfx: "音效",
    win_language: "🌐 语言",
    win_keybind: "⌨ 按键设置",
    win_credits: "📜 制作人员",
    win_credits_content:
      "游戏设计与开发：\nTeam 13\n\n特别鸣谢: \n布里斯托尔大学",
    pause_title: "⏸  已暂停",
    pause_hint: "游戏已暂停",
    pause_resume: "▶  继续游戏",
    pause_setting: "⚙  设置",
    pause_hint_btn: "💡  提示",
    pause_restart: "🔄  重开当前关卡",
    pause_back_level_choice: "🗺  返回关卡选择",
    pause_back_menu: "⏏  返回菜单",
    hint_title: "💡  提示",
    keybind_reset_title: "重置为默认",
    keybind_conflict: "按键 {KEY} 已绑定到 {ACTION}",
    keybind_jump: "跳跃",
    keybind_moveLeft: "向左移动",
    keybind_moveRight: "向右移动",
    keybind_interaction: "交互",
    keybind_record: "录制/停止",
    keybind_replay: "回放",
    keybind_teleportCheckpoint: "回到存档点",

    // ── Record HUD ───────────────────────────────────────────────────
    rec_title_standby: "幻影录制器待命",
    rec_title_recording: "录制中:现在你的动作正在被记录",
    rec_title_ready: "录制完成",
    rec_title_replaying: "回放中",
    rec_sub_max: "按 {KEY} 开始录制 | 最大录制时长",
    rec_sub_press_e_end: "按 {KEY} 可提前结束录制",
    rec_sub_press_replay_end: "按 {KEY} 可提前结束回放",
    rec_sub_ready_prefix: "按 {REPLAY} 回放，按 {RECORD} 重新录制  已录制",
    rec_hud_label: "录制面板",
    rec_blocked_air: "落地后才能录制！",
    level1_missed_prompt:
      "等等，我刚刚是不是错过了什么？让我仔细看看公告栏的内容",
    level1_replay_prompt:
      "……他在重复我刚才做的每一步。\n我好像……碰不到他? 真的碰不到吗? ",
    level1_title: "规则",
    level1_info_left: "第一关\n规则",
    level1_info_right: "难度\n🩷",
    level2_title: "登高",
    level2_info_left: "第二关\n登高",
    level2_info_right: "难度\n🩷🩷",
    level2_jump_higher_prompt: "怎么才能跳得更高呢？",
    level2_jump_hint_window:
      '恭喜你解锁"<span class="rainbow-wave">坚</span><span class="rainbow-wave">持</span><span class="rainbow-wave">不</span><span class="rainbow-wave">懈</span>"的成就！\n（提示在暂停菜单里哦，不在这里哈哈）',
    level3_signboard_prompt: "我记得按哪个键可以交互来着？",
    level3_title: "通电",
    level3_info_left: "第三关\n通电",
    level3_info_right: "难度\n🩷🩷🩷",
    level4_title: "陷阱",
    level4_info_left: "第四关\n陷阱",
    level4_info_right: "难度\n🩷🩷",
    level5_title: "牢笼",
    level5_info_left: "第五关\n牢笼",
    level5_info_right: "难度\n🩷🩷🩷🩷",
    level6_title: "第六关",
    level6_room2_title: "《Jump Off the Bridge》",
    level6_info_left: "第六关",
    level6_info_right: "难度\n🩷",
    level7_title: "第七关",
    level7_info_left: "第七关",
    level7_info_right: "难度\n🩷",
    level8_title: "第八关",
    level8_info_left: "第八关\n爆破/碉堡",
    level8_info_right: "难度\n🩷🩷🩷",
    hint_level8:
      "让本体和分身同时踩下两个按钮，使宝箱出现。打开宝箱后可获得 2 颗炸弹。回放阶段按 [1]，可让过去的自己在当前位置放置炸弹。炸毁落石堆与激光碉堡后，前往终点传送门。",
    level8_room0_prompt:
      "同时按下两个按钮。\n宝箱会随机刷新在其中一个按钮附近。",
    level8_room1_prompt:
      "炸弹可以清除落石堆。\n先录制路线, 再进行回放。",
    level8_room2_prompt:
      "碉堡只会威胁你的本体。\n录制与回放期间, 它不会锁定你的分身。",
    level8_hud_bombs: "炸弹",
    level8_hud_objectives: "障碍进度",
    level8_hud_place_bomb: "回放时按 [1] 放置炸弹",
    level8_notice_chest_spawned: "宝箱出现了。",
    level8_notice_opened_chest:
      "你获得了 2 颗炸弹。先录制路线，并在回放时按 [1] 放置炸弹。",
    level8_notice_move_closer: "先靠近宝箱再打开。",
    level8_notice_need_replay: "只有在回放阶段才能放置炸弹。",
    level8_notice_need_chest: "请先打开宝箱。",
    level8_notice_no_bombs: "炸弹已经用完了。",
    level8_notice_exit_ready:
      "两个障碍都已清除，终点传送门已开启。",
    level9_title: "第九关",
    level9_info_left: "第九关",
    level9_info_right: "难度\n🩷",
    level10_title: "第十关",
    level10_info_left: "第十关",
    level10_info_right: "难度\n🩷",
    module_btn_label: "安装模块",
    module_installation_complete: "安装完成\n现在你可以看到录制面板了",
    first_record_prompt:
      "你学会录制自己的操作了！\n再按一次录制键开始吧\n最多只能录 5 秒哦",
    click_to_close: "点击任意处关闭",

    // ── 成就 ──────────────────────────────────────────────────────────
    achievement_unlocked: "新的成就已解锁！",
    achiev_title: "成就",
    achiev_locked: "???",
    achiev_locked_desc: "完成指定任务以解锁此成就",

    // ── World Select ─────────────────────────────────────────────────
    world_1: "Demo 2",
    world_2: "世界 2",
    world_3: "初代 Demo",

    // ── NPC 默认对话 ─────────────────────────────────────────────────
    npc_default_line1: "你好呀！很高兴认识你！",
    npc_default_line2: "祝你冒险顺利！",
    npc_default_exhausted: "我已经把知道的都告诉你了。",
    npc_continue_hint: "[{KEY}] 继续",
  },
};

// const LANG_STORAGE_KEY = 'kinoko_lang';

// 移除localStorage，始终使用默认语言en
let _lang = "en";
const _listeners = [];

export const i18n = {
  /** 切换语言，触发所有已注册的监听器 */
  setLang(lang) {
    if (!_dict[lang] || _lang === lang) return;
    _lang = lang;
    // 不再持久化
    _listeners.forEach((fn) => fn(lang));
  },

  getLang() {
    return _lang;
  },

  /** 注册语言变化监听器 */
  onChange(fn) {
    _listeners.push(fn);
  },

  /** 注销监听器 */
  offChange(fn) {
    const idx = _listeners.indexOf(fn);
    if (idx !== -1) _listeners.splice(idx, 1);
  },
};

/**
 * 快捷取文字函数：用当前语言取 _dict[lang][key]，
 * 找不到时回退到英文，再找不到返回 key 本身。
 */
export function t(key) {
  return _dict[_lang]?.[key] ?? _dict["en"]?.[key] ?? key;
}

/**
 * 注册额外的翻译条目（供各 demo 模块调用）。
 * @param {{ [lang: string]: Record<string, string> }} langEntries
 */
export function registerTranslations(langEntries) {
  for (const [lang, entries] of Object.entries(langEntries)) {
    if (!_dict[lang]) _dict[lang] = {};
    Object.assign(_dict[lang], entries);
  }
}

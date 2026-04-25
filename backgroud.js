const SITES = {
  productive: {
    domains: [
      'github.com', 'gitlab.com', 'bitbucket.org',
      'notion.so', 'notions.site',
      'docs.google.com', 'drive.google.com',
      'figma.com', 'linear.app',
      'stackoverflow.com', 'stackexchange.com',
      'developer.mozilla.org', 'mdn.io',
      'coursera.org', 'udemy.com', 'khanacademy.org', 'edx.org',
      'leetcode.com', 'hackerrank.com', 'codewars.com',
      'trello.com', 'asana.com', 'jira.atlassian.com', 'monday.com',
      'overleaf.com', 'replit.com', 'codesandbox.io', 'codepen.io',
      'vercel.com', 'netlify.com', 'medium.com', 'substack.com',
      'wikipedia.org', 'arxiv.org', 'npm.js.org', 'npmjs.com',
      'docs.anthropic.com', 'openai.com', 'chat.openai.com', 'claude.ai',
      'calendar.google.com', 'gmail.com', 'mail.google.com',
      'slack.com', 'zoom.us', 'typeform.com', 'airtable.com',
    ],
    mochi: 7,
    label: 'productive'
  },
  neutral: {
    domains: [
      'amazon.com', 'amazon.in', 'amazon.co.uk', 'flipkart.com',
      'booking.com', 'airbnb.com', 'skyscanner.com', 'skyscanner.net',
      'makemytrip.com', 'goibibo.com', 'zomato.com', 'swiggy.com',
      'google.com/maps', 'maps.google.com', 'maps.apple.com',
      'yelp.com', 'tripadvisor.com', 'instacart.com', 'doordash.com',
      'uber.com', 'ola.com', 'myntra.com', 'ajio.com', 'nykaa.com', 'healthkart.com',
    ],
    mochi: 5,
    label: 'neutral'
  },
  distraction: {
    domains: [
      'youtube.com', 'instagram.com', 'tiktok.com', 'reddit.com',
      'snapchat.com', 'twitter.com', 'x.com', 'facebook.com', 'fb.com',
      'twitch.tv', 'netflix.com', 'primevideo.com', 'amazon.com/gp/video',
      'hotstar.com', 'disneyplus.com', 'hulu.com', 'spotify.com',
      '9gag.com', 'tumblr.com', 'pinterest.com', 'buzzfeed.com',
      'quora.com', 'discord.com',
    ],
    mochi: 3,
    label: 'distraction'
  }
};
const MOCHI_TICK  = 15;
const HUNGER_TICK = 30;
const MOCHI_CAP   = 999;
const ALARM_MAP   = { awardMochi: award, updateHunger: hunger };

function urlcat(url) {
  if (!url || /^(chrome|edge|about):/.test(url)) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const [k, cat] of Object.entries(SITES)) {
      for (const d of cat.domains) {
        const cd = d.replace(/^www\./, '');
        if (host === cd || host.endsWith('.' + cd)) return { key: k, ...cat };
      }
    }
    return { key: 'unknown', mochi: 4, label: 'unknown' };
  } catch { return null; }
}

function mood(hunger, stats) {
  const total = (stats.productive + stats.neutral + stats.distraction) || 1;
  const ratio = stats.productive / total;
  if (hunger <= 10) return 'starving';
  if (hunger <= 30) return 'sad';
  if (hunger >= 80 && ratio >= 0.5) return 'thriving';
  if (hunger >= 60) return 'happy';
  if (hunger >= 40) return 'neutral';
  return 'sad';
}

async function load() {
  return new Promise(res => {
    chrome.storage.local.get([
      'mochiCount', 'catMood', 'catHunger', 'lastFedTime',
      'lastActiveTime', 'todayStats', 'activeTabUrl', 'activeTabStart',
      'totalMochiEarned', 'streakDays', 'lastActiveDate',
    ], data => {
      const now = Date.now();
      const today = new Date().toDateString();
      res({
        mochiCount:      data.mochiCount      ?? 10,
        catMood:         data.catMood         ?? 'happy',
        catHunger:       data.catHunger       ?? 80,
        lastFedTime:     data.lastFedTime     ?? now,
        lastActiveTime:  data.lastActiveTime  ?? now,
        todayStats:      data.todayStats?.date === today
                           ? data.todayStats
                           : { date: today, productive: 0, neutral: 0, distraction: 0, mochiEarned: 0 },
        activeTabUrl:    data.activeTabUrl    ?? null,
        activeTabStart:  data.activeTabStart  ?? now,
        totalMochiEarned: data.totalMochiEarned ?? 0,
        streakDays:      data.streakDays      ?? 1,
        lastActiveDate:  data.lastActiveDate  ?? today,
      });
    });
  });
}

async function save(patch) {
  return new Promise(res => chrome.storage.local.set(patch, res));
}

async function tabswitch(url) {
  const s = await load();
  const now = Date.now();
  if (s.activeTabUrl && s.activeTabStart) {
    const mins = (now - s.activeTabStart) / 60000;
    const cat = urlcat(s.activeTabUrl);
    if (cat && mins > 0) {
      const stats = { ...s.todayStats };
      if (cat.key === 'productive')   stats.productive  += mins;
      else if (cat.key === 'neutral')      stats.neutral     += mins;
      else if (cat.key === 'distraction')  stats.distraction += mins;
      await save({ todayStats: stats, activeTabUrl: url, activeTabStart: now });
      return;
    }
  }
  await save({ activeTabUrl: url, activeTabStart: now, lastActiveTime: now });
}

async function award() {
  const s = await load();
  const now = Date.now();
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs.length) return;
  const cat = urlcat(tabs[0].url);
  if (!cat) return;

  const gained = cat.mochi;
  const stats  = { ...s.todayStats };
  stats.mochiEarned = (stats.mochiEarned || 0) + gained;
  if (cat.key === 'productive')   stats.productive  += MOCHI_TICK;
  else if (cat.key === 'neutral')      stats.neutral     += MOCHI_TICK;
  else if (cat.key === 'distraction')  stats.distraction += MOCHI_TICK;

  const today = new Date().toDateString();
  let { streakDays, lastActiveDate } = s;
  if (lastActiveDate !== today) {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    streakDays = lastActiveDate === yest.toDateString() ? streakDays + 1 : 1;
    lastActiveDate = today;
  }

  await save({
    mochiCount:       Math.min(s.mochiCount + gained, MOCHI_CAP),
    todayStats:       stats,
    totalMochiEarned: (s.totalMochiEarned || 0) + gained,
    streakDays,
    lastActiveDate,
    activeTabUrl:     tabs[0].url,
    activeTabStart:   now,
  });
}

async function hunger() {
  const s = await load();
  let { mochiCount, catHunger } = s;
  if (mochiCount > 0) {
    const ate = Math.min(mochiCount, 20);
    mochiCount -= ate;
    catHunger   = Math.min(100, catHunger + ate);
  } else {
    catHunger = Math.max(0, catHunger - 25);
  }
  await save({
    mochiCount,
    catHunger,
    catMood:     mood(catHunger, s.todayStats),
    lastFedTime: mochiCount > 0 ? Date.now() : s.lastFedTime,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('awardMochi',   { periodInMinutes: MOCHI_TICK  });
  chrome.alarms.create('updateHunger', { periodInMinutes: HUNGER_TICK });
});

chrome.alarms.onAlarm.addListener(a => ALARM_MAP[a.name]?.());

chrome.tabs.onActivated.addListener(async info => {
  const tab = await chrome.tabs.get(info.tabId);
  if (tab.url) tabswitch(tab.url);
});

chrome.tabs.onUpdated.addListener(async (id, change, tab) => {
  if (change.status === 'complete' && tab.active && tab.url) tabswitch(tab.url);
});

chrome.runtime.onMessage.addListener((msg, _, reply) => {
  if (msg.type === 'GET_STATE') {
    load().then(reply);
    return true;
  }
  if (msg.type === 'GET_CURRENT_SITE') {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const url = tabs[0]?.url ?? null;
      reply({ url, category: url ? urlcat(url) : null });
    });
    return true;
  }
  if (msg.type === 'FORCE_HUNGER_UPDATE') {
    hunger().then(() => load().then(reply));
    return true;
  }
});
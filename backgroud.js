const site_cats = {
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
      'overleaf.com',
      'replit.com', 'codesandbox.io', 'codepen.io',
      'vercel.com', 'netlify.com',
      'medium.com', 'substack.com',
      'wikipedia.org', 'arxiv.org',
      'npm.js.org', 'npmjs.com',
      'docs.anthropic.com', 'openai.com',
      'chat.openai.com', 'claude.ai',
      'calendar.google.com',
      'gmail.com', 'mail.google.com',
      'slack.com', 'zoom.us',
      'typeform.com', 'airtable.com',
    ],
    mochi: 7,
    label: 'productive'
  },
  neutral: {
    domains: [
      'amazon.com', 'amazon.in', 'amazon.co.uk',
      'flipkart.com',
      'booking.com', 'airbnb.com',
      'skyscanner.com', 'skyscanner.net',
      'makemytrip.com', 'goibibo.com',
      'zomato.com', 'swiggy.com',
      'google.com/maps', 'maps.google.com',
      'maps.apple.com', 'yelp.com',
      'tripadvisor.com', 'instacart.com',
      'doordash.com', 'uber.com', 'ola.com',
      'myntra.com', 'ajio.com',
      'nykaa.com', 'healthkart.com',
    ],
    mochi: 5,
    label: 'neutral'
  },
  distraction: {
    domains: [
      'youtube.com', 'youtu.be',
      'instagram.com', 'tiktok.com',
      'reddit.com', 'snapchat.com',
      'twitter.com', 'x.com',
      'facebook.com', 'fb.com',
      'twitch.tv', 'netflix.com',
      'primevideo.com', 'amazon.com/gp/video',
      'hotstar.com', 'disneyplus.com',
      'hulu.com', 'spotify.com',
      '9gag.com', 'tumblr.com',
      'pinterest.com', 'buzzfeed.com',
      'quora.com', 'discord.com',
    ],
    mochi: 3,
    label: 'distraction'
  }
};

const mochi_interval = 10;
const hunger_interval = 30;
const max_mochi = 999;

const dbg = false;
const ver = '1.2';

const state_keys = [
  'mochiCount', 'catMood', 'catHunger', 'lastFedTime',
  'lastActiveTime', 'todayStats', 'activeTabUrl',
  'activeTabStart', 'totalMochiEarned', 'streakDays', 'lastActiveDate'
];

function calcmood(hunger, stats) {
  const total = (stats.productive + stats.neutral + stats.distraction) || 1;
  const prod_r = stats.productive / total;
  const dist_r = stats.distraction / total;

  if (hunger <= 10) return 'starving';
  if (hunger <= 30) return 'sad';
  if (dist_r >= 0.6) return 'sad';
  if (dist_r >= 0.4) return hunger >= 70 ? 'neutral' : 'sad';
  if (hunger >= 80 && prod_r >= 0.5) return 'thriving';
  if (hunger >= 60) return 'happy';
  if (hunger >= 40) return 'neutral';
  return 'sad';
}

function urlcat(url) {
  if (!url || url.startsWith('chrome://') || url.startsWith('edge://') || url.startsWith('about:')) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    for (const [k, cat] of Object.entries(site_cats)) {
      for (const domain of cat.domains) {
        const d = domain.replace(/^www\./, '');
        if (host === d || host.endsWith('.' + d)) return { key: k, ...cat };
      }
    }
    return { key: 'unknown', mochi: 4, label: 'unknown' };
  } catch {
    return null;
  }
}

async function save(updates) {
  return new Promise((resolve) => chrome.storage.local.set(updates, resolve));
}

async function loadstate() {
  return new Promise((resolve) => {
    chrome.storage.local.get(state_keys, (data) => {
      const now = Date.now();
      const today = new Date().toDateString();
      const blank_stats = { date: today, productive: 0, neutral: 0, distraction: 0, mochiEarned: 0 };
      resolve({
        mochiCount: data.mochiCount ?? 10,
        catMood: data.catMood ?? 'happy',
        catHunger: data.catHunger ?? 80,
        lastFedTime: data.lastFedTime ?? now,
        lastActiveTime: data.lastActiveTime ?? now,
        todayStats: data.todayStats?.date === today ? data.todayStats : blank_stats,
        activeTabUrl: data.activeTabUrl ?? null,
        activeTabStart: data.activeTabStart ?? now,
        totalMochiEarned: data.totalMochiEarned ?? 0,
        streakDays: data.streakDays ?? 1,
        lastActiveDate: data.lastActiveDate ?? today,
      });
    });
  });
}

async function hunger_tick() {
  const s = await loadstate();
  let { mochiCount, catHunger } = s;

  if (mochiCount > 0) {
    const ate = Math.min(mochiCount, 18);
    mochiCount -= ate;
    catHunger = Math.min(100, catHunger + ate);
  } else {
    catHunger = Math.max(0, catHunger - 25);
  }

  const mood = calcmood(catHunger, s.todayStats);
  await save({
    mochiCount,
    catHunger,
    catMood: mood,
    lastFedTime: mochiCount > 0 ? Date.now() : s.lastFedTime,
  });
}

async function give_mochi() {
  const s = await loadstate();
  const now = Date.now();

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tabs.length) return;

  const url = tabs[0].url;
  const cat = urlcat(url);
  if (!cat) return;

  const gain = cat.mochi;
  const newamt = Math.min(s.mochiCount + gain, max_mochi);

  const stats = { ...s.todayStats };
  stats.mochiEarned = (stats.mochiEarned || 0) + gain;
  if (cat.key === 'productive') stats.productive += mochi_interval;
  else if (cat.key === "neutral") stats.neutral += mochi_interval;
  else if (cat.key === 'distraction') stats.distraction += mochi_interval;

  const today = new Date().toDateString();
  let { streakDays, lastActiveDate } = s;

  if (lastActiveDate !== today) {
    const yday = new Date();
    yday.setDate(yday.getDate() - 1);
    streakDays = lastActiveDate === yday.toDateString() ? streakDays + 1 : 1;
    lastActiveDate = today;
  }

  await save({
    mochiCount: newamt,
    todayStats: stats,
    totalMochiEarned: (s.totalMochiEarned || 0) + gain,
    streakDays,
    lastActiveDate,
    activeTabUrl: url,
    activeTabStart: now,
  });
}

async function settab(url) {
  const s = await loadstate();
  const now = Date.now();

  if (s.activeTabUrl && s.activeTabStart) {
    const mins = (now - s.activeTabStart) / 60000;
    const cat = urlcat(s.activeTabUrl);

    if (cat && mins > 0) {
      const stats = { ...s.todayStats };
      if (cat.key === 'productive') stats.productive += mins;
      else if (cat.key === "neutral") stats.neutral += mins;
      else if (cat.key === 'distraction') stats.distraction += mins;

      await save({ todayStats: stats, activeTabUrl: url, activeTabStart: now });
      return;
    }
  }

  await save({ activeTabUrl: url, activeTabStart: now, lastActiveTime: now });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create('awardMochi', { periodInMinutes: mochi_interval });
  chrome.alarms.create('updateHunger', { periodInMinutes: hunger_interval });

  const s = await loadstate();
  await save({ mochiCount: s.mochiCount, catMood: s.catMood, catHunger: s.catHunger, lastFedTime: s.lastFedTime });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'awardMochi') give_mochi();
  if (alarm.name === 'updateHunger') hunger_tick();
});

chrome.tabs.onActivated.addListener(async (info) => {
  const tab = await chrome.tabs.get(info.tabId);
  if (tab.url) await settab(tab.url);
});

chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (change.status === 'complete' && tab.active && tab.url) await settab(tab.url);
});

chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (msg.type === 'GET_STATE') {
    loadstate().then(send);
    return true;
  }
  if (msg.type === 'GET_CURRENT_SITE') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length && tabs[0].url) {
        send({ url: tabs[0].url, category: urlcat(tabs[0].url) });
      } else {
        send({ url: null, category: null });
      }
    });
    return true;
  }
  if (msg.type === "FORCE_HUNGER_UPDATE") {
    hunger_tick().then(() => loadstate().then(send));
    return true;
  }
});
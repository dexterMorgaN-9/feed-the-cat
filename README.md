# Feed the Cat - Browser Extension

A productivity companion cat that gets happy when you work hard and sad when you slack off.


## How to Install (Chrome / Brave / Edge)

1. **Download and unzip** this folder somewhere on your computer (e.g. `Desktop/feed-the-cat`)

2. Open your browser and go to:
   - Chrome: `chrome://extensions`
   - Brave: `brave://extensions`
   - Edge: `edge://extensions`

3. **Enable Developer Mode** (toggle in the top-right corner)

4. Click **"Load unpacked"**

5. Select the `mochi-cat` folder

6. The extension will appear in your toolbar. Click the puzzle piece icon and pin feed the cat.


# How Mochi Works

Site Type-->Examples-->Mochi per 15 min 
Productive-->GitHub, Notion, Figma, Stack Overflow, Docs-->+7  
Neutral-->Amazon, Booking, Zomato, Maps-->+5  
Distraction-->YouTube, Instagram, TikTok, Reddit-->+3  

- Every **15 minutes** on a site, you earn mochi
- Your cat gets **hungry every 30 minutes** and eats your mochi
- If you have mochi → cat eats → cat gets happy
- If you have no mochi → cat gets sad 
- Work productively to keep her **thriving** 

##  Cat Moods

Mood--->Condition 
-------------------------------------------
Thriving--->Well fed + lots of productive time
Happy--->Regularly fed 
Neutral---> Getting by 
Sad--->Hungry, been slacking
Starving--->Hasn't eaten in a long time!
---------------------------------------------
##  File Structure

# feed-the-cat/
manifest.json      ← Extension config
background.js      ← Time tracking + mochi logic
popup.html         ← Popup UI structure
popup.css          ← All the pink cuteness
popup.js           ← UI rendering + cat SVGs
icons/             ← Extension icons (replace with your art!)
---icon16.png
---icon32.png
---icon48.png
---icon128.png


Made with for focus, fun, and one very hungry cat.
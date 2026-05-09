# Feed The Cat 

A chrome extension that turns your browsing into cat food. work  → cat happy. go off → cat sad. it's that simple.

---

## What It Does

There's a  cat living in your browser.

every 10 minutes, the extension checks what site you are on and drops some mochi (the currency) productive sites give more mochi, distractions give less. The cat automatically eats over time if you keep working, she stays fed and happy. if you spend the whole day on instagram, she gets sad and her mood changes.

---

## The Mochi System

| site type | example sites | mochi earned |
|---|---|---|
| productive | github, notion, docs, figma, leetcode... | +7 /10min |
| neutral | amazon, zomato, maps, booking... | +5 /10min |
| distraction | youtube, twitter, reddit, netflix... | +3 /10min |
| unknown | anything else | +4 /10min |

the cat eats automatically every 30 minutes. if you have mochi, she eats and gets fuller. if you don't have any (mochi = 0), she starts losing fullness fast.

---

## Cat Moods

Her mood depends on two things — how full she is, and what kind of browsing you've been doing today.

- **thriving** — well fed + mostly productive. She's eating good.
- **happy** — fed and doing okay.
- **neutral** — just vibing. not great, not terrible.
- **sad** — hungry or too much scrolling.
- **starving** — you abandoned her. Fullness hit rock bottom.

---

## The Popup

open it anytime to see:

- the cat (animated, judging you)
- your mochi count
- her fullness bar (5 boxes)
- today's stats — focused time, neutral time, and scroll time
- what site you're on right now and what category it is

---

## Install (dev mode)

1. download or clone this repo
2. go to `chrome://extensions`
3. turn on developer mode (toggle, top right)
4. click "load unpacked" and select the folder
5. pin the extension, open the popup, and all done

---

## Notes

- stats reset daily
- mochi caps at 999 (you can't hoard forever)
- the cat's fullness meter starts at 80% on a fresh install so she isn't immediately dying 

---
**If you found this helpful please give this a Star**
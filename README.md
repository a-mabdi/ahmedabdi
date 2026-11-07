# The Somaliland Age (Cloudflare Pages edition)

A news website you edit from the website itself. **Every change saves instantly** - no save buttons, no folders, no uploading files by hand.

**Version 2.0 - what changed**

- **Clean web addresses.** Stories now live at `yourdomain/world/the-headline-words` (category, then the headline). Categories are `yourdomain/world`, pages are `yourdomain/about`. See *Web addresses* below.
- **Old links keep working.** Links made earlier (`#/a/...`, `#/c/...`, `#/p/...`, in the ticker, menu, footer or inside articles) are understood and upgraded automatically, and a story whose headline you change keeps answering at its old address too.
- **Shorter header** on computers and phones, **social icons** in the header (computers) and next to the Menu button (phones), **edge-to-edge content on phones**, and a **much shorter footer on phones**.
- The site code version is shown in the dashboard under **Account > About this site**, and at the top of `yourdomain/script.js` - use it to check that an upload really went live.

## Web addresses

| What | Online / local server | Double-clicking `index.html` |
|---|---|---|
| Home | `yourdomain/` | `index.html` |
| A story | `yourdomain/world/the-headline-words` | `index.html#/world/the-headline-words` |
| A category | `yourdomain/world` | `index.html#/world` |
| A page | `yourdomain/about` (sub-page: `yourdomain/about/our-team`) | `index.html#/about` |
| Search | `yourdomain/search/words` | `index.html#/search/words` |
| Log in | `yourdomain/login` (or `/admin`) | the Login button |

- The **story part** of the address is made from the headline when you create the story. You can see it (and copy the full address) in **Article Editor > Web address of this story**. It follows the headline automatically while you are editing; if you type your own, it stays as you typed it. Spaces and symbols become hyphens, everything is lower case.
- **Changing a headline never breaks links.** The earlier address is remembered and keeps opening the same story (and is quietly replaced by the new one in the browser bar).
- The **category part** comes from the story's Category. If it is wrong or missing in a typed link, the site still finds the story by its headline words and corrects the address.
- Two stories with the same headline get `-2`, `-3`... at the end.
- A page whose name matches a category (a page called "World", say) gets `-page` added so the two never clash.
- If a link points to something that no longer exists, visitors see a friendly "We can't find that page" screen with suggested stories instead of an empty page.
- Pasting a story address into WhatsApp, Facebook, X etc. shows the headline, summary and picture (done by `_worker.js` on Cloudflare).
- Double-click mode has no web server, so it can't use `/world/headline` addresses; it shows the same address after a `#`. Both are the same site.

## Quick start: edit with no server at all

1. Double-click `public/index.html`.
2. Click **Login** (bottom right). First time: `admin` / `admin123`.
3. Edit anything. Changes save instantly **in your browser** and are still there next time you open the site.

This "offline mode" needs nothing running. The one limit: with no server there is nowhere for the public website to receive your edits, so they stay on your device. To have edits go live for every visitor, use the Cloudflare setup below (nothing for you to run) or the local server.

```
local-server.js / START-LOCAL-EDITING.bat   run the site on your own PC (instant saving)
public/                                     THE WEBSITE - this whole folder is what Cloudflare Pages publishes
  index.html, styles.css, script.js         the site
  admin.js                                  the dashboard (only loaded after you log in)
  _worker.js, _routes.json                  the Cloudflare backend (instant saving online)
  data/content.js                           the starting content
  images/  videos/  fonts/                  pictures, videos and fonts - new uploads are added here
```

## On your own PC

1. Install Node.js (the LTS version) from https://nodejs.org if you don't have it.
2. Double-click **START-LOCAL-EDITING.bat**. Your site opens at http://localhost:3000. Keep the black window open while you edit.
3. Click **Login** (bottom right). First time: `admin` / `admin123`. You'll be reminded to change it in **Account**.
4. Edit anything. A status line in the dashboard shows "All changes saved ✓". Changes are written straight into `public/data/content.js` and `public/images/`.

## Online with GitHub + Cloudflare Pages (one-time setup, then it just works)

1. **Put this repository on GitHub** (upload these files to a new repository, keeping the `public` folder as it is).
2. **Create storage:** Cloudflare dashboard > Storage & databases > KV > Create a namespace (any name, e.g. `somaliland-age`).
3. **Connect the repository:** Workers & Pages > Create > Pages > Connect to Git > choose this repository. Use these settings: Framework preset **None**, Build command **(leave empty)**, Build output directory **`public`**. Save and Deploy.
4. **Connect the storage:** your project > Settings > Bindings > Add > KV namespace. Variable name must be exactly `SITE_KV`.
5. **Set your first password:** Settings > Variables and secrets > Add a secret `ADMIN_PASSWORD` (and optionally `ADMIN_USER`, default `admin`).
6. **Deploy again** so steps 4 and 5 take effect (Deployments > latest deployment > Retry deployment, or push any small change to GitHub).
7. Go to `https://yourdomain/admin`, log in, then change your password in **Account**. After that the secret is no longer needed.

From then on, every edit on the live site is saved immediately for all visitors (in Cloudflare KV, not in GitHub). Cloudflare's KV storage can take up to about a minute to reach every region; you see your edits instantly.

**How GitHub and the online dashboard work together**

- Until you edit something online, the site shows `public/data/content.js` from GitHub.
- Edits made in the dashboard are saved on Cloudflare and shown instantly to everyone.
- **If you change `public/data/content.js` in GitHub**, the next visit switches the website to that version automatically. The online version it replaces is kept as a backup.
- If you only change code (design, fonts, scripts) the online edits are left alone.
- In the dashboard, **Account > Content & GitHub** lets you download the online content as `content.js` (to upload to GitHub), replace the online content with the GitHub version, or restore the previous online version.

**Updating the site code later:** push the new files to GitHub and Cloudflare redeploys automatically. Your online edits are not overwritten, because they live in KV; `public/data/content.js` is only the starting content for a brand-new site.

**When you install a new version of this package:** copy **everything inside `public/`** into the `public/` folder of your repository, **except `public/data/content.js`** (and leave your own pictures in `public/images/` alone). The files that must be replaced together are `index.html`, `script.js`, `admin.js`, `styles.css`, `_worker.js` and `_routes.json` - if only some of them are updated, the site can behave strangely (for example, old header or links). Do **not** upload this package's `content.js` over yours: it holds the sample stories, and a changed `content.js` replaces everything you edited online (the earlier online version is kept as a backup under Account > Content & GitHub).

**Check that the new version is live:** open `https://yourdomain/script.js` - the first line says `Code version 2.0.8`. Or log in and look at Account > About this site. If you still see an older version, the deployment has not finished or the upload went to the wrong folder (the files must be inside `public/`, next to `index.html`); check Workers & Pages > your project > Deployments, then refresh with Ctrl+F5.

**No GitHub?** You can still drag the **contents of the `public` folder** into Workers & Pages > Create > Pages > Upload assets (so `index.html` and `_worker.js` are at the top level), then do steps 4 to 7.

(Cloudflare menu names can differ slightly, but the steps are the same.)

## Saving straight into content.js (no .bat file needed)

Use **Google Chrome or Microsoft Edge** on a computer.

1. Open `index.html` (double-click it), click **Login** and log in.
2. Click the brown button **📁 Connect site folder (one-time)** at the bottom right.
3. In the window that opens, choose the website folder (the one that contains `index.html` and the `data` folder; it is called `public` in the GitHub version) and allow editing.
4. The button turns green: **Saving into content.js ✓**. From now on every edit is written straight into `data/content.js`, and every uploaded picture goes into the `images` folder.

Notes:
- The first time, your edits so far are written into `content.js` too, and the old file is kept as `data/content.previous.js`.
- If Chrome says it cannot open the folder, move the website folder somewhere else (not directly inside Downloads, Desktop or Documents) and try again.
- After you reopen the page, the button may say **Click to reconnect saving**. Click it and allow access again.
- Firefox and Safari cannot do this. There, use **Account > Download backup (content.js)**.
- To put your changes online, upload the changed `content.js` and the `images` folder to GitHub.

## Header, social icons and phones

- The top strip (date, live news, links, search) is slim, and the header band is kept short (the header picture is cropped to fit, never stretched). **Social media icons** (TikTok, YouTube, Facebook, X, Instagram) sit on the right of the header on computers. Set your own links in **Header & Site > Social media icons** (an empty link opens that network's home page).
- On phones the top strip is replaced by a compact header: the date in the corner, then a bar with **Menu**, the social icons and a **search icon** that opens a search box when tapped. Newsletter / Watch Live links move into the Menu list.
- On phones images have sharp corners and the content runs almost to the screen edges.

## The Login button

The site decides automatically: the Login button is **shown on your PC** (localhost, 192.168.x.x, file) and **hidden on the live website**. You can always reach the login on the live site with any of these: go to `yourdomain/login` (`yourdomain/admin` works too), or click the copyright line in the footer 5 times quickly. (The old `/#/login` still works.) Change this under **Header & Site > Login Button** (auto / show / hide). When you're logged in you'll see an Admin button instead.

## Images

- All images are JPG or PNG. Uploaded pictures are saved into `images/`.
- Anywhere you see an image (articles, header), use **Upload image** or **Edit / resize**. The editor lets you crop, rotate and resize. The aspect ratio is always kept, so pictures are never squashed or stretched; resizing uses high-quality smoothing so they stay sharp. The **Images** tab lists every picture on the site.
- Pictures on the site are always cropped to fit (never distorted).

## Logo

Dashboard > **Header & Site**: **Logo** (Upload / Edit / Remove), **Logo Position** (left, center, right or hidden) and **Logo Size**. The logo sits on top of the header picture, so the whole header scales down together on phones. It is also used as the browser tab icon. Use a PNG for a transparent background (PNG is kept as PNG automatically for logos).

## Pages and sub-pages

Dashboard > **Pages**. **+ New page** creates a page; **+ Sub-page** on any main page creates a page under it. Each page has a title, a parent (choose "None" for a main page), a rich-text body and **Show in the main menu**. Pages shown in the menu appear after your category links; sub-pages that are also shown in the menu appear in a dropdown under their parent (on phones they sit indented in the hamburger menu). Use the arrows to reorder pages. Deleting a page also deletes its sub-pages (you are asked first). A page lives at `/its-address` (a sub-page at `/parent-address/its-address`; in double-click mode after a `#`), and you can link to it from the footer or menu.

## Visual editing (click anywhere)

After you log in, a **Visual editing: ON** button appears bottom-right. While it is on:
- **Click any empty space** (the grey margins, the dotted "Add here" strips between sections, or the strip above the footer) and a menu pops up: **Text, Image, 2/3/4 columns, Add a column to the block above, Bento (article section), Button, Video, Divider, Spacer, Anchor point, New article, New page, Open dashboard**. Home, articles and pages all accept blocks.
- **Hover a block** to get its toolbar: Edit, move up/down, duplicate, delete. Editing opens a side drawer and the page updates live.
- **Click the header title or tagline** to show an edit bar: **Edit title & tagline** opens the side drawer (text, font, weight, italic, underline, case, spacing, shadow, outline, glow, background colour), **Header settings** opens the dashboard page. Nothing becomes editable until you choose one.

## Links and anchors

- Highlight any text (in an article, page or block) and a small popup appears with **Bold, Italic, Underline, Link, Anchor and Remove link**. The same **Link**, **Anchor** and **Unlink** buttons are in the editing toolbar.
- **Link** can point to: a web address, a page, an article, a category, the home page, an anchor on this page, an anchor on another page or article, an email address or a phone number, with an "open in a new tab" option.
- **Anchor** names a spot (the highlighted text, or the current paragraph, or a block's Anchor field). Link to it with *Link > Anchor*.
- Every address field in the dashboard (menu, footer, ticker, buttons, image links) has a **Choose link...** button that opens the same picker.

## Videos

- **▶ Video** in the editing toolbar, or a Video block, accepts a **YouTube or Vimeo link** or **an upload from your device** (MP4/WebM/MOV/OGG).
- Size options: width (10-100%, with Small/Medium/Large/Full buttons), alignment, shape (16:9, 4:3, 3:2, 1:1, 21:9, 9:16), controls, autoplay (muted) and loop. Click a video in the editor to change them.
- Uploaded videos are limited to about 24 MB on Cloudflare (use a YouTube link for longer ones) and about 12 MB in offline mode.

## The masthead (header name)

The header is a newspaper-style masthead: your site name in **Chomsky** (the original blackletter font with its ornate capitals, files in `public/fonts/`), centred, with a double rule and the tagline "Independent news, broadcasting & analysis." underneath. Edit them by clicking the title or tagline on the page, or in **Header & Site**. **Site name font** (a dropdown; *Chomsky Custom* is an optional variant with plainer capital A, S and T), weight, italic, underline, letter case, letter spacing and the Shadow / Outline / Glow / Background colour effects only change the site name; **Website font** changes all the text on the site. You can also upload your own font under **Header Font File**. Set **Header Style** to *banner* to use a picture header instead. Chomsky is licensed under the SIL Open Font License (see `public/fonts/Chomsky-LICENSE.txt`).

## Reset your login (back to admin / admin123)

- **Offline mode (double-clicking index.html):** on the login box click "Forgot your login? Reset to admin / admin123".
- **Your PC with the local server:** double-click **RESET-LOGIN.bat**, then start the site again.
- **Cloudflare:** in Workers & Pages > Storage > KV, open your namespace and delete the key `auth` (and, if you set one, the `ADMIN_PASSWORD` secret). The next login with `admin` / `admin123` works again. **Change the password straight away**, because the site is public.

## If your site still shows old content

Content that you saved earlier (in your browser, on the local server, or in Cloudflare) is kept. The first time the new version loads it updates the site name to "The Somaliland Age", restores the blue header with the blackletter title and puts the lower sections back (Trending Now with 6, Editors' Picks with 4, More Headlines with 9). After that, everything is yours to change.

## Changing your login

Dashboard > **Account**. Enter your current password, then a new username and/or password (at least 8 characters). You stay logged in; old sessions stop working.

**Forgot it on your PC?** Delete the `local-data` folder and restart; it goes back to `admin` / `admin123`. **Forgot it on Cloudflare?** In KV, delete the key `auth`, then log in with your `ADMIN_PASSWORD` secret again.

## Good to know

- Offline mode keeps its own login and edits inside that browser. In offline mode the **Account** tab has a **Download backup** button that saves your edits as `content.js`.
- Your password is stored only as a salted, slow hash on the server, never in the public files.
- The local server only accepts connections from your own PC. To allow your network, start it with the environment variable `HOST=0.0.0.0`.

## v2.0.3 notes

- Social icons are now picture files in `public/images/`: `tiktok.png`, `youtube.png`, `facebook.png`, `x.png`, `instagram.png` (white, transparent background). Replace a file with one of the same name to change an icon.
- The header is no longer one big link (no hand cursor); click the logo to go home. The title and tagline only show a blue outline when you hover them in Visual editing.
- Phones: the top follows the approved screenshot, and pictures and text sit even closer to the screen edges.

## v2.0.4 - preview sizes

While logged in, press **📱 Preview sizes** (bottom right of the site, or in the dashboard's left menu). Pick Phone, Small phone, Tablet, Laptop or Desktop to see the site at that real width, rotate it, and refresh. It shows your latest saved changes, so you can check how everything looks before you upload anything to GitHub.

## v2.0.5

- Phones and tablets: the header, the menu with the social icons, and the red news bar all stay fixed at the top while you scroll.
- Phones: slightly larger site name, and screen-edge gaps a little bigger than 2.0.4 (2px outside, 8px inside the boxes).
- Footer: the first column's name now uses the same lettering as the top of the website (Chomsky). In **Dashboard > Footer > Columns > first column** you can change the **Name font** and **Name size**, and fill in **Contact details** (one per line - emails, phone numbers and web addresses become clickable). They appear under the name. To put the contact lines directly under the name, empty the small "Text" box above them.

## v2.0.6

Footer: the first column now has separate **Email**, **Phone** and **Address** boxes (Dashboard > Footer > first column), shown under the name. While you are logged in with Visual editing ON, an empty dashed space appears under the name - click it to fill these in.

## v2.0.7

The social icons are colour-coded again (TikTok, YouTube, Facebook, X, Instagram), each on a white disc so they show on the dark blue bar. The picture files are in `public/images/` (`tiktok.png`, `youtube.png`, `facebook.png`, `x.png`, `instagram.png`); replace one with a file of the same name to change it.

## v2.0.8

Social icons use your own colour pictures with a transparent background (no white disc). TikTok and X are black, so they get a very thin white glow to stay visible on the dark blue bar (see `.soc a.si-tiktok img` at the end of `styles.css` to remove it).

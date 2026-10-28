# My Study Notes website

A static site (no backend). Everything you see comes from **`data/notes.js`** – edit that file and drop images into `notes/`. You never need to touch the HTML/CSS/JS.

## Folder structure
```
index.html
css/style.css
js/app.js
data/notes.js          <- the ONLY file you edit regularly
notes/
  class11/physics/ch01/  <- put images & PDFs for that chapter here
  class11/chemistry/ch01/
  class12/biology/ch02/
```
The path is always `notes/<class id>/<subject id>/<chapter id>/<file>`.

## Add an image
1. Copy `page1.jpg` into `notes/class11/physics/ch01/`.
2. In `data/notes.js`, find that chapter and list the file name (order = viewing order):
```json
{ "id": "ch01", "name": "Units and Measurements",
  "images": ["page1.jpg", "page2.jpg"], "files": [] }
```

## Add a PDF or other study material
Put the file in the chapter folder, then add it to `files`:
```json
"files": [ { "name": "Formula sheet", "file": "formulas.pdf" } ]
```

## Add a chapter
Create the folder `notes/class11/physics/ch03/`, then add inside that subject's `"chapters"` list (don't forget the comma between items):
```json
{ "id": "ch03", "name": "Motion in a Straight Line", "images": [], "files": [] }
```

## Add a subject (e.g. Maths)
Inside a class's `"subjects"` list:
```json
{ "id": "maths", "name": "Maths", "icon": "📐", "color": "#8e44ad", "chapters": [] }
```
Then create `notes/class11/maths/ch01/` for its files. `icon` and `color` are optional.

## Add a class (e.g. Class 10)
Add to the top-level `"classes"` list:
```json
{ "id": "class10", "name": "Class 10", "subjects": [ { "id": "science", "name": "Science", "chapters": [] } ] }
```

## Rules to avoid problems
- `id` values: lowercase, no spaces (`ch01`, `class11`). They must match the **folder names exactly** – GitHub is case-sensitive (`Page1.JPG` ≠ `page1.jpg`).
- `name` is what you see on screen and can contain spaces.
- Keep the first line `window.NOTES_DATA = {` and the last line `};` untouched. Put a comma between items, none after the last one. If the site shows an error, you probably missed a comma or quote.
- Tip: resize photos to ~1600px wide (JPG/WebP) so pages load fast on mobile.

## Upload to GitHub and turn on GitHub Pages
1. Create a free account at github.com → **New repository** → name it (e.g. `study-notes`), set it **Public**, click **Create**.
2. On the repo page click **uploading an existing file**, drag in **all files and folders from this project** (not the zip itself), then **Commit changes**. (Or use GitHub Desktop / `git push`.)
3. Go to **Settings → Pages**. Under **Build and deployment**, set Source to **Deploy from a branch**, Branch **main**, folder **/ (root)**, then **Save**.
4. After ~1 minute your site is live at `https://<your-username>.github.io/study-notes/`.
5. To update later: open the repo → **Add file → Upload files** (into the right `notes/...` folder) and edit `data/notes.js` with the pencil icon → **Commit**. The site refreshes in a minute.

Note: a Public repo means your notes are public. GitHub Pages on private repos needs a paid plan.

## Open it on your computer or phone (no server needed)
Just open `index.html` in any browser, even straight from a folder on Android. Your notes list lives in `data/notes.js` (a normal script file), so nothing needs a web server. Keep the folder structure unchanged.

## Features
Dark/light mode, search, breadcrumbs, prev/next image (buttons, swipe, ← → keys), zoom (buttons, pinch, double-tap, mouse wheel), fullscreen, previous/next chapter, and "mark as complete" progress (saved in your browser).

## Browser support
Tested for: current Chrome, Edge, Firefox, Safari (iPhone/iPad/Mac) and Android browsers. Layout adapts from 320px phones to wide desktop screens. Fullscreen uses the browser's fullscreen mode, or a full-window viewer on iPhone where Safari doesn't allow it. Progress ticks are saved per browser (they don't sync between devices).

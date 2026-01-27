# Claude Resume Document - John Fashion

Use this document to quickly understand and continue work on this project.

## Project Overview

**Name**: John Fashion (johnfashon.com)
**Purpose**: Personal fashion diary - 14 weeks documenting London study abroad
**Concept**: London bus route with 14 stops, each stop = one week

## Architecture

### Content System
- **Single source of truth**: `content.json`
- All 14 weeks pre-defined with `status: "draft"` or `status: "published"`
- Each week has: `weekNumber`, `slug`, `stopName`, `title`, `dateDisplay`, `essay`, `featuredImage`, `images[]`

### Files to Know
| File | Purpose |
|------|---------|
| `content.json` | ALL content - edit this for updates |
| `index.html` | Homepage with bus route |
| `week.html` | Single template for all week pages |
| `css/main.css` | All styling (variables at top) |
| `js/content-loader.js` | Fetches JSON |
| `js/bus-route.js` | Renders homepage stops |
| `js/week-page.js` | Renders week content |

### URL Structure
- Homepage: `/`
- Week pages: `/week.html?week=week-1` or `/week/week-1` (via redirect)

## How to Update Content

### Adding a New Week
User provides: photos, essay text, week title, stop name

Claude does:
1. Add images to `images/week-X/` folder
2. Update `content.json`:
   - Change `status` from `"draft"` to `"published"`
   - Set `stopName` (user's choice)
   - Set `title`
   - Set `essay` (use `\n\n` for paragraph breaks)
   - Set `featuredImage.src`
   - Add all images to `images[]` array
3. Commit with message: `[Content] Add Week X: "Title"`
4. Push to GitHub

### Editing Existing Content
Just edit the relevant fields in `content.json` and push.

### Adding Decorative Images
1. Add image to `images/decorative/`
2. Reference in HTML or CSS as needed

## Deployment

- **Hosting**: Netlify (auto-deploys from GitHub)
- **Domain**: johnfashon.com (Cloudflare)
- **Repo**: Private GitHub repository

## Design Tokens (CSS Variables)

```css
--color-background: #faf8f5;    /* Cream */
--color-bus: #CE1126;           /* London bus red */
--color-accent: #722F37;        /* Burgundy */
--color-stop-active: #722F37;
--color-stop-inactive: #c0c0c0;
```

## Common Tasks

### Change accent color
Edit `css/main.css` line ~10: `--color-accent: #NEW_COLOR;`

### Add new stop name
Edit `content.json` > weeks > [week] > `stopName`

### Fix broken image
Check path in `content.json` matches actual file in `images/` folder

### Rollback bad deploy
Netlify dashboard > Deploys > Click previous > "Publish deploy"

## Security Notes
- Repository is private
- Only John's GitHub credentials can push
- Claude edits via John's authenticated terminal
- 2FA recommended on GitHub and Netlify

---

Last updated: 2026-01-27
Project created by Claude for John Stanley

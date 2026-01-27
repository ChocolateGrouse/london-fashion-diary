# John Fashion - London Style Journey

A personal fashion diary website documenting 14 weeks in London.

**Live site**: https://johnfashon.com

## How This Site Works

- **Content**: All content lives in `content.json`
- **Images**: Stored in `images/week-X/` folders
- **Updates**: Claude helps update content weekly
- **Hosting**: Automatically deployed via Netlify

## Weekly Update Process

1. Share photos + essay with Claude
2. Claude updates `content.json` and adds images
3. Claude pushes to GitHub
4. Site auto-deploys (~60 seconds)

## Making Changes Yourself

### Quick text edits
1. Go to GitHub.com > this repository
2. Click `content.json`
3. Click pencil icon to edit
4. Make changes, commit
5. Site updates automatically

### Style changes
Edit `css/main.css` - all colors are CSS variables at the top:
```css
--color-accent: #722F37;  /* Change to any color */
--color-bus: #CE1126;     /* London bus red */
```

## File Structure

```
├── index.html          # Homepage with bus route
├── week.html           # Week page template
├── content.json        # ALL CONTENT HERE
├── css/main.css        # Styles
├── js/
│   ├── content-loader.js
│   ├── bus-route.js
│   └── week-page.js
└── images/
    └── week-X/         # Photos for each week
```

## If Something Breaks

**Quick fix (30 seconds)**:
1. Go to app.netlify.com
2. Click "Deploys"
3. Click a previous working deploy
4. Click "Publish deploy"

---

Last updated: January 2026

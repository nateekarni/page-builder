# Admin User Guide — Aglow Portfolio Builder

## Getting Started

1. Navigate to `/admin/login` and sign in with your credentials
2. You will see the Dashboard with stats, recent activity, and quick actions

---

## Creating a Page

1. Click **"หน้าเว็บ"** in the sidebar
2. Click **"+ New Page"** button
3. Enter page title and slug
4. The **Page Builder** opens with a 3-panel layout:
   - **Left Sidebar**: Block palette, page tree, layers
   - **Center Canvas**: Drag & drop area
   - **Right Panel**: Block properties, styles, advanced

### Adding Blocks

- Drag blocks from the sidebar palette onto the canvas
- Available types: Container, Columns, Text, Image, Video, Hero, CTA, Spacer, Divider, Accordion, Tabs, Icon Box, Testimonial, Form, Map, Code, Query Loop

### Editing Block Content

- Click a block to select it
- Edit content in the Properties Panel (right side)
- Switch between Content / Style / Advanced tabs

### Responsive Design

- Use the viewport buttons in the toolbar: 🖥️ Desktop / 💻 Tablet / 📱 Mobile
- Style changes are saved per viewport
- Toggle block visibility per breakpoint

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |

---

## Publishing

- Click **"เผยแพร่"** to publish immediately
- Or use Schedule to set a future publish date
- Published pages are accessible at `/{slug}`

---

## Media Manager

1. Click **"สื่อ"** in the sidebar
2. Upload images, videos, or documents (max 10MB)
3. Images are automatically compressed to WebP
4. Use the Media Picker inside the editor to select images for blocks

---

## SEO

- Open the SEO panel in the editor for per-page settings
- Set custom title (max 60 chars) and meta description (max 160 chars)
- Preview how the page looks in Google search results (SERP preview)
- Use the AI Assistant for SEO suggestions

---

## AI Assistant

- Click the AI button in the editor toolbar
- **Generate**: Write content from a prompt
- **SEO**: Analyze page content for title/description suggestions
- **Alt Text**: Auto-generate image descriptions

---

## A/B Testing

1. Go to `/admin/ab-tests`
2. Create a test: select a page, name the test
3. Edit variant B content
4. Set traffic split and start the test
5. View results to determine the winner

---

## Export / Import

- **Export**: Download page content as JSON for backup
- **Import**: Upload JSON to create a new page (always imported as draft)

---

## Settings

- **Site Identity**: Site name, logo, tagline
- **Social Links**: Add/remove social media links
- **Design Tokens**: Colors, fonts, spacing (changes apply site-wide)

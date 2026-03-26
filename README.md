# 🔍 Anime Scene Finder

Reverse image search application that identifies anime from screenshots. Upload an image and discover which anime, episode, and exact moment it's from using the trace.moe API.

## Features

- **Image Upload** — Drag and drop or click to upload anime screenshots (JPG, PNG, GIF, WEBP, or video)
- **URL Search** — Paste a direct image URL to search
- **Similarity Score** — Results show percentage match confidence (90%+ typically means correct results)
- **Episode Information** — Get exact anime, season, episode, and timestamp
- **Anilist Integration** — Fetch detailed anime info including title (English, Romaji, Native), status, and more
- **Advanced Options** — Cut black borders for better accuracy, filter results by Anilist ID
- **API Key Support** — Optional API key for sponsors with higher quotas
- **Quota Tracking** — View your current usage and remaining quota
- **Multiple Results** — Get multiple matches ranked by similarity
- **Preview Thumbnails** — See preview of uploaded image before searching

## How It Works

1. **Choose Upload Method:**
   - **Upload File:** Drag and drop or click the drop zone to select a local image/video
   - **URL:** Paste a direct link to an image

2. **Configure Options:**
   - **Cut Black Borders** — Automatically crop borders for better matching
   - **Include Anilist Info** — Get detailed anime information alongside results
   - **Filter by Anilist ID** — Narrow results to a specific anime (optional)

3. **Search:**
   - Click 🔎 **Buscar Anime** to start the reverse image search
   - The app analyzes the image and queries the trace.moe database

4. **View Results:**
   - Results sorted by similarity score
   - Green badge for high confidence matches (90%+)
   - Shows anime title, episode number, and timestamp
   - Click timestamps to watch on available platforms

## Result Information

Each match displays:
- **Similarity Score** — Percentage match (higher = better)
- **Anime Title** — English and Romaji titles
- **Episode** — Episode number and segment
- **Timestamp** — Exact moment in the episode (from/to times)
- **Anilist Info** — Full anime details if enabled

## Advanced Features

- **API Key Management** — For trace.moe sponsors with higher quotas
- **Quota Modal** — View your remaining searches and usage statistics
- **Supported Formats** — Images (JPG, PNG, GIF, WEBP) and video files (max 25MB)
- **Image Preview** — Shows thumbnail of selected file before searching

## Technologies Used

- **HTML** — Dynamic tabbed interface and result cards
- **CSS** — Modern card-based layout with responsive design
- **JavaScript (ES6+)** — State management, async API calls, file handling, DOM manipulation

## APIs Used

- **trace.moe API** — `https://api.trace.moe/search` — Reverse image search for anime
- **Anilist API** — Optional detailed anime information and titles

## Quota Information

- **Free Users:** Limited searches per month
- **Sponsors:** Higher quotas available with API key
- **Modal Display:** Click 📊 **Minha Cota** to view current usage

## Error Handling

- Validation for file size (max 25MB)
- Loading animation during search
- Error banners for failed searches
- Helpful hints for improving match accuracy

---

**Find any anime from a screenshot in seconds! 🎬✨**

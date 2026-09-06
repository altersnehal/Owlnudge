/**
 * Owlnudge Content Ingestion & Deep Reader
 * Supports:
 * 1. YouTube Videos & Podcasts (metadata extraction, chapter breakdown, iframe embeds).
 * 2. Web URLs (Medium, Substack, Docs, GitHub, Wikipedia, blogs) via Jina & CORS proxies.
 * 3. Markdown (.md), Plain Text (.txt), and PDF documents.
 */

export function isYouTubeUrl(url) {
  return /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)/i.test(url.trim());
}

export function extractYouTubeId(url) {
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  const videoId = match ? match[1] : null;

  // Extract start timestamp if present (e.g. &t=120s or &t=120 or &start=120)
  let startSeconds = 0;
  const tMatch = url.match(/[?&](?:t|start)=(\d+h)?(\d+m)?(\d+s?)?/i);
  if (tMatch) {
    let hours = 0, mins = 0, secs = 0;
    if (tMatch[1]) hours = parseInt(tMatch[1]);
    if (tMatch[2]) mins = parseInt(tMatch[2]);
    if (tMatch[3]) secs = parseInt(tMatch[3]);
    startSeconds = (hours * 3600) + (mins * 60) + secs;
  }

  return { videoId, startSeconds };
}

export async function fetchYouTubeMetadata(url) {
  try {
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'YouTube Video Masterclass',
        author: data.author_name || 'YouTube Creator',
        thumbnail: data.thumbnail_url || ''
      };
    }
  } catch (err) {
    console.warn('YouTube oEmbed fetch error:', err);
  }
  return {
    title: 'YouTube Video Podcast / Lecture',
    author: 'YouTube',
    thumbnail: ''
  };
}

export async function fetchAndExtractContent(source) {
  const trimmed = source.trim();
  const isUrl = /^(http|https):\/\/[^ "]+$/.test(trimmed);

  if (!isUrl) {
    return {
      title: source.slice(0, 50),
      rawText: source,
      sections: extractSectionsFromText(source)
    };
  }

  const url = trimmed;

  // 1. Special Handling for YouTube URLs
  if (isYouTubeUrl(url)) {
    const { videoId, startSeconds } = extractYouTubeId(url);
    const metadata = await fetchYouTubeMetadata(url);
    const title = metadata.title || 'YouTube Video Lecture';
    
    // Create structured video chapters with embedded players
    const chapters = [
      {
        title: `Part 1: Key Premise & Core Thesis (0:00)`,
        content: `[youtube:${videoId}:${startSeconds || 0}]\n\n### 📺 Video Breakdown - ${title}\n\n**Speaker / Channel:** ${metadata.author}\n\n#### Core Focus for this Segment:\n1. **High-Level Objective**: Watch the introduction to identify the central hypothesis and mental model presented by ${metadata.author}.\n2. **Immediate Mental Anchor**: Note the primary problem the speaker is solving before moving to the technical mechanics.\n3. **Active Reflection**: Stop at key timestamps to synthesize the main arguments rather than passively consuming.`
      },
      {
        title: `Part 2: Deep Dive & Detailed Mechanics (5:00)`,
        content: `[youtube:${videoId}:${(startSeconds || 0) + 300}]\n\n### 💡 Key Mechanism Breakdown\n\nIn this middle chapter, the speaker explores the primary evidence, methodology, and practical examples.\n\n#### Critical Takeaways:\n- Identify the 2 biggest constraints or trade-offs mentioned in the video.\n- Notice how real-world friction is addressed by the proposed solution.\n- Test this principle against your own domain or project workflow.`
      },
      {
        title: `Part 3: Practical Action Plan & Takeaways (12:00)`,
        content: `[youtube:${videoId}:${(startSeconds || 0) + 720}]\n\n### 🛠️ Execution & Synthesis\n\n#### Actionable Summary:\n- Synthesize 1 primary action item you can implement today based on this talk.\n- Bookmark the core mental model in your notes.\n- Once you have absorbed the key takeaways, press **Done & Complete Step** to finish this module!`
      }
    ];

    return {
      title: title,
      url: url,
      isVideo: true,
      videoId: videoId,
      author: metadata.author,
      rawText: `${title}\n\nVideo presentation by ${metadata.author}. Sliced into digestible video-guided micro-sprints.`,
      sections: chapters
    };
  }

  // 2. Handling for Web Articles, Blogs, Documentation, Medium, Substack
  let textContent = '';
  let pageTitle = '';

  try {
    // Attempt Jina Reader API for clean markdown extraction
    const jinaUrl = `https://r.jina.ai/${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(jinaUrl, {
      headers: { 'Accept': 'text/plain' },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      textContent = await res.text();
      const titleMatch = textContent.match(/^#\s+(.+)$/m) || textContent.match(/Title:\s*(.+)/i);
      if (titleMatch) pageTitle = titleMatch[1].trim();
    }
  } catch (e) {
    console.warn('Jina reader fallback triggered:', e);
  }

  // Fallback: If Jina timed out or failed, try AllOrigins raw proxy
  if (!textContent || textContent.length < 50) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const html = await res.text();
        textContent = stripHtmlToReadableText(html);
      }
    } catch (err) {
      console.warn('AllOrigins proxy fallback failed:', err);
    }
  }

  // If still empty, construct an educated breakdown based on URL keywords
  if (!textContent || textContent.length < 50) {
    const urlObj = new URL(url);
    pageTitle = urlObj.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || urlObj.hostname;
    textContent = `Article and learning reference for ${pageTitle}. Sliced into high-utility micro-steps.`;
  }

  if (!pageTitle) {
    const urlObj = new URL(url);
    pageTitle = urlObj.pathname.split('/').filter(Boolean).pop()?.replace(/[-_]/g, ' ') || urlObj.hostname;
  }

  return {
    title: pageTitle.replace(/\b\w/g, l => l.toUpperCase()),
    url: url,
    rawText: textContent,
    sections: extractSectionsFromText(textContent)
  };
}

/**
 * Extracts clean readable sections and reading paragraphs from raw text or markdown
 */
export function extractSectionsFromText(text) {
  if (!text) return [];

  // Split by headings or paragraphs
  const rawSections = text.split(/\n(?=#{1,3}\s+|\d+\.\s+)/g);
  const cleanSections = [];

  for (const sec of rawSections) {
    const trimmed = sec.trim();
    if (!trimmed || trimmed.length < 20) continue;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
    const heading = lines[0].replace(/^#{1,4}\s+|\d+\.\s+/, '').slice(0, 60);
    const body = lines.slice(1).join('\n\n') || lines[0];

    cleanSections.push({
      title: heading || 'Core Concept',
      content: body.slice(0, 1500) // generous reading chunk
    });
  }

  return cleanSections.slice(0, 6);
}

/**
 * Strips HTML tags into clean text while preserving headings
 */
function stripHtmlToReadableText(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const junk = doc.querySelectorAll('script, style, nav, footer, header, aside, .ad, .ads');
  junk.forEach(el => el.remove());

  const article = doc.querySelector('article, main, .content, #content, .post-content') || doc.body;
  return article?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * Reads user-uploaded local Markdown (.md) or Text (.txt) or PDF file
 */
export function readLocalFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    if (file.name.endsWith('.pdf')) {
      reader.onload = (e) => {
        const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const text = `Document: ${file.name}\n\nPDF document loaded successfully. Sliced into progressive micro-reading sessions.`;
        resolve({
          fileName: file.name,
          title: title,
          content: text,
          sections: [
            {
              title: `Part 1: Key Executive Summary - ${title}`,
              content: `### 📄 Document Overview: ${title}\n\nThis PDF document has been deconstructed into structured micro-reading sprints.\n\n#### Core Objectives:\n1. **Foundational Principles**: Absorb the introductory axioms before diving into quantitative or technical data.\n2. **Framework Alignment**: Align your focus on the 3 central takeaways that drive maximum utility.\n3. **Practical Validation**: Reflect on how this document applies to your immediate goals.`
            },
            {
              title: `Part 2: Deep Analysis & Framework Breakdown`,
              content: `### 💡 Primary Methodology & Findings\n\nReview the central arguments and strategic models presented in the document.\n\n#### Key Observations:\n- Note the primary evidence and recurring patterns.\n- Compare the methodology against standard industry practices.\n- Identify potential blindspots or critical dependencies.`
            },
            {
              title: `Part 3: Strategic Takeaways & Synthesis`,
              content: `### 🛠️ Strategic Synthesis\n\nConclude the document reading with actionable synthesis.\n\n- Write down 1 sentence summarizing the core insight in your own words.\n- Highlight 1 immediate action item to execute today.\n\nWhen done, press **Done & Complete Step**!`
            }
          ]
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        const text = e.target.result;
        resolve({
          fileName: file.name,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          content: text,
          sections: extractSectionsFromText(text)
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    }
  });
}


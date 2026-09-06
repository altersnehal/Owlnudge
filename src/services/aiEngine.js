import { fetchAndExtractContent, isYouTubeUrl } from './contentFetcher';

const GEMINI_API_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];
const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';

/**
 * Get configured Gemini API Key from environment or local storage
 */
export function getGeminiApiKey() {
  return (
    import.meta.env.VITE_GEMINI_API_KEY ||
    localStorage.getItem('owlnudge_gemini_key') ||
    localStorage.getItem('gemini_api_key') ||
    ''
  );
}

export function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem('owlnudge_gemini_key', key.trim());
  } else {
    localStorage.removeItem('owlnudge_gemini_key');
  }
}

/**
 * Master Roadmap & Essay Slicer
 */
export async function generateRoadmap({ goalText, targetWeeks = 3, dailyMinutes = 45, fileData = null }) {
  let extracted = null;

  if (fileData) {
    extracted = {
      title: fileData.title,
      rawText: fileData.content,
      sections: fileData.sections
    };
  } else if (/^(http|https):\/\/[^ "]+$/.test(goalText.trim())) {
    try {
      extracted = await fetchAndExtractContent(goalText.trim());
    } catch (e) {
      console.warn('URL extraction error, proceeding with AI engine:', e);
    }
  }

  // 1. Attempt Google Gemini API first if API key is present or available
  const apiKey = getGeminiApiKey();
  if (apiKey) {
    try {
      const geminiResult = await generateWithGemini({ goalText, targetWeeks, dailyMinutes, fileData, extracted, apiKey });
      if (geminiResult) {
        return { source: 'gemini', ...geminiResult };
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back:', err);
    }
  }

  // 2. Attempt Local Ollama (e.g. Llama 3.2) if running
  try {
    const ollamaResult = await generateWithOllama({ goalText, targetWeeks, dailyMinutes, extracted });
    if (ollamaResult) {
      return { source: 'ollama', ...ollamaResult };
    }
  } catch (err) {
    console.info('Ollama offline or timed out; switching to Owlnudge ADHD Slicer Engine.');
  }

  // 3. Fallback: Deterministic ADHD Heuristic Slicer with rich essays & chapter players
  return generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes, extracted);
}

/**
 * Generate comprehensive structured roadmap & masterclass essays using Google Gemini API
 */
async function generateWithGemini({ goalText, targetWeeks, dailyMinutes, fileData, extracted, apiKey }) {
  const isVideo = extracted?.isVideo || isYouTubeUrl(goalText);
  const videoId = extracted?.videoId;

  const contextData = extracted?.rawText 
    ? `Extracted Content / Summary:\n${extracted.rawText.slice(0, 3000)}` 
    : (fileData?.content ? `Document Content:\n${fileData.content.slice(0, 3000)}` : '');

  const prompt = `You are Owlnudge, an elite ADHD learning mentor and domain expert.
Your mission is to deconstruct this topic/resource: "${extracted?.title || goalText}" into an anti-overwhelm, ultra-high-clarity ${targetWeeks}-week learning roadmap.

${contextData}

${isVideo ? `NOTE: This is a YouTube video/podcast (Video ID: ${videoId || 'VIDEO_ID'}). In the microSteps for each task, embed the responsive video player tag '[youtube:${videoId || 'VIDEO_ID'}:START_SECONDS]' at the beginning of the readingMaterial for relevant chapters.` : ''}

CRITICAL REQUIREMENTS:
1. Max ${targetWeeks} progressive milestones with meaningful pedagogical flow (Week 1 = Foundations & Mental Models, Week 2 = Core Mechanics & Patterns, Week 3 = Synthesis & Real-World Application).
2. Each milestone must contain 2-3 focused learning tasks.
3. Automatically insert 2 buffer days per week (type: 'BUFFER', durationMinutes: 0) to prevent burnout and absorb missed days.
4. Each task must have 2-3 sequential microSteps.
5. In each microStep:
   - "title": Action-oriented micro-step title with time estimate (e.g., "Scan Primary Hypothesis (45s)", "Deep Concept Breakdown (2m)", "Trace Edge Cases (5m)").
   - "time": Time string (e.g. "45s", "2m", "5m").
   - "readingMaterial": Provide an EXCEPTIONALLY WELL-WRITTEN, substantial 2-4 paragraph mini-essay or mental model in markdown. Use markdown headings (###, ####), bold conceptual anchors, bullet points (-), blockquotes (>), or code blocks (\`\`\`) where appropriate. Teach the concept with utmost clarity, first principles, and zero filler!

Return ONLY a valid JSON object strictly matching this schema:
{
  "title": "${extracted?.title ? extracted.title.replace(/"/g, '\\"') : 'Topic Title'}",
  "summary": "Concise 1-2 sentence overview explaining the structure and buffer cushions.",
  "bufferDaysCount": ${targetWeeks * 2},
  "milestones": [
    {
      "id": "m1",
      "weekNumber": 1,
      "title": "Phase 1: Title",
      "description": "Short phase description",
      "tasks": [
        {
          "id": "t1_1",
          "title": "Task title",
          "durationMinutes": ${dailyMinutes},
          "type": "TASK",
          "intuitionTip": "1-sentence working memory anchor or intuition rule.",
          "microSteps": [
            {
              "title": "Step 1 Title (45s)",
              "time": "45s",
              "readingMaterial": "### Subheading\\n\\nComprehensive essay paragraph 1...\\n\\n#### Key Principles\\n- Point 1\\n- Point 2\\n\\n> **Intuition:** Core takeaway."
            }
          ]
        },
        {
          "id": "b1_1",
          "title": "Buffer Day 1 (Guilt-Free Rest & Catch-up)",
          "durationMinutes": 0,
          "type": "BUFFER",
          "intuitionTip": "Buffer cushions protect your streak and give your nervous system space to consolidate knowledge.",
          "microSteps": []
        }
      ]
    }
  ]
}`;

  for (const model of GEMINI_API_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3
          }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonText) {
          const parsed = JSON.parse(jsonText);
          if (parsed && parsed.milestones && parsed.milestones.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn(`Gemini model ${model} error:`, e);
    }
  }

  return null;
}

/**
 * Local Ollama fallback generator
 */
async function generateWithOllama({ goalText, targetWeeks, dailyMinutes, extracted }) {
  const contentContext = extracted?.rawText ? `Extracted Content:\n${extracted.rawText.slice(0, 1500)}` : '';
  const prompt = `You are Owlnudge, an empathetic ADHD accountability mentor.
Break down this learning goal: "${extracted?.title || goalText}" into an anti-overwhelm ${targetWeeks}-week roadmap with rich reading essays for each microStep.
${contentContext}
Return ONLY valid JSON matching the Owlnudge roadmap schema.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600);

  const res = await fetch(OLLAMA_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      prompt: prompt,
      stream: false,
      format: 'json'
    }),
    signal: controller.signal
  });
  clearTimeout(timeoutId);

  if (res.ok) {
    const data = await res.json();
    const parsed = JSON.parse(data.response);
    if (parsed && parsed.milestones && parsed.milestones.length > 0) {
      return parsed;
    }
  }
  return null;
}

/**
 * Deterministic ADHD Heuristic Slicer with domain-adaptive multi-paragraph essays and video chapter embeds
 */
function generateHeuristicRoadmap(goalText, targetWeeks = 3, dailyMinutes = 45, extracted = null) {
  const isUrl = /^(http|https):\/\/[^ "]+$/.test(goalText.trim());
  const lower = (extracted?.title || goalText).toLowerCase();

  let detectedTitle = extracted?.title || goalText;
  let summary = `Structured ${targetWeeks}-week roadmap with progressive micro-goals, comprehensive reading passages, and built-in buffer cushions.`;

  if (isUrl && !extracted?.title) {
    if (lower.includes('udemy.com')) {
      const pathPart = goalText.split('/course/')[1]?.split('/')[0]?.replace(/-/g, ' ') || 'Udemy Masterclass';
      detectedTitle = `Udemy: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Deconstructed Udemy video syllabus into bite-sized weekly modules with 2 buffer days/week.`;
    } else if (lower.includes('medium.com')) {
      const pathPart = goalText.split('/').pop()?.replace(/-/g, ' ') || 'Deep Dive Article';
      detectedTitle = `Medium: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Sliced long-form engineering article into actionable mental models and applied exercises.`;
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      detectedTitle = `YouTube Masterclass Lecture`;
      summary = `Converted video podcast into chapter-based sprints with embedded video players and dedicated rest buffers.`;
    }
  }

  // 1. YouTube Video / Podcast Chapters Pipeline (Evenly distributed across all targetWeeks)
  if (extracted?.isVideo && extracted?.sections?.length > 0) {
    const videoId = extracted.videoId;
    const author = extracted.author || 'Speaker / Creator';

    const videoTasks = extracted.sections.map((sec, idx) => ({
      id: `t_vid_${idx + 1}`,
      title: sec.title || `Chapter ${idx + 1}`,
      durationMinutes: dailyMinutes,
      type: 'TASK',
      intuitionTip: `Anchor key insights from ${author} into your working memory.`,
      microSteps: [
        {
          title: `Watch Video Segment & Identify Core Thesis (2m)`,
          time: '2m',
          readingMaterial: sec.content || `[youtube:${videoId}:${sec.timestampSec || 0}]\n\n### 📺 Chapter Overview - ${sec.title}\n\n**Creator:** ${author}\n\nWatch this chapter to grasp the primary thesis.`
        },
        {
          title: `Mental Model Breakdown & Core Mechanics (2m)`,
          time: '2m',
          readingMaterial: `### 💡 Deep Dive: Critical Mechanisms\n\nIn this chapter of *${detectedTitle}*, note how the central problem is formulated.\n\n#### Key Analytical Angles:\n1. **First Principles Constraint**: What is the root bottleneck being tackled by ${author}?\n2. **Counter-Intuitive Insight**: What common assumption does this approach discard?\n3. **Practical Trade-Offs**: Where does this method excel, and where should caution be exercised?\n\n> **⚡ Working Memory Anchor:**\n> Understanding the trade-offs allows you to apply this pattern in novel scenarios without hesitation.`
        },
        {
          title: `Actionable Synthesis & Implementation (5m)`,
          time: '5m',
          readingMaterial: `### 🛠️ Execution & Synthesis\n\nTake 3 minutes to summarize the biggest takeaway from this segment in your own words.\n\n#### Checklist for this Module:\n- Identify 1 immediate action item you can implement today.\n- Note down any unfamiliar terms for later review during your buffer day.\n\nOnce done, click **Done & Complete Step** to mark this chapter complete!`
        }
      ]
    }));

    return partitionTasksIntoMilestones({
      allTasks: videoTasks,
      targetWeeks: targetWeeks,
      overallTitle: detectedTitle,
      summary: `Deconstructed video masterclass by ${author} into ${targetWeeks} progressive weekly modules with embedded players and rest buffers.`,
      source: 'youtube_chapters'
    });
  }

  // 2. Custom Uploaded Document / Extracted Web Article
  if (extracted?.sections && extracted.sections.length > 0) {
    const sectionTasks = extracted.sections.map((sec, idx) => ({
      id: `t_sec_${idx + 1}`,
      title: sec.title || `Module ${idx + 1}`,
      durationMinutes: dailyMinutes,
      type: 'TASK',
      intuitionTip: `Master the core intuition of ${sec.title}.`,
      microSteps: [
        {
          title: `Scan key concepts in ${sec.title} (45s)`,
          time: '45s',
          readingMaterial: sec.content || `Focus on understanding the core premise before applying the concept.`
        },
        {
          title: `Read breakdown & practical application (2m)`,
          time: '2m',
          readingMaterial: `### 📖 Deep Dive Analysis: ${sec.title}\n\n${sec.content}\n\n#### Strategic Reflection:\n- How does this pattern solve the friction in your existing workflow?\n- What are the boundary conditions where this method applies?`
        },
        {
          title: `Summarize 1 takeaway in your own words (5m)`,
          time: '5m',
          readingMaterial: `### ✏️ 1-Minute Synthesis\n\nWrite down 1 single sentence that explains this concept in plain English. Once written, you have locked this pattern in memory.`
        }
      ]
    }));

    return partitionTasksIntoMilestones({
      allTasks: sectionTasks,
      targetWeeks: targetWeeks,
      overallTitle: detectedTitle,
      summary: `Extracted ${extracted.sections.length} core reading modules across ${targetWeeks} weeks with auto-injected buffer days.`,
      source: 'extracted_content'
    });
  }

  // 3. Domain-Adaptive Knowledge Synthesis for Any Topic
  return generateDomainAdaptiveRoadmap(detectedTitle, targetWeeks, dailyMinutes);
}

/**
 * Distributes an arbitrary list of tasks across N weeks with 2 buffer cushions per week
 */
function partitionTasksIntoMilestones({ allTasks, targetWeeks, overallTitle, summary, source = 'heuristic' }) {
  const milestones = [];
  const totalTasks = allTasks.length;
  const tasksPerWeek = Math.max(1, Math.ceil(totalTasks / targetWeeks));

  for (let w = 1; w <= targetWeeks; w++) {
    const startIndex = (w - 1) * tasksPerWeek;
    let weekTasks = allTasks.slice(startIndex, startIndex + tasksPerWeek);

    // If we ran out of tasks for later weeks, synthesize progressive mastery tasks
    if (weekTasks.length === 0) {
      weekTasks = [
        {
          id: `t_w${w}_1`,
          title: `Week ${w} Applied Deep Dive: Advanced Synthesis`,
          durationMinutes: 45,
          type: 'TASK',
          intuitionTip: `Consolidate past learnings through rigorous end-to-end testing.`,
          microSteps: [
            {
              title: `Review Core Architecture (1m)`,
              time: '1m',
              readingMaterial: `### 🔍 Week ${w} Synthesis Sprint\n\nReview the core mental models established in earlier weeks and test them against high-friction edge cases.`
            },
            {
              title: `Hands-on Capstone Execution (10m)`,
              time: '10m',
              readingMaterial: `### 🛠️ Execution Project\n\nBuild or write a complete standalone solution applying everything learned so far.`
            }
          ]
        }
      ];
    }

    const phaseTitle = w === 1 
      ? `Phase 1: Foundations & Core Paradigm` 
      : w === 2 
        ? `Phase 2: Deep Mechanics & Architecture` 
        : w === 3 
          ? `Phase 3: Applied Patterns, Edge Cases & Synthesis` 
          : `Phase ${w}: Advanced Mastery & Capstone Implementation`;

    // Interleave 2 buffer days
    const milestoneTasks = [];
    if (weekTasks.length >= 2) {
      milestoneTasks.push(weekTasks[0]);
      milestoneTasks.push({
        id: `b${w}_1`,
        title: `Buffer Day 1 (Mid-Week Guilt-Free Rest)`,
        durationMinutes: 0,
        type: 'BUFFER',
        intuitionTip: 'Mid-week buffers absorb unexpected life friction and prevent burnout.',
        microSteps: []
      });
      milestoneTasks.push(...weekTasks.slice(1));
      milestoneTasks.push({
        id: `b${w}_2`,
        title: `Buffer Day 2 (Consolidation & Catch-up)`,
        durationMinutes: 0,
        type: 'BUFFER',
        intuitionTip: 'Neural consolidation happens during rest periods.',
        microSteps: []
      });
    } else {
      milestoneTasks.push(...weekTasks);
      milestoneTasks.push({
        id: `b${w}_1`,
        title: `Buffer Day 1 (Rest & Recovery)`,
        durationMinutes: 0,
        type: 'BUFFER',
        intuitionTip: 'Protects your streak and resets working memory.',
        microSteps: []
      });
      milestoneTasks.push({
        id: `b${w}_2`,
        title: `Buffer Day 2 (Catch-up Cushion)`,
        durationMinutes: 0,
        type: 'BUFFER',
        intuitionTip: 'Never fall behind schedule with built-in buffer cushions.',
        microSteps: []
      });
    }

    milestones.push({
      id: `m${w}`,
      weekNumber: w,
      title: phaseTitle,
      description: `Week ${w} progressive micro-goals with 2 dedicated buffer cushions.`,
      tasks: milestoneTasks
    });
  }

  return {
    source: source,
    title: overallTitle,
    summary: summary || `Structured ${targetWeeks}-week roadmap with progressive micro-goals, comprehensive reading passages, and built-in buffer cushions.`,
    bufferDaysCount: targetWeeks * 2,
    milestones: milestones
  };
}

/**
 * Intelligent domain knowledge generator tailored to any input topic
 */
function generateDomainAdaptiveRoadmap(topicTitle, targetWeeks, dailyMinutes) {
  const cleanTitle = topicTitle.trim().replace(/\b\w/g, l => l.toUpperCase());
  const lower = topicTitle.toLowerCase();

  // 1. Detect Domain
  let domain = 'GENERAL';
  if (/dp|recursion|algorithm|leetcode|trees|graphs|binary search|sorting|data structure/i.test(lower)) {
    domain = 'ALGORITHMS';
  } else if (/distributed|system design|microservices|kafka|kubernetes|docker|redis|sharding|caching|load balancer|scalability|sql|database/i.test(lower)) {
    domain = 'SYSTEM_DESIGN';
  } else if (/ai|machine learning|deep learning|neural|llm|gpt|transformer|bert|pytorch|tensorflow|nlp|vision|backpropagation/i.test(lower)) {
    domain = 'AI_ML';
  } else if (/react|next\.js|frontend|vue|javascript|typescript|css|tailwind|web dev|html|angular|ui|ux/i.test(lower)) {
    domain = 'FRONTEND';
  } else if (/adhd|focus|dopamine|neuroscience|habit|procrastination|burnout|psychology|executive function|flow/i.test(lower)) {
    domain = 'PSYCH_ADHD';
  } else if (/stoic|stoicism|marcus aurelius|seneca|epictetus|philosophy|ethics|logic|mental model/i.test(lower)) {
    domain = 'PHILOSOPHY';
  } else if (/startup|saas|business|economics|finance|investing|marketing|growth|accounting|dcf/i.test(lower)) {
    domain = 'BUSINESS';
  } else if (/quantum|physics|biology|chemistry|science|evolution|astronomy|thermodynamics/i.test(lower)) {
    domain = 'SCIENCE';
  }

  // Generate domain-tailored tasks across all weeks
  const allTasks = [];

  for (let w = 1; w <= targetWeeks; w++) {
    if (domain === 'ALGORITHMS') {
      if (w === 1) {
        allTasks.push(
          {
            id: `t_algo_${w}_1`,
            title: `1D Recursion & Memoization Patterns`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Memoization = Caching state answers so you never repeat work for the same subproblem.',
            microSteps: [
              {
                title: 'Deconstruct Recursive State Tree (45s)',
                time: '45s',
                readingMaterial: `### 🌲 The Recursive Call Tree Intuition\n\nWhen solving recursive problems in **${cleanTitle}**, every node in your call tree represents a state.\n\nWithout caching, identical states are re-evaluated exponentially (**O(2ⁿ)**).\nBy indexing state variables in a memoization array or hash table, time complexity collapses to linear (**O(n)**).\n\n\`\`\`javascript\nconst memo = new Map();\nfunction solve(n) {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const res = solve(n - 1) + solve(n - 2);\n  memo.set(n, res);\n  return res;\n}\n\`\`\``
              },
              {
                title: 'State Transition Formula Derivation (2m)',
                time: '2m',
                readingMaterial: `### 💡 Deriving the Recurrence Relation\n\nTo find the state transition:\n1. **Identify Choices**: At step \`i\`, what decisions are available?\n2. **Express State in Terms of Subproblems**: \`dp[i] = optimal(dp[i-1] + cost, dp[i-2] + cost)\`\n3. **Isolate Base Cases**: What are the smallest non-divisible inputs (\`i = 0, i = 1\`)?`
              },
              {
                title: 'Space Optimization to O(1) (5m)',
                time: '5m',
                readingMaterial: `### 🚀 Memory Optimization\n\nIf \`dp[i]\` only depends on \`dp[i-1]\` and \`dp[i-2]\`, eliminate the entire array!\nMaintain only 2 variables (\`prev1\`, \`prev2\`) to achieve **O(1) auxiliary space**.`
              }
            ]
          },
          {
            id: `t_algo_${w}_2`,
            title: `Binary Choice State Transitions (Include vs Exclude)`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Every element has only two options: Take it and mutate budget, or Skip it.',
            microSteps: [
              {
                title: 'Understand the Binary Decision Model (1m)',
                time: '1m',
                readingMaterial: `### 🎒 The 0/1 Choice Paradigm\n\nFor any item \`i\` with weight \`w\` and value \`v\`:\n- **Option A (Skip)**: Value = \`dp[i-1][capacity]\`\n- **Option B (Take)**: Value = \`v + dp[i-1][capacity - w]\`\n\nState formula: \`dp[i][c] = Math.max(skip, take)\``
              }
            ]
          }
        );
      } else if (w === 2) {
        allTasks.push(
          {
            id: `t_algo_${w}_1`,
            title: `2D Grid Transitions & Matrix Traversal`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Ways to reach grid[r][c] = ways from Top + ways from Left.',
            microSteps: [
              {
                title: 'Grid Coordinate Constraints (1m)',
                time: '1m',
                readingMaterial: `### 🗺️ 2D Matrix DP Rules\n\nA robot at \`(0,0)\` moving only Down or Right to \`(m-1, n-1)\`:\n\`dp[r][c] = dp[r-1][c] + dp[r][c-1]\`\n\nBoundary rows (\`r=0\` or \`c=0\`) have exactly 1 way to be reached.`
              }
            ]
          },
          {
            id: `t_algo_${w}_2`,
            title: `Subsequence Alignment & Longest Common Patterns`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'If characters match, advance both pointers: 1 + dp[i-1][j-1].',
            microSteps: [
              {
                title: '2-Pointer String State Matrix (2m)',
                time: '2m',
                readingMaterial: `### 🔤 String Alignment Recurrence\n\nComparing String A (\`i\`) and String B (\`j\`):\n- If \`A[i] === B[j]\`: \`dp[i][j] = 1 + dp[i-1][j-1]\`\n- If \`A[i] !== B[j]\`: \`dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])\``
              }
            ]
          }
        );
      } else {
        allTasks.push(
          {
            id: `t_algo_${w}_1`,
            title: `Intervals, Knapsack & Tree State DP`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Divide subproblems by sub-intervals [i...k] and [k+1...j].',
            microSteps: [
              {
                title: 'Interval Partitioning Mechanics (2m)',
                time: '2m',
                readingMaterial: `### ✂️ Interval DP Framework\n\nIterate over interval length \`len\` from 2 to \`n\`.\nTry all split points \`k\` between \`i\` and \`j\` to minimize total partition cost.`
              }
            ]
          }
        );
      }
    } else if (domain === 'SYSTEM_DESIGN') {
      if (w === 1) {
        allTasks.push(
          {
            id: `t_sys_${w}_1`,
            title: `Core Architectural Primitives: Caching & Load Balancing`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Push data closer to the user; eliminate single points of failure with health-checked round-robin.',
            microSteps: [
              {
                title: 'Deconstruct Latency Numbers Every Engineer Must Know (45s)',
                time: '45s',
                readingMaterial: `### ⏱️ Latency Hierarchy in ${cleanTitle}\n\n- **L1 CPU Cache**: ~1 ns\n- **RAM Access**: ~100 ns\n- **SSD NVMe Read**: ~10,000 ns (10 µs)\n- **Redis In-Memory Read**: ~0.5 ms\n- **Postgres Disk Read**: ~10 ms\n- **Cross-Datacenter Round Trip**: ~150 ms\n\n> **💡 Core Rule:**\n> A cache hit avoids a 10,000x latency penalty. Design your caching layer (Cache-Aside vs Write-Through) around read-to-write ratios.`
              },
              {
                title: 'Load Balancing Algorithms & Session Affinity (2m)',
                time: '2m',
                readingMaterial: `### ⚖️ Load Balancing Layer\n\nDistribute inbound HTTP/gRPC traffic across stateless app instances using:\n1. **Least Connections**: Best for long-lived WebSocket connections.\n2. **Consistent Hashing**: Minimizes key remapping when nodes scale up or down.\n3. **Round Robin with Health Checks**: Simple and effective for uniform stateless requests.`
              }
            ]
          },
          {
            id: `t_sys_${w}_2`,
            title: `Data Partitioning, Sharding & CAP Theorem`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'You cannot beat network latency; choose between strict consistency (CP) or high availability (AP).',
            microSteps: [
              {
                title: 'The Realities of CAP & PACELC (2m)',
                time: '2m',
                readingMaterial: `### 🌐 Partition Tolerance is Non-Negotiable\n\nNetworks will drop packets. When a partition occurs (P), you must choose:\n- **Consistency (CP)**: Reject writes until all nodes agree (financial ledgers).\n- **Availability (AP)**: Accept writes immediately and resolve conflicts later (social feeds).\n\nPACELC adds: If there is no partition (E), choose between **Latency (L)** and **Consistency (C)**.`
              }
            ]
          }
        );
      } else {
        allTasks.push(
          {
            id: `t_sys_${w}_1`,
            title: `Asynchronous Event Streaming & Distributed Transactions`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Decouple producers and consumers with log-based streaming; use Saga patterns instead of 2PC.',
            microSteps: [
              {
                title: 'Kafka Log Partitioning & Consumer Groups (2m)',
                time: '2m',
                readingMaterial: `### 📨 Event-Driven Architecture\n\nInstead of direct synchronous HTTP calls between microservices, publish immutable events to partitioned logs.\n\n- Consumer groups scale independently.\n- Failed events route to Dead Letter Queues (DLQ) without crashing the pipeline.`
              }
            ]
          }
        );
      }
    } else if (domain === 'AI_ML') {
      if (w === 1) {
        allTasks.push(
          {
            id: `t_ai_${w}_1`,
            title: `Foundations: Loss Landscapes, Gradient Descent & Backpropagation`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Neural networks are universal function approximators guided by the chain rule.',
            microSteps: [
              {
                title: 'The Core Optimization Intuition (45s)',
                time: '45s',
                readingMaterial: `### 📉 Gradient Descent in ${cleanTitle}\n\nEvery parameter \`W\` is adjusted in the opposite direction of the loss gradient:\n\`W_{t+1} = W_t - \\eta \\cdot \\nabla L(W_t)\`\n\n#### Key Mechanics:\n1. **Forward Pass**: Compute activations layer by layer.\n2. **Loss Calculation**: Measure divergence between prediction and ground truth.\n3. **Backward Pass (Chain Rule)**: Propagate gradients backward to update weights.`
              },
              {
                title: 'Activation Functions & Vanishing Gradients (2m)',
                time: '2m',
                readingMaterial: `### ⚡ Non-Linearity & ReLU\n\nWithout non-linear activations (ReLU, GELU, Swish), stacking 100 linear layers is mathematically identical to a single linear layer.\n\nGELU and Leaky ReLU prevent the 'dying neuron' problem by maintaining gradient flow.`
              }
            ]
          },
          {
            id: `t_ai_${w}_2`,
            title: `Self-Attention Mechanics & The Transformer Architecture`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Query meets Key to compute Attention Weights, scaling Value embeddings dynamically.',
            microSteps: [
              {
                title: 'Scaled Dot-Product Attention Formula (2m)',
                time: '2m',
                readingMaterial: `### 🧠 Attention Is All You Need\n\n\`Attention(Q, K, V) = softmax(Q Kᵀ / √d_k) V\`\n\n1. **Query (Q)**: What this token is looking for.\n2. **Key (K)**: What this token represents.\n3. **Value (V)**: The actual semantic payload.\n\nDividing by \`√d_k\` prevents the softmax function from pushing into regions with vanishingly small gradients.`
              }
            ]
          }
        );
      } else {
        allTasks.push(
          {
            id: `t_ai_${w}_1`,
            title: `LLM Alignment, KV Caching & Inference Optimization`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'KV cache avoids recomputing attention for previous tokens in autoregressive generation.',
            microSteps: [
              {
                title: 'KV Cache & Quantization (2m)',
                time: '2m',
                readingMaterial: `### 🚀 High-Throughput Inference\n\nIn autoregressive token generation, storing Key and Value matrices in memory (KV Cache) reduces inference from **O(N²)** to **O(N)** compute.\n\nApplying 4-bit/8-bit quantization (AWQ, GPTQ) reduces memory bandwidth bottlenecks without significant accuracy loss.`
              }
            ]
          }
        );
      }
    } else if (domain === 'PSYCH_ADHD') {
      allTasks.push(
        {
          id: `t_adhd_${w}_1`,
          title: `Week ${w}: Neurobiology of Dopamine Baselines & Working Memory`,
          durationMinutes: dailyMinutes,
          type: 'TASK',
          intuitionTip: 'ADHD is not a lack of attention; it is a dysregulation of dopamine-mediated salience and executive signaling.',
          microSteps: [
            {
              title: 'Understanding the Dopamine Valley (45s)',
              time: '45s',
              readingMaterial: `### 🧠 The Neurochemistry of Focus in ${cleanTitle}\n\nWhen confronting high-friction tasks, the neurodivergent prefrontal cortex experiences an acute dopamine drop, triggering physical agitation and task-switching impulses.\n\n#### Key Strategies:\n1. **Micro-Momentum (10-Second Rule)**: Make the starting friction so tiny (e.g. open the file, write 1 word) that executive resistance is bypassed.\n2. **External Working Memory Anchors**: Never hold multi-step plans in your head. Render every step in physical or digital checklists.\n3. **Zero-Guilt Buffer Rest**: Neural consolidation requires downtime. Guilt drains dopamine without providing restoration.`
            },
            {
              title: 'Environmental Friction Engineering (2m)',
              time: '2m',
              readingMaterial: `### 🛡️ Friction Engineering\n\nWillpower is an exhaustible battery. Design your environment so the right action has 1 less step of friction, and distractions have 2 more steps of friction.`
            }
          ]
        },
        {
          id: `t_adhd_${w}_2`,
          title: `Week ${w}: Overcoming Task Initiation Paralysis`,
          durationMinutes: dailyMinutes,
          type: 'TASK',
          intuitionTip: 'Motion creates emotion. Action precedes motivation, never the reverse.',
          microSteps: [
            {
              title: 'The Activation Energy Protocol (1m)',
              time: '1m',
              readingMaterial: `### ⚡ Activation Energy Mechanics\n\nTreat starting a task like striking a match. The energy required to strike the match is 10x the energy required to keep the flame burning.`
            }
          ]
        }
      );
    } else if (domain === 'PHILOSOPHY') {
      allTasks.push(
        {
          id: `t_phil_${w}_1`,
          title: `Week ${w}: The Dichotomy of Control & Mental Clarity`,
          durationMinutes: dailyMinutes,
          type: 'TASK',
          intuitionTip: 'Separate what is up to you (thoughts, actions, impulses) from what is not (outcomes, others, events).',
          microSteps: [
            {
              title: 'First Principles of Stoic Equanimity (45s)',
              time: '45s',
              readingMaterial: `### 🏛️ The Core Dichotomy in ${cleanTitle}\n\n*Epictetus wrote:* "Some things are in our control and others not. Things in our control are opinion, pursuit, desire, aversion, and, in a word, whatever are our own actions. Things not in our control are body, property, reputation, command, and, in one word, whatever are not our own actions."\n\n#### Practical Rules:\n1. **Focus 100% of Effort on Internal Inputs**: Judge your success solely on the integrity of your effort, never external randomness.\n2. **Amor Fati (Love of Fate)**: Treat unexpected obstacles not as interruptions, but as the exact material with which to practice virtue.\n3. **Premeditatio Malorum**: Mentally rehearse difficulties in advance so reality never shocks your nervous system.`
            },
            {
              title: 'Reflective Journaling & Evening Review (2m)',
              time: '2m',
              readingMaterial: `### 📓 Marcus Aurelius' Daily Reflection\n\nAt the close of each day, ask yourself:\n- Where did I allow external chaos to disturb my peace?\n- Where did I act with patience, courage, and wisdom?\n- What one correction will I apply tomorrow?`
            }
          ]
        }
      );
    } else {
      // General Adaptive Domain
      allTasks.push(
        {
          id: `t_gen_${w}_1`,
          title: `Week ${w}: Foundational Frameworks of ${cleanTitle}`,
          durationMinutes: dailyMinutes,
          type: 'TASK',
          intuitionTip: `Master the 80/20 primitives that govern 80% of real-world outcomes in this subject.`,
          microSteps: [
            {
              title: `Core Principles & Mental Models of ${cleanTitle} (45s)`,
              time: '45s',
              readingMaterial: `### 🎯 Core Focus Objectives - ${cleanTitle}\n\nThe primary goal of this phase is establishing an unbreakable mental framework without getting trapped in cognitive overload.\n\n#### Key Pedagogical Principles:\n1. **First-Principles Thinking**: Rather than memorizing surface rules by rote, uncover the foundational constraints that forced this concept into existence.\n2. **Working Memory Conservation**: Break complex systems into self-contained primitives. Master one primitive completely before coupling them together.\n3. **Immediate Feedback Loops**: Validate every mental model against a concrete real-world example.`
            },
            {
              title: `Architectural Breakdown & Execution Mechanics (2m)`,
              time: '2m',
              readingMaterial: `### 💡 Primary Architecture: ${cleanTitle}\n\nTo master this domain, dissect the problem into three operational layers:\n\n1. **Input & Initiation Layer**: What are the non-negotiable prerequisites required before work begins?\n2. **Transformation & Processing**: What deterministic steps transform the input into high-value output?\n3. **Verification & Edge Cases**: How do you detect anomalies and protect against system failure?\n\n> **⚡ Working Memory Anchor:**\n> A clear, simple model executed with consistency beats a complex model that creates analysis paralysis.`
            },
            {
              title: `Practical Synthesis & Reflection Checklist (5m)`,
              time: '5m',
              readingMaterial: `### 🛠️ Execution & Synthesis\n\n#### Concrete Reflection:\n- Can you explain the core mechanism in 2 plain sentences to a beginner?\n- What is the biggest point of friction in this domain, and how do you bypass it?\n- Identify 1 immediate project or task where you can apply this principle today.\n\nOnce reviewed, click **Done & Complete Step** to seal this module in memory!`
            }
          ]
        },
        {
          id: `t_gen_${w}_2`,
          title: `Week ${w}: Applied Mechanics & Case Studies`,
          durationMinutes: dailyMinutes,
          type: 'TASK',
          intuitionTip: `Transform theoretical understanding into muscle memory through structured practice.`,
          microSteps: [
            {
              title: `Analyze Concrete Real-World Patterns (1m)`,
              time: '1m',
              readingMaterial: `### 🔍 Applied Implementation Patterns in ${cleanTitle}\n\nObserve how leading practitioners approach this domain under real constraints.\n\n- **Pattern A (Linear Flow)**: High predictability, minimal branching.\n- **Pattern B (Hierarchical Convergence)**: Multiple inputs evaluated concurrently before converging on the optimal decision.`
            }
          ]
        }
      );
    }
  }

  return partitionTasksIntoMilestones({
    allTasks: allTasks,
    targetWeeks: targetWeeks,
    overallTitle: cleanTitle,
    summary: `Structured ${targetWeeks}-week roadmap with progressive micro-goals, comprehensive reading passages, and built-in buffer cushions.`,
    source: 'heuristic'
  });
}

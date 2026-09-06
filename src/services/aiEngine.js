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
  const timeoutId = setTimeout(() => controller.abort(), 5000);

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
 * Deterministic ADHD Heuristic Slicer with rich multi-paragraph essays and video chapter embeds
 */
function generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes, extracted) {
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

  // 1. YouTube Video / Podcast Chapters Pipeline
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
          readingMaterial: sec.content || `[youtube:${videoId}:0]\n\n### 📺 Chapter Overview - ${sec.title}\n\n**Creator:** ${author}\n\nWatch this chapter to grasp the primary thesis.`
        },
        {
          title: `Mental Model Breakdown & Core Mechanics (2m)`,
          time: '2m',
          readingMaterial: `### 💡 Deep Dive: Critical Mechanisms\n\nIn this chapter of *${detectedTitle}*, note how the central problem is formulated.\n\n#### Key Analytical Angles:\n1. **First Principles Constraint**: What is the root bottleneck being tackled?\n2. **Counter-Intuitive Insight**: What common assumption does this approach discard?\n3. **Practical Trade-Offs**: Where does this method excel, and where should caution be exercised?\n\n> **⚡ Working Memory Anchor:**\n> Understanding the trade-offs allows you to apply this pattern in novel scenarios without hesitation.`
        },
        {
          title: `Actionable Synthesis & Implementation (5m)`,
          time: '5m',
          readingMaterial: `### 🛠️ Execution & Synthesis\n\nTake 3 minutes to summarize the biggest takeaway from this segment in your own words.\n\n#### Checklist for this Module:\n- Identify 1 immediate action item you can implement today.\n- Note down any unfamiliar terms for later review during your buffer day.\n\nOnce done, click **Done & Complete Step** to mark this chapter complete!`
        }
      ]
    }));

    return {
      source: 'youtube_chapters',
      title: detectedTitle,
      summary: `Deconstructed ${extracted.sections.length} video chapters from ${author} with embedded players and rest buffers.`,
      bufferDaysCount: targetWeeks * 2,
      milestones: [
        {
          id: 'm1',
          weekNumber: 1,
          title: 'Week 1: Core Thesis & Foundational Chapters',
          description: 'Absorb the primary concepts with video-guided micro-sprints.',
          tasks: [
            ...videoTasks.slice(0, 2),
            {
              id: 'b1_1',
              title: 'Buffer Day 1 (Rest & Guilt-Free Catch-up)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffers prevent burnout and protect your schedule.',
              microSteps: []
            },
            ...(videoTasks.slice(2, 3) || [])
          ]
        },
        {
          id: 'm2',
          weekNumber: 2,
          title: 'Week 2: Advanced Mechanics & Synthesis',
          description: 'Hands-on synthesis and practical application.',
          tasks: [
            ...(videoTasks.slice(3, 5) || []),
            {
              id: 'b2_1',
              title: 'Buffer Day 2 (Consolidation Day)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Neural consolidation happens during rest.',
              microSteps: []
            }
          ]
        }
      ]
    };
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

    return {
      source: 'extracted_content',
      title: detectedTitle,
      summary: `Extracted ${extracted.sections.length} core reading modules with auto-injected buffer days.`,
      bufferDaysCount: targetWeeks * 2,
      milestones: [
        {
          id: 'm1',
          weekNumber: 1,
          title: 'Week 1: Core Principles & Foundations',
          description: 'Absorb foundational frameworks with zero cognitive overload.',
          tasks: [
            ...sectionTasks.slice(0, 2),
            {
              id: 'b1_1',
              title: 'Buffer Day 1 (Rest & Guilt-Free Catch-up)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffers prevent burnout and protect your schedule.',
              microSteps: []
            },
            ...(sectionTasks.slice(2, 3) || [])
          ]
        },
        {
          id: 'm2',
          weekNumber: 2,
          title: 'Week 2: Deep Application & Synthesis',
          description: 'Hands-on practice and synthesis.',
          tasks: [
            ...(sectionTasks.slice(3, 5) || []),
            {
              id: 'b2_1',
              title: 'Buffer Day 2 (Consolidation Day)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Neural consolidation happens during rest.',
              microSteps: []
            }
          ]
        }
      ]
    };
  }

  // 3. Coding & Algorithm Masterclass Archetype
  const isCoding = /leetcode|code|programming|algorithm|interview|dp|recursion|system|react|python|javascript|rust|backend|frontend/i.test(lower);

  if (isCoding || lower.includes('dp') || lower.includes('dynamic programming')) {
    return {
      source: 'heuristic',
      title: detectedTitle.startsWith('http') ? 'Dynamic Programming & Recursion Masterclass' : detectedTitle,
      summary: "Deconstructed 50+ overwhelming problems into 3 focused micro-archetypes with inline reading lessons and 2 mandatory buffer cushions per week.",
      bufferDaysCount: targetWeeks * 2,
      milestones: [
        {
          id: 'm1',
          weekNumber: 1,
          title: 'Phase 1: 1D Recursion & Memoization Patterns',
          description: 'Master the core state transition formula with single-decision problems.',
          tasks: [
            {
              id: 't1_1',
              title: 'Climbing Stairs (Visualizing Base Cases)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Memoization = Remembering answers so you never repeat work for the same subproblem.',
              microSteps: [
                {
                  title: 'Open LeetCode #70 & Read Base Cases (30s)',
                  time: '45s',
                  readingMaterial: `### 🧗 Climbing Stairs Intuition\n\nTo reach step \`n\`, you can only come from:\n1. Step \`n - 1\` (by taking a 1-step leap)\n2. Step \`n - 2\` (by taking a 2-step leap)\n\nTherefore, total ways to reach step \`n\` is simply:\n\`ways(n) = ways(n - 1) + ways(n - 2)\`\n\n**Base Cases:**\n- \`ways(1) = 1\` (only 1 step)\n- \`ways(2) = 2\` (1+1 or 2)`
                },
                {
                  title: 'Visual Recurrence & Napkin Drawing (2m)',
                  time: '2m',
                  readingMaterial: `### 🌲 The Subproblem Call Tree\n\nNotice that \`ways(4)\` calls \`ways(3)\` and \`ways(2)\`.\n\`ways(3)\` calls \`ways(2)\` and \`ways(1)\`.\n\nWithout memoization, \`ways(2)\` is computed twice!\nWith an array or cache: \`dp[i] = dp[i-1] + dp[i-2]\`, every step is calculated exactly once in **O(n)** time.`
                },
                {
                  title: 'Code the 3-line State Transition (10m)',
                  time: '10m',
                  readingMaterial: `### 💻 3-Line Solution Pattern\n\n\`\`\`javascript\nlet prev1 = 1, prev2 = 2;\nfor (let i = 3; i <= n; i++) {\n  let curr = prev1 + prev2;\n  prev1 = prev2;\n  prev2 = curr;\n}\nreturn prev2;\n\`\`\`\nNotice space complexity is reduced to **O(1)**.`
                }
              ]
            },
            {
              id: 't1_2',
              title: 'House Robber (Binary Decision: Rob or Skip)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Every house has only two choices: Rob current + dp[i-2] OR Skip current + dp[i-1].',
              microSteps: [
                {
                  title: 'Read Binary Choice Rules (1m)',
                  time: '1m',
                  readingMaterial: `### 🏠 The Robber's Dilemma\n\nAdjacent houses have security alarms. At house \`i\`, you have exactly **two mutually exclusive choices**:\n\n1. **Rob house i:** You gain \`val[i]\`, but you cannot rob house \`i-1\`. Max loot = \`val[i] + maxLoot(i-2)\`.\n2. **Skip house i:** You keep whatever max loot you had from house \`i-1\`. Max loot = \`maxLoot(i-1)\`.\n\nState formula: \`dp[i] = max(dp[i-1], dp[i-2] + val[i])\``
                },
                {
                  title: 'Trace [2, 7, 9, 3, 1] on Paper (2m)',
                  time: '2m',
                  readingMaterial: `### ✏️ Step-by-Step Trace\n\n- House 0 (\`$2\`): max = $2\n- House 1 (\`$7\`): max = max(2, 7) = $7\n- House 2 (\`$9\`): max(7, 2 + 9) = $11\n- House 3 (\`$3\`): max(11, 7 + 3) = $11\n- House 4 (\`$1\`): max(11, 11 + 1) = $12\n\nTotal loot: **$12**.`
                }
              ]
            },
            {
              id: 'b1_1',
              title: 'Buffer Day 1 (Rest & Guilt-Free Catch-up)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffers are not wasted days; they prevent burnout and keep your timeline safe.',
              microSteps: []
            }
          ]
        },
        {
          id: 'm2',
          weekNumber: 2,
          title: 'Phase 2: 2D Grid DP & Subsequence Transitions',
          description: 'Transition from 1D states into row/column matrices.',
          tasks: [
            {
              id: 't2_1',
              title: 'Unique Paths (2D Grid Intuition)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Ways to reach grid[r][c] = ways from top + ways from left.',
              microSteps: [
                {
                  title: 'Understand Grid Movement Constraints (1m)',
                  time: '1m',
                  readingMaterial: `### 🗺️ 2D Grid Coordinate Rules\n\nA robot is located at top-left \`(0,0)\` and wants to reach bottom-right \`(m-1, n-1)\`.\nThe robot can ONLY move **Down** or **Right**.\n\nTherefore, to land on any cell \`(r, c)\`, the robot must come from:\n- Top cell: \`(r - 1, c)\`\n- Left cell: \`(r, c - 1)\`\n\nFormula: \`dp[r][c] = dp[r-1][c] + dp[r][c-1]\``
                }
              ]
            },
            {
              id: 'b2_1',
              title: 'Buffer Day 2 (Consolidation Cushion)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Neural consolidation happens during rest.',
              microSteps: []
            }
          ]
        }
      ]
    };
  }

  // 4. General Open-Ended Topic Essay & Masterclass Archetype
  return {
    source: 'heuristic',
    title: detectedTitle,
    summary: summary,
    bufferDaysCount: targetWeeks * 2,
    milestones: [
      {
        id: 'm1',
        weekNumber: 1,
        title: 'Phase 1: Foundations & Mental Models',
        description: 'Absorb the fundamental baseline with micro-reading modules.',
        tasks: [
          {
            id: 't1_1',
            title: `Foundational Overview: ${detectedTitle}`,
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Understand the big picture before diving into mechanics.',
            microSteps: [
              {
                title: 'Scan Core Objectives & Thesis (45s)',
                time: '45s',
                readingMaterial: `### 🎯 Core Focus Objectives - ${detectedTitle}

The primary goal of this phase is establishing a rock-solid mental framework without getting trapped in cognitive overload or premature rabbit holes.

#### Key Principles:
1. **The 80/20 Foundation**: 80% of real-world outcomes in this subject stem from mastering 3 core primitives. Our focus is zeroing in on those foundational primitives before touching secondary edge cases.
2. **First-Principles Thinking**: Rather than memorizing rules or steps by rote, understand the root problem that forced the creation of this paradigm. When you understand *why* a constraint exists, the solution becomes self-evident.
3. **Working Memory Conservation**: Neurodivergent learners excel when concepts are chunked into self-contained units. Read this overview once to form an overarching mental map, then move directly to step 2.`
              },
              {
                title: 'Deep Concept Reading: The Execution Architecture (2m)',
                time: '2m',
                readingMaterial: `### 💡 Primary Architecture & Framework

To master **${detectedTitle}**, break the entire domain into three continuous operational layers:

#### 1. Input & Initiation Layer
Every effective system starts with unambiguous inputs. In this domain, failure to define boundary conditions early leads to cognitive friction and analysis paralysis. Always ask: *"What are the non-negotiable inputs required to trigger execution?"*

#### 2. Processing & State Transition
At its core, this concept transforms raw inputs into structured outcomes through a series of deterministic state changes. When dissecting any complex problem:
- Isolate the individual transformations one step at a time.
- Verify each intermediate state independently before coupling them together.
- Keep state mutations localized and predictable.

#### 3. Output Validation & Feedback Loops
Without an immediate feedback loop, learning decay occurs within hours. Build a micro-verification checkpoint after each concept to prove that your mental model matches reality.

> **💡 Mental Model Takeaway:**
> A simple model that you can execute under stress is 10x more valuable than a complex model you abandon.`
              },
              {
                title: 'Practical Synthesis & Reflection Prompt (5m)',
                time: '5m',
                readingMaterial: `### 🛠️ Synthesis & Real-World Application

Now that the core principles and architecture are clear, let's cement the knowledge into long-term memory.

#### Reflection Checklist:
- Can you explain the core mechanism in 2 sentences to someone outside the field?
- Where is the single biggest point of friction when applying this concept, and how does the framework bypass it?
- What is one tangible project or problem you can test this on today?

Once you have read and internalized these three pillars, hit **Done & Complete Step** to seal the loop!`
              }
            ]
          },
          {
            id: 'b1_1',
            title: 'Buffer Day 1 (Zero-Guilt Rest)',
            durationMinutes: 0,
            type: 'BUFFER',
            intuitionTip: 'Rest allows neural consolidation and resets cognitive bandwidth.',
            microSteps: []
          },
          {
            id: 't1_2',
            title: 'Core Mechanics & Applied Patterns',
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Turn abstract understanding into muscle memory through concrete practice.',
            microSteps: [
              {
                title: 'Analyze Applied Patterns (1m)',
                time: '1m',
                readingMaterial: `### 🔍 Applied Implementation Patterns

Moving from theory to execution requires recognizing common recurring patterns in the wild.

- **Pattern A (Linear Flow)**: Best suited for predictable, sequential workloads where each step directly depends on the preceding output.
- **Pattern B (Hierarchical Branching)**: Used when decisions must be evaluated across multiple conditions before converging back to a unified output.

Notice how both patterns follow the same fundamental architecture you learned in Module 1.`
              }
            ]
          }
        ]
      }
    ]
  };
}

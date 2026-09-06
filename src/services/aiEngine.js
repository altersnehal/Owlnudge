import { fetchAndExtractContent } from './contentFetcher';

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';

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
      console.warn('URL extraction error, proceeding with heuristic:', e);
    }
  }

  try {
    // Attempt local Ollama generation first
    const contentContext = extracted?.rawText ? `Extracted Content:\n${extracted.rawText.slice(0, 1500)}` : '';
    const prompt = `You are Owlnudge, an empathetic ADHD accountability mentor.
Break down this learning goal or resource: "${extracted?.title || goalText}" into a realistic, anti-overwhelm ${targetWeeks}-week roadmap.
${contentContext}

Requirements:
1. Max ${targetWeeks} progressive milestones.
2. Each milestone has 3-4 micro-tasks with 2-3 microSteps per task.
3. Each microStep MUST contain:
   - "title": short action title
   - "time": e.g. "45s", "2m", "10m"
   - "readingMaterial": concise 2-3 paragraph reading passage or mental model so the user can read and learn inside the app.
4. Automatically insert 2 buffer days every 7 days (type: 'BUFFER').
5. Return ONLY valid JSON with this schema:
{
  "title": string,
  "summary": string,
  "bufferDaysCount": number,
  "milestones": [
    {
      "id": string,
      "weekNumber": number,
      "title": string,
      "description": string,
      "tasks": [
        {
          "id": string,
          "title": string,
          "durationMinutes": number,
          "type": "TASK" | "BUFFER",
          "intuitionTip": string,
          "microSteps": [
            {
              "title": string,
              "time": string,
              "readingMaterial": string
            }
          ]
        }
      ]
    }
  ]
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

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
        return { source: 'ollama', ...parsed };
      }
    }
  } catch (err) {
    console.info('Ollama offline or timed out; utilizing Owlnudge deterministic ADHD Heuristic Slicer.');
  }

  // Fallback: Deterministic ADHD Heuristic Slicer with rich reading passages
  return generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes, extracted);
}

function generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes, extracted) {
  const isUrl = /^(http|https):\/\/[^ "]+$/.test(goalText.trim());
  const lower = (extracted?.title || goalText).toLowerCase();

  let detectedTitle = extracted?.title || goalText;
  let summary = `Structured ${targetWeeks}-week roadmap with progressive micro-goals, inline reading passages, and built-in buffer cushions.`;

  if (isUrl && !extracted?.title) {
    if (lower.includes('udemy.com')) {
      const pathPart = goalText.split('/course/')[1]?.split('/')[0]?.replace(/-/g, ' ') || 'Udemy Masterclass';
      detectedTitle = `Udemy: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Deconstructed Udemy video syllabus into 3 bite-sized weekly modules with 2 buffer days/week so course lag never causes guilt.`;
    } else if (lower.includes('medium.com')) {
      const pathPart = goalText.split('/').pop()?.replace(/-/g, ' ') || 'Deep Dive Article';
      detectedTitle = `Medium: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Sliced long-form engineering article into actionable mental models and applied exercises.`;
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      detectedTitle = `YouTube Tutorial: Masterclass`;
      summary = `Converted video playlist into single-concept sprints with dedicated rest buffers.`;
    }
  }

  // If user provided custom sections from a file or article:
  if (extracted?.sections && extracted.sections.length > 0) {
    const sectionTasks = extracted.sections.map((sec, idx) => ({
      id: `t_sec_${idx + 1}`,
      title: sec.title || `Module ${idx + 1}`,
      durationMinutes: dailyMinutes,
      type: 'TASK',
      intuitionTip: `Master the core intuition of ${sec.title}.`,
      microSteps: [
        {
          title: `Scan key concepts in ${sec.title} (30s)`,
          time: '45s',
          readingMaterial: sec.content || `Focus on understanding the core premise before applying the concept.`
        },
        {
          title: `Read breakdown & practical application (2m)`,
          time: '2m',
          readingMaterial: `**Deep Dive Takeaway:**\n\n${sec.content}\n\n*Reflective Prompt: How does this apply to your current project or challenge?*`
        },
        {
          title: `Summarize 1 takeaway in your own words (5m)`,
          time: '5m',
          readingMaterial: `Write down 1 single sentence that explains this concept to a 10-year-old. Once written, you have locked this pattern in memory.`
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

  // Default Coding & Algorithm Archetype
  const isCoding = /leetcode|code|programming|algorithm|interview|dp|recursion|system|react|python|javascript|rust/i.test(lower);

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

  // General Topic Fallback
  return {
    source: 'heuristic',
    title: detectedTitle,
    summary: summary,
    bufferDaysCount: targetWeeks * 2,
    milestones: [
      {
        id: 'm1',
        weekNumber: 1,
        title: 'Phase 1: Foundations & Core Concepts',
        description: 'Absorb the fundamental baseline with micro-reading modules.',
        tasks: [
          {
            id: 't1_1',
            title: 'Foundational Overview & Key Mental Models',
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
            title: 'Core Mechanics & Hands-on Implementation',
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

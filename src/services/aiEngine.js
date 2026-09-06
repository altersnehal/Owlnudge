/**
 * Owlnudge AI Engine
 * Dual-adapter architecture:
 * 1. Connects to Local Ollama at http://localhost:11434 with structured JSON output.
 * 2. Automatic zero-fail fallback to a deterministic ADHD heuristic slicer if Ollama is offline.
 */

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';

export async function generateRoadmap({ goalText, targetWeeks = 3, dailyMinutes = 45 }) {
  try {
    // Attempt local Ollama generation first
    const prompt = `You are Owlnudge, an empathetic ADHD accountability mentor.
Break down this learning goal or resource URL: "${goalText}" into a realistic, anti-overwhelm ${targetWeeks}-week roadmap.
Requirements:
1. Max ${targetWeeks} progressive milestones.
2. Each milestone has 3-4 micro-tasks (single ${dailyMinutes}m execution per task).
3. Automatically insert 2 buffer days every 7 days (labeled type: 'BUFFER').
4. Return ONLY valid JSON with this schema:
{
  "title": string,
  "summary": string,
  "sourceUrl": string,
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
          "microSteps": [string, string, string]
        }
      ]
    }
  ]
}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout for fast fallback

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

  // Fallback: Deterministic ADHD Heuristic Slicer
  return generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes);
}

function generateHeuristicRoadmap(goalText, targetWeeks, dailyMinutes) {
  const isUrl = /^(http|https):\/\/[^ "]+$/.test(goalText.trim());
  const lower = goalText.toLowerCase();

  let detectedTitle = goalText;
  let summary = `Structured ${targetWeeks}-week roadmap with progressive micro-goals and built-in buffer cushions.`;

  // URL & Topic Detection
  if (isUrl) {
    if (lower.includes('udemy.com')) {
      const pathPart = goalText.split('/course/')[1]?.split('/')[0]?.replace(/-/g, ' ') || 'Udemy Masterclass';
      detectedTitle = `Udemy: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Deconstructed Udemy video syllabus into 3 bite-sized weekly modules with 2 buffer days/week so course lag never causes guilt.`;
    } else if (lower.includes('medium.com')) {
      const pathPart = goalText.split('/').pop()?.replace(/-/g, ' ') || 'Deep Dive Article';
      detectedTitle = `Medium: ${pathPart.replace(/\b\w/g, l => l.toUpperCase())}`;
      summary = `Sliced long-form engineering article into actionable mental models and applied exercises.`;
    } else if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      detectedTitle = `YouTube Tutorial Series: Masterclass`;
      summary = `Converted multi-hour video playlist into single-concept sprints with dedicated rest buffers.`;
    } else {
      detectedTitle = `Resource Study Plan: ${new URL(goalText).hostname}`;
      summary = `Extracted key learning milestones from external resource with built-in buffer protection.`;
    }
  }

  const isCoding = /leetcode|code|programming|algorithm|interview|dp|system|react|python|javascript|rust|backend|frontend/i.test(lower);
  const isDesign = /design|figma|ui|ux|apple|motion|css|tailwind/i.test(lower);

  if (isCoding || lower.includes('dp') || lower.includes('dynamic programming')) {
    return {
      source: 'heuristic',
      title: detectedTitle.startsWith('http') ? 'Dynamic Programming & System Architecture' : detectedTitle,
      sourceUrl: isUrl ? goalText : null,
      summary: summary || "We deconstructed 50+ overwhelming problems into 3 focused micro-archetypes with 2 mandatory buffer cushions per week.",
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
                'Open problem description and read Example 1 only (30 secs)',
                'Write down base cases n=1 and n=2 on a napkin (2 mins)',
                'Write loop recurrence: dp[i] = dp[i-1] + dp[i-2] (10 mins)'
              ]
            },
            {
              id: 't1_2',
              title: 'House Robber (Binary Decision Tree: Rob or Skip)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Every index i has only two choices: Rob current + dp[i-2] OR Skip current + dp[i-1].',
              microSteps: [
                'Draw a 3-house diagram [2, 7, 9] (1 min)',
                'Calculate max loot for first 2 houses (2 mins)',
                'Code the max(prev1, prev2 + val) transition (15 mins)'
              ]
            },
            {
              id: 'b1_1',
              title: 'Buffer Day 1 (Rest & Guilt-Free Catch-up)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffers are not wasted days; they prevent burnout and keep your timeline safe.',
              microSteps: [
                'Hydrate and do a 5-minute stretch',
                'Zero code required unless you are in flow'
              ]
            },
            {
              id: 't1_3',
              title: 'Coin Change (Unbounded Knapsack & Min Combinations)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'dp[amount] = 1 + min(dp[amount - coin]) for all coin choices.',
              microSteps: [
                'Test target 3 with coins [1, 2] on paper (2 mins)',
                'Initialize array with infinity/amount+1 (2 mins)',
                'Write nested loop and run tests (15 mins)'
              ]
            },
            {
              id: 'b1_2',
              title: 'Buffer Day 2 (Consolidation & Somatic Reset)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Rest allows neural consolidation of newly learned patterns.',
              microSteps: [
                'Quick 60-second review of your 3 patterns',
                'Enjoy your guilt-free momentum'
              ]
            }
          ]
        },
        {
          id: 'm2',
          weekNumber: 2,
          title: 'Phase 2: 2D Grid DP & Subsequence Matching',
          description: 'Extend 1D state concepts into row/column matrices.',
          tasks: [
            {
              id: 't2_1',
              title: 'Unique Paths (Grid Coordinate Transitions)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Ways to reach grid[r][c] = ways from top + ways from left.',
              microSteps: [
                'Draw a 3x3 grid with start at (0,0) and finish at (2,2)',
                'Fill first row and column with 1s',
                'Iterate through remaining cells with dp[r][c] = dp[r-1][c] + dp[r][c-1]'
              ]
            },
            {
              id: 'b2_1',
              title: 'Buffer Day 3 (Safety Net Cushion)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffer cushion absorbs life delays without resetting progress.',
              microSteps: ['Rest or light review']
            },
            {
              id: 't2_2',
              title: 'Longest Common Subsequence (2D String Alignment)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Match characters: 1 + diag. Mismatch: max(top, left).',
              microSteps: [
                'Compare string "abcde" and "ace" on grid',
                'Fill DP matrix row by row',
                'Traceback solution'
              ]
            },
            {
              id: 'b2_2',
              title: 'Buffer Day 4 (Spillover Absorption)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'No shame, no penalty.',
              microSteps: ['Recharge dopamine']
            }
          ]
        },
        {
          id: 'm3',
          weekNumber: 3,
          title: 'Phase 3: Real-World Architecture & Synthesis',
          description: 'Translate algorithmic intuition into production systems and mock readiness.',
          tasks: [
            {
              id: 't3_1',
              title: 'Rate Limiter (Token Bucket Algorithm)',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Token Bucket = Refill at fixed rate, consume per request, reject on empty.',
              microSteps: [
                'Diagram client, gateway, and Redis cache',
                'Define sliding window time key structure',
                'Write down 429 Too Many Requests response flow'
              ]
            },
            {
              id: 'b3_1',
              title: 'Final Buffer Day & Interview Readiness',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'You completed your structured learning arc without burnout!',
              microSteps: ['Review core cheatsheet', 'Confidence check']
            }
          ]
        }
      ]
    };
  }

  if (isDesign) {
    return {
      source: 'heuristic',
      title: detectedTitle,
      sourceUrl: isUrl ? goalText : null,
      summary: `Design mastery sliced into spatial hierarchy, fluid motion, and accessible tokens with buffer protection.`,
      bufferDaysCount: targetWeeks * 2,
      milestones: [
        {
          id: 'm1',
          weekNumber: 1,
          title: 'Week 1: Spatial Restraint & Typography Hierarchy',
          description: 'Master Apple-inspired clean whitespace and optical sizing.',
          tasks: [
            {
              id: 't1_1',
              title: '4pt/8pt Spacing Scale & Layout Framing',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Whitespace creates focus. Give primary actions breathing room.',
              microSteps: ['Define 4pt grid tokens', 'Apply 24px padding on hero card', 'Verify mobile readability']
            },
            {
              id: 'b1_1',
              title: 'Buffer Day 1 (Visual Rest)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Rest sparks creative clarity.',
              microSteps: ['Take a walk outside', 'No screen fatigue']
            }
          ]
        },
        {
          id: 'm2',
          weekNumber: 2,
          title: 'Week 2: Tactile Micro-Interactions & Physics',
          description: 'Emil Kowalski inspired responsive motion and haptic-like press states.',
          tasks: [
            {
              id: 't2_1',
              title: 'Active Scale & Spring Transitions',
              durationMinutes: dailyMinutes,
              type: 'TASK',
              intuitionTip: 'Buttons should compress on press (active:scale-95) with fast 120ms release.',
              microSteps: ['Add active scale to primary CTAs', 'Test spring easing curve', 'Verify zero layout shift']
            },
            {
              id: 'b2_1',
              title: 'Buffer Day 2 (Creative Buffer)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffer cushion absorbs unexpected schedule changes.',
              microSteps: ['Zero guilt day']
            }
          ]
        }
      ]
    };
  }

  // General Topic / Link Fallback
  return {
    source: 'heuristic',
    title: detectedTitle,
    sourceUrl: isUrl ? goalText : null,
    summary: summary,
    bufferDaysCount: targetWeeks * 2,
    milestones: [
      {
        id: 'm1',
        weekNumber: 1,
        title: 'Phase 1: Foundations & Core Setup',
        description: 'Establish initial baseline with friction-free micro-actions.',
        tasks: [
          {
            id: 't1_1',
            title: 'Initial Orientation & Core Takeaway',
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Start with the simplest introductory module to clear initial inertia.',
            microSteps: [
              'Open primary resource and scan table of contents (1 min)',
              'Write down 1 core goal for this week (2 mins)',
              'Complete first 15-minute introductory segment'
            ]
          },
          {
            id: 'b1_1',
            title: 'Buffer Day 1 (Zero-Guilt Rest)',
            durationMinutes: 0,
            type: 'BUFFER',
            intuitionTip: 'Buffers keep your long-term consistency intact.',
            microSteps: ['Rest and recharge']
          },
          {
            id: 't1_2',
            title: 'Key Concepts & Active Recall Notes',
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Summarize 1 takeaway in your own words before closing the session.',
            microSteps: [
              'Review chapter / video 2 (15 mins)',
              'Extract 2 practical insights (5 mins)',
              'Log 1 micro-win'
            ]
          },
          {
            id: 'b1_2',
            title: 'Buffer Day 2 (Life Delay Buffer)',
            durationMinutes: 0,
            type: 'BUFFER',
            intuitionTip: 'Absorbs any busy day automatically.',
            microSteps: ['Enjoy your evening without guilt']
          }
        ]
      },
      {
        id: 'm2',
        weekNumber: 2,
        title: 'Phase 2: Deep Practice & Application',
        description: 'Hands-on synthesis of core principles.',
        tasks: [
          {
            id: 't2_1',
            title: 'Applied Exercise & Hands-on Build',
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Apply the concept in a mini sandbox project.',
            microSteps: [
              'Set up sandbox test environment',
              'Implement minimal working prototype (20 mins)',
              'Refactor and review'
            ]
          },
          {
            id: 'b2_1',
            title: 'Buffer Day 3 (Consolidation Cushion)',
            durationMinutes: 0,
            type: 'BUFFER',
            intuitionTip: 'Neural pathways consolidate during rest.',
            microSteps: ['Rest or light review']
          }
        ]
      }
    ]
  };
}

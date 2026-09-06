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
Break down this learning goal: "${goalText}" into a realistic, anti-overwhelm 3-week roadmap.
Requirements:
1. Max 3 progressive milestones.
2. Each milestone has 3-4 micro-tasks (single 30-45m execution per task).
3. Automatically insert 2 buffer days every 7 days (labeled type: 'BUFFER').
4. Return ONLY valid JSON with this schema:
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
        model: 'llama3.2', // or default installed model
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
  const isCoding = /leetcode|code|programming|algorithm|interview|dp|system/i.test(goalText);

  if (isCoding) {
    return {
      source: 'heuristic',
      title: goalText,
      summary: "We deconstructed 50+ overwhelming problems into 3 focused micro-archetypes with 2 mandatory buffer cushions per week.",
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
                'Open LeetCode #70 and read Example 1 only (30 secs)',
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
              title: 'Buffer Day 3 (Safety Net)',
              durationMinutes: 0,
              type: 'BUFFER',
              intuitionTip: 'Buffer cushion absorbs life delays.',
              microSteps: ['Rest or light review']
            }
          ]
        },
        {
          id: 'm3',
          weekNumber: 3,
          title: 'Phase 3: High-Yield System Design & Mock Polish',
          description: 'Translate algorithmic intuition into architectural scalability.',
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

  // General Goal Fallback
  return {
    source: 'heuristic',
    title: goalText,
    summary: `Structured ${targetWeeks}-week roadmap with progressive micro-goals and built-in buffer days.`,
    bufferDaysCount: targetWeeks * 2,
    milestones: [
      {
        id: 'm1',
        weekNumber: 1,
        title: 'Foundation & Core Setup',
        description: 'Establish the initial baseline with friction-free 30m blocks.',
        tasks: [
          {
            id: 't1_1',
            title: 'Initial Workspace & Orientation',
            durationMinutes: dailyMinutes,
            type: 'TASK',
            intuitionTip: 'Start with the simplest setup step to clear initial inertia.',
            microSteps: [
              'Open primary workspace and create 1 document/file',
              'Outline the first 3 subtopics in bullet points',
              'Spend 15 mins reviewing topic 1'
            ]
          },
          {
            id: 'b1_1',
            title: 'Buffer & Recovery Day 1',
            durationMinutes: 0,
            type: 'BUFFER',
            intuitionTip: 'Zero penalty rest day.',
            microSteps: ['Rest and recharge']
          }
        ]
      }
    ]
  };
}

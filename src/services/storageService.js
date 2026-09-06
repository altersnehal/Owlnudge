/**
 * Owlnudge Local Storage & Markdown Export Service
 * Manages local JSON persistence and clean Markdown export.
 */

const STORAGE_KEY = 'owlnudge_app_state_v1';

export function loadStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading state from localStorage', e);
  }
  return null;
}

export function saveStoredState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state to localStorage', e);
  }
}

export function exportToMarkdown(roadmap, stats) {
  if (!roadmap) return;

  let md = `# Owlnudge · Learning Roadmap & Momentum Ledger\n\n`;
  md += `**Goal:** ${roadmap.title}\n`;
  md += `**Buffer Days Reserved:** ${roadmap.bufferDaysCount} days\n`;
  md += `**Bounce-Back Score:** ${stats?.bounceBackScore || 100}%\n`;
  md += `**Focus Minutes Completed:** ${stats?.focusMinutes || 0} mins\n\n`;
  md += `## Milestones & Task Progress\n\n`;

  roadmap.milestones.forEach((m, mIdx) => {
    md += `### Milestone ${m.weekNumber}: ${m.title}\n`;
    md += `*${m.description}*\n\n`;
    m.tasks.forEach((t) => {
      const check = t.completed ? '[x]' : '[ ]';
      const badge = t.type === 'BUFFER' ? '🛡️ (BUFFER DAY)' : `(${t.durationMinutes} mins)`;
      md += `- ${check} **${t.title}** ${badge}\n`;
      if (t.intuitionTip) {
        md += `  > 💡 *${t.intuitionTip}*\n`;
      }
    });
    md += `\n`;
  });

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `owlnudge-roadmap-${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

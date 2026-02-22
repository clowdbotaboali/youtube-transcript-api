export function extractTodos(aiResult) {
  const todos = [];
  let currentMainTask = null;
  let mainTaskCounter = 0;
  let subTaskCounter = 0;

  const lines = String(aiResult || '').split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Matches markdown headings that include step numbering:
    // ### Step 1: ...
    // #### 1.2 ...
    const mainTaskMatch = line.match(/^#{3}\s*(?:step|phase|task)?\s*\d+[:.)-]?\s*(.+)$/iu);
    if (mainTaskMatch) {
      mainTaskCounter++;
      subTaskCounter = 0;
      currentMainTask = {
        id: `main-${mainTaskCounter}`,
        title: mainTaskMatch[1].trim(),
        completed: false,
        subtasks: []
      };
      todos.push(currentMainTask);
      continue;
    }

    const subTaskMatch = line.match(/^#{4}\s*(?:task)?\s*\d+\.\d+[:.)-]?\s*(.+)$/iu);
    if (subTaskMatch && currentMainTask) {
      subTaskCounter++;
      currentMainTask.subtasks.push({
        id: `sub-${mainTaskCounter}-${subTaskCounter}`,
        title: subTaskMatch[1].trim(),
        completed: false
      });
      continue;
    }

    const checkboxMatch = line.match(/^[-*]\s*\[?\s*(?:x| )?\s*\]?\s*(.+)$/iu);
    if (checkboxMatch) {
      if (currentMainTask && currentMainTask.subtasks.length > 0) {
        subTaskCounter++;
        currentMainTask.subtasks.push({
          id: `sub-${mainTaskCounter}-${subTaskCounter}`,
          title: checkboxMatch[1].trim(),
          completed: false
        });
      } else {
        mainTaskCounter++;
        subTaskCounter = 0;
        currentMainTask = {
          id: `main-${mainTaskCounter}`,
          title: checkboxMatch[1].trim(),
          completed: false,
          subtasks: []
        };
        todos.push(currentMainTask);
      }
    }
  }

  if (todos.length === 0) {
    return extractStepsAsTodos(aiResult);
  }

  return todos;
}

function extractStepsAsTodos(aiResult) {
  const todos = [];
  const lines = String(aiResult || '').split('\n');
  let currentSection = null;
  let sectionCounter = 0;
  let stepCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const sectionMatch = line.match(/^##\s+\d*\.?\s*(.+)$/u);
    if (sectionMatch) {
      const title = sectionMatch[1].trim();
      sectionCounter++;
      stepCounter = 0;
      currentSection = {
        id: `section-${sectionCounter}`,
        title,
        completed: false,
        subtasks: []
      };
      todos.push(currentSection);
      continue;
    }

    const stepMatch = line.match(/^(?:\d+\.|[-*])\s+(?:\*\*)?(.+?)(?:\*\*)?:?$/u);
    if (stepMatch && currentSection) {
      const stepTitle = stepMatch[1].trim();
      if (stepTitle.length > 5) {
        stepCounter++;
        currentSection.subtasks.push({
          id: `step-${sectionCounter}-${stepCounter}`,
          title: stepTitle,
          completed: false
        });
      }
    }
  }

  return todos;
}

export function calculateProgress(todos) {
  let total = 0;
  let completed = 0;

  todos.forEach((mainTask) => {
    if (mainTask.subtasks && mainTask.subtasks.length > 0) {
      total += mainTask.subtasks.length;
      completed += mainTask.subtasks.filter((sub) => sub.completed).length;
    } else {
      total += 1;
      if (mainTask.completed) completed += 1;
    }
  });

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function saveTodoState(videoId, todos) {
  const key = `todo-state-${videoId}`;
  localStorage.setItem(key, JSON.stringify(todos));
}

export function loadTodoState(videoId) {
  const key = `todo-state-${videoId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

export function exportTodosAsMarkdown(todos, videoTitle = 'Todo List') {
  let markdown = `# ${videoTitle}\n\n`;
  markdown += `**Created:** ${new Date().toLocaleDateString()}\n\n`;
  markdown += `---\n\n`;

  todos.forEach((mainTask, mainIndex) => {
    const checkbox = mainTask.completed ? '[x]' : '[ ]';
    markdown += `## ${checkbox} ${mainIndex + 1}. ${mainTask.title}\n\n`;

    if (mainTask.subtasks && mainTask.subtasks.length > 0) {
      mainTask.subtasks.forEach((subTask, subIndex) => {
        const subCheckbox = subTask.completed ? '[x]' : '[ ]';
        markdown += `- ${subCheckbox} ${mainIndex + 1}.${subIndex + 1}. ${subTask.title}\n`;
      });
      markdown += '\n';
    }
  });

  markdown += `---\n\n`;
  markdown += `**Completion:** ${calculateProgress(todos)}%\n`;
  return markdown;
}

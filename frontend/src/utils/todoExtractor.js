/**
 * استخراج المهام من نص AI وتحويلها لـ Todo List منظم
 */

export function extractTodos(aiResult) {
  const todos = [];
  let currentMainTask = null;
  let mainTaskCounter = 0;
  let subTaskCounter = 0;

  // تقسيم النص لسطور
  const lines = aiResult.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // تحديد المهام الرئيسية
    // البحث عن: ### 🔹 المرحلة X: أو #### ☐ المهمة X
    const mainTaskMatch = line.match(/^###?\s*[🔹☐]?\s*(?:المرحلة|المهمة)\s*\d+[:.]\s*(.+)/);
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

    // تحديد المهام الفرعية داخل مهمة رئيسية
    // البحث عن: #### ☐ المهمة X.Y:
    const subTaskMatch = line.match(/^####\s*☐\s*(?:المهمة)?\s*\d+\.\d+[:.]\s*(.+)/);
    if (subTaskMatch && currentMainTask) {
      subTaskCounter++;
      currentMainTask.subtasks.push({
        id: `sub-${mainTaskCounter}-${subTaskCounter}`,
        title: subTaskMatch[1].trim(),
        completed: false
      });
      continue;
    }

    // خطة احتياطية: إذا كان السطر يبدأ بـ ☐ أو - [ ]
    const checkboxMatch = line.match(/^[-*]\s*\[?\s*☐\s*\]?\s*(.+)/);
    if (checkboxMatch) {
      if (currentMainTask && currentMainTask.subtasks.length > 0) {
        // إضافة كمهمة فرعية
        subTaskCounter++;
        currentMainTask.subtasks.push({
          id: `sub-${mainTaskCounter}-${subTaskCounter}`,
          title: checkboxMatch[1].trim(),
          completed: false
        });
      } else {
        // إنشاء مهمة رئيسية جديدة
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

  // إذا لم نجد أي مهام بالطريقة المنظمة، نحاول استخراج الخطوات
  if (todos.length === 0) {
    return extractStepsAsTodos(aiResult);
  }

  return todos;
}

/**
 * استخراج الخطوات كـ Todo List (fallback)
 */
function extractStepsAsTodos(aiResult) {
  const todos = [];
  const lines = aiResult.split('\n');
  let currentSection = null;
  let sectionCounter = 0;
  let stepCounter = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // البحث عن عناوين الأقسام (## القسم)
    const sectionMatch = line.match(/^##\s+\d*\.?\s*(.+)/);
    if (sectionMatch) {
      const title = sectionMatch[1].trim();
      // تجاهل الأقسام غير المفيدة
      if (!title.includes('نظرة عامة') && 
          !title.includes('الهدف') && 
          !title.includes('الأدوات') && 
          !title.includes('الروابط') &&
          !title.includes('نصائح')) {
        sectionCounter++;
        stepCounter = 0;
        currentSection = {
          id: `section-${sectionCounter}`,
          title: title,
          completed: false,
          subtasks: []
        };
        todos.push(currentSection);
      }
      continue;
    }

    // البحث عن خطوات (1. أو - أو *)
    const stepMatch = line.match(/^(?:\d+\.|[-*])\s+(?:\*\*)?(.+?)(?:\*\*)?:?$/);
    if (stepMatch && currentSection) {
      stepCounter++;
      const stepTitle = stepMatch[1].trim();
      // تجاهل السطور القصيرة جداً
      if (stepTitle.length > 10) {
        currentSection.subtasks.push({
          id: `step-${sectionCounter}-${stepCounter}`,
          title: stepTitle,
          completed: false
        });
      }
    }
  }

  // إذا ما لقينا حاجة، نرجع قائمة فاضية
  return todos;
}

/**
 * حساب نسبة الإنجاز
 */
export function calculateProgress(todos) {
  let total = 0;
  let completed = 0;

  todos.forEach(mainTask => {
    if (mainTask.subtasks && mainTask.subtasks.length > 0) {
      // لو فيه مهام فرعية، نحسبها بس
      total += mainTask.subtasks.length;
      completed += mainTask.subtasks.filter(sub => sub.completed).length;
    } else {
      // لو مافيش مهام فرعية، نحسب المهمة الرئيسية
      total += 1;
      if (mainTask.completed) completed += 1;
    }
  });

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

/**
 * حفظ حالة Todo List في localStorage
 */
export function saveTodoState(videoId, todos) {
  const key = `todo-state-${videoId}`;
  localStorage.setItem(key, JSON.stringify(todos));
}

/**
 * استرجاع حالة Todo List من localStorage
 */
export function loadTodoState(videoId) {
  const key = `todo-state-${videoId}`;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : null;
}

/**
 * تصدير Todo List كـ markdown
 */
export function exportTodosAsMarkdown(todos, videoTitle = 'قائمة المهام') {
  let markdown = `# ${videoTitle}\n\n`;
  markdown += `**تاريخ الإنشاء:** ${new Date().toLocaleDateString('ar-EG')}\n\n`;
  markdown += `---\n\n`;

  todos.forEach((mainTask, mainIndex) => {
    const checkbox = mainTask.completed ? '☑' : '☐';
    markdown += `## ${checkbox} ${mainIndex + 1}. ${mainTask.title}\n\n`;

    if (mainTask.subtasks && mainTask.subtasks.length > 0) {
      mainTask.subtasks.forEach((subTask, subIndex) => {
        const subCheckbox = subTask.completed ? '☑' : '☐';
        markdown += `   ${subCheckbox} ${mainIndex + 1}.${subIndex + 1}. ${subTask.title}\n`;
      });
      markdown += '\n';
    }
  });

  markdown += `---\n\n`;
  markdown += `**النسبة المكتملة:** ${calculateProgress(todos)}%\n`;

  return markdown;
}

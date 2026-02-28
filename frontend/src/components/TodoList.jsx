import { useMemo, useState } from 'react';
import { FaCheckSquare, FaRegSquare, FaChevronDown, FaChevronLeft, FaDownload, FaRedo } from 'react-icons/fa';
import { calculateProgress, saveTodoState, exportTodosAsMarkdown } from '../utils/todoExtractor';
import { LANG, tr } from '../utils/lang';
import { downloadTextAsPdf } from '../utils/pdf';

function TodoList({ todos, videoId, videoTitle, lang = LANG.ar }) {
  const [todoState, setTodoState] = useState(todos);
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries((todos || []).map((_, index) => [index, true]))
  );

  const progress = useMemo(() => calculateProgress(todoState), [todoState]);

  const updateState = (next) => {
    setTodoState(next);
    if (videoId) saveTodoState(videoId, next);
  };

  const toggleMainTask = (mainIndex) => {
    const next = [...todoState];
    const mainTask = next[mainIndex];
    mainTask.completed = !mainTask.completed;

    if (mainTask.subtasks && mainTask.subtasks.length > 0) {
      mainTask.subtasks.forEach((sub) => {
        sub.completed = mainTask.completed;
      });
    }

    updateState(next);
  };

  const toggleSubTask = (mainIndex, subIndex) => {
    const next = [...todoState];
    const subTask = next[mainIndex].subtasks[subIndex];
    subTask.completed = !subTask.completed;

    const mainTask = next[mainIndex];
    mainTask.completed = mainTask.subtasks.every((sub) => sub.completed);

    updateState(next);
  };

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const resetProgress = () => {
    if (!window.confirm(tr(lang, 'إعادة تعيين كل المهام؟', 'Reset all tasks?'))) return;
    const resetState = todoState.map((task) => ({
      ...task,
      completed: false,
      subtasks: task.subtasks ? task.subtasks.map((sub) => ({ ...sub, completed: false })) : []
    }));
    updateState(resetState);
  };

  const handleExport = () => {
    const markdown = exportTodosAsMarkdown(todoState, videoTitle || tr(lang, 'قائمة المهام', 'Todo List'));
    downloadTextAsPdf({
      filename: `todo-list-${videoId || Date.now()}.pdf`,
      title: videoTitle || tr(lang, 'قائمة المهام', 'Todo List', 'Liste de taches'),
      metadata: [
        `${tr(lang, 'معرف الفيديو', 'Video ID', 'ID video')}: ${videoId || '-'}`,
        `${tr(lang, 'نسبة الإنجاز', 'Completion', 'Progression')}: ${progress}%`
      ],
      body: markdown
    });
  };

  if (!todoState || todoState.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 text-sm">{tr(lang, 'لم يتم العثور على مهام منظمة.', 'No structured tasks were detected.')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FaCheckSquare className="text-2xl" />
            <h3 className="text-xl font-bold">{tr(lang, 'قائمة المهام', 'Task List')}</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={resetProgress} className="p-2 hover:bg-blue-500 rounded-lg transition" title={tr(lang, 'إعادة تعيين', 'Reset')}>
              <FaRedo />
            </button>
            <button onClick={handleExport} className="p-2 hover:bg-blue-500 rounded-lg transition" title={tr(lang, 'تصدير PDF', 'Export PDF', 'Exporter PDF')}>
              <FaDownload />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{tr(lang, 'التقدم', 'Progress')}</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {todoState.map((mainTask, mainIndex) => (
          <div key={mainTask.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className={`p-3 transition ${mainTask.completed ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => toggleMainTask(mainIndex)} className="mt-1 text-2xl focus:outline-none">
                  {mainTask.completed ? (
                    <FaCheckSquare className="text-green-600" />
                  ) : (
                    <FaRegSquare className="text-gray-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-semibold text-gray-800 ${mainTask.completed ? 'line-through text-gray-500' : ''}`}>
                      {mainIndex + 1}. {mainTask.title}
                    </h4>

                    {mainTask.subtasks && mainTask.subtasks.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection(mainIndex);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition"
                      >
                        {expandedSections[mainIndex] ? (
                          <FaChevronDown className="text-gray-600" />
                        ) : (
                          <FaChevronLeft className="text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>

                  {mainTask.subtasks && mainTask.subtasks.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {mainTask.subtasks.filter((s) => s.completed).length} / {mainTask.subtasks.length} {tr(lang, 'مكتملة', 'done')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {mainTask.subtasks && mainTask.subtasks.length > 0 && expandedSections[mainIndex] && (
              <div className="bg-white border-t border-gray-200">
                {mainTask.subtasks.map((subTask, subIndex) => (
                  <div
                    key={subTask.id}
                    className={`p-3 pr-12 flex items-start gap-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition ${
                      subTask.completed ? 'bg-green-50' : ''
                    }`}
                  >
                    <button
                      onClick={() => toggleSubTask(mainIndex, subIndex)}
                      className="mt-1 text-xl focus:outline-none"
                    >
                      {subTask.completed ? (
                        <FaCheckSquare className="text-green-600" />
                      ) : (
                        <FaRegSquare className="text-gray-400" />
                      )}
                    </button>

                    <p className={`text-sm text-gray-700 flex-1 ${subTask.completed ? 'line-through text-gray-500' : ''}`}>
                      {mainIndex + 1}.{subIndex + 1}. {subTask.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TodoList;

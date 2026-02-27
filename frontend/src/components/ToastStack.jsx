function ToastStack({ items = [], onDismiss }) {
  if (!items.length) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md space-y-2">
      {items.map((item) => {
        const tone =
          item.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : item.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-blue-50 border-blue-200 text-blue-700';

        return (
          <div
            key={item.id}
            className={`border rounded-lg px-4 py-3 shadow-sm flex items-start justify-between gap-3 ${tone}`}
          >
            <p className="text-sm font-medium">{item.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(item.id)}
              className="text-xs opacity-70 hover:opacity-100"
              aria-label="Dismiss notification"
            >
              X
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastStack;

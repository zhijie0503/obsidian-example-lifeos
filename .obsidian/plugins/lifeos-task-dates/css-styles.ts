export const addPluginStyles = () => {
    const styleEl = document.createElement('style');
    styleEl.id = 'lifeos-task-dates-styles';
    styleEl.textContent = `
        /* 日期选择器模态框样式 */
        .lifeos-date-picker-modal {
            padding: 20px;
            max-width: 400px;
        }

        .lifeos-date-picker-modal h2 {
            margin-top: 0;
            margin-bottom: 20px;
            text-align: center;
        }

        .lifeos-date-picker-modal .date-preview {
            font-size: 1.2em;
            text-align: center;
            margin-bottom: 20px;
            font-weight: bold;
            padding: 10px;
            border-radius: 4px;
            background-color: var(--background-secondary);
        }

        .lifeos-date-picker-modal .date-preset-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
            justify-content: center;
        }

        .lifeos-date-picker-modal .date-preset-buttons button {
            padding: 5px 10px;
            border-radius: 4px;
            background-color: var(--interactive-normal);
            cursor: pointer;
        }

        .lifeos-date-picker-modal .date-preset-buttons button:hover {
            background-color: var(--interactive-hover);
        }

        .lifeos-date-picker-modal .date-picker-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 20px;
        }

        .lifeos-date-picker-modal .date-picker-footer button {
            padding: 8px 16px;
            border-radius: 4px;
        }

        .lifeos-date-picker-modal .date-picker-footer button.mod-cta {
            background-color: var(--interactive-accent);
            color: var(--text-on-accent);
        }
        
        /* 任务日期高亮样式 */
        .task-due-date {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 4px;
            font-size: 0.85em;
        }

        .task-due-date.due-today {
            background-color: var(--color-red);
            color: white;
        }

        .task-due-date.due-tomorrow {
            background-color: var(--color-orange);
            color: white;
        }

        .task-due-date.due-soon {
            background-color: var(--color-yellow);
            color: black;
        }

        .task-due-date.due-future {
            background-color: var(--color-green);
            color: white;
        }

        .task-due-date.overdue {
            background-color: var(--color-red);
            color: white;
            font-weight: bold;
        }
    `;
    document.head.appendChild(styleEl);
    return styleEl;
};

export const removePluginStyles = () => {
    const styleEl = document.getElementById('lifeos-task-dates-styles');
    if (styleEl) {
        styleEl.remove();
    }
}; 
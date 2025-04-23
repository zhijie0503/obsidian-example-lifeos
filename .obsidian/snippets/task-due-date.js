// LifeOS任务截止日期设置功能

class TaskDueDatePlugin {
    constructor() {
        this.app = app;
        this.registerEvent();
    }

    registerEvent() {
        // 监听编辑器变化事件
        this.app.workspace.on("editor-change", (editor, info) => {
            this.handleEditorChange(editor, info);
        });
    }

    handleEditorChange(editor, info) {
        if (!editor) return;

        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        
        // 检查是否在任务行并且输入了"due"
        if (this.isTaskLine(line) && line.endsWith(" due")) {
            // 移除"due"字样
            const newLine = line.substring(0, line.length - 3).trimEnd();
            
            // 插入"due"日期选择框
            setTimeout(() => {
                // 更新行内容，删除"due"
                editor.setLine(cursor.line, newLine);
                
                // 创建日期选择界面
                this.showDatePicker(editor, cursor.line, newLine);
            }, 10);
        }
    }

    isTaskLine(line) {
        // 检查是否是任务行（Markdown任务语法）
        return line.trim().match(/^- \[[x ]\]/i);
    }

    showDatePicker(editor, lineNumber, lineContent) {
        // 创建日期选择器
        const datePickerContainer = document.createElement("div");
        datePickerContainer.className = "lifeos-date-picker-container";
        datePickerContainer.style.position = "absolute";
        
        // 获取编辑器中光标位置
        const lineCoords = editor.charCoords({line: lineNumber, ch: lineContent.length});
        datePickerContainer.style.top = lineCoords.bottom + "px";
        datePickerContainer.style.left = lineCoords.left + "px";
        
        // 创建日期输入框
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.className = "lifeos-date-picker";
        dateInput.value = this.getCurrentDate();
        datePickerContainer.appendChild(dateInput);
        
        // 创建确认按钮
        const confirmButton = document.createElement("button");
        confirmButton.innerText = "确定";
        confirmButton.className = "lifeos-date-confirm";
        datePickerContainer.appendChild(confirmButton);
        
        // 处理确认事件
        confirmButton.addEventListener("click", () => {
            const selectedDate = dateInput.value;
            if (selectedDate) {
                const formattedDate = this.formatDate(selectedDate);
                const newLineContent = `${lineContent} @${formattedDate}`;
                editor.setLine(lineNumber, newLineContent);
                
                // 设置光标到行尾
                editor.setCursor({
                    line: lineNumber,
                    ch: newLineContent.length
                });
            }
            
            // 移除日期选择器
            datePickerContainer.remove();
        });
        
        // 添加到DOM
        document.body.appendChild(datePickerContainer);
        
        // 自动聚焦日期输入框
        dateInput.focus();
    }

    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDate(dateString) {
        // 将日期格式化为YYYY-MM-DD
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 初始化插件
const initTaskDueDatePlugin = () => {
    if (window.taskDueDatePlugin) {
        return;
    }
    
    window.taskDueDatePlugin = new TaskDueDatePlugin();
    console.log("LifeOS任务截止日期设置功能已启用");
};

// 等待Obsidian API加载完成
const checkAndInitPlugin = () => {
    if (window.app) {
        initTaskDueDatePlugin();
    } else {
        setTimeout(checkAndInitPlugin, 100);
    }
};

checkAndInitPlugin(); 
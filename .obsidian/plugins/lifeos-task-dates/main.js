const { Plugin, MarkdownView, Notice } = require('obsidian');

class LifeOSTaskDates extends Plugin {
  async onload() {
    console.log('加载 LifeOS 任务截止日期插件');

    // 监听编辑器变更事件
    this.registerEvent(
      this.app.workspace.on('editor-change', (editor, view) => {
        if (view instanceof MarkdownView) {
          this.handleEditorChange(editor, view);
        }
      })
    );

    // 添加设置菜单项
    this.addSettingTab(new LifeOSTaskDatesSettingTab(this.app, this));
    
    // 注册命令：为当前选中任务添加截止日期
    this.addCommand({
      id: 'add-due-date-to-task',
      name: '为当前任务添加截止日期',
      editorCallback: (editor, view) => {
        this.addDueDateToSelectedTask(editor, view);
      }
    });
    
    // 初始化设置
    this.settings = await this.loadData() || {
      triggerWord: 'due',
      dateFormat: 'YYYY-MM-DD'
    };
  }

  onunload() {
    console.log('卸载 LifeOS 任务截止日期插件');
  }
  
  handleEditorChange(editor, view) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    const textBeforeCursor = line.substring(0, cursor.ch);
    
    // 检查是否是任务项并且输入了触发词
    if (textBeforeCursor.match(/- \[ \].*\s+due$/i)) {
      this.showDatePicker(editor, cursor);
    }
  }
  
  async showDatePicker(editor, cursor) {
    // 创建日期选择器容器
    const container = document.createElement('div');
    container.className = 'lifeos-date-picker-container';
    
    // 创建日期输入框
    const datePicker = document.createElement('input');
    datePicker.type = 'date';
    datePicker.className = 'lifeos-date-picker';
    
    // 设置默认日期为今天
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${yyyy}-${mm}-${dd}`;
    
    // 创建确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'lifeos-date-confirm';
    confirmBtn.textContent = '确认';
    
    // 添加元素到容器
    container.appendChild(datePicker);
    container.appendChild(confirmBtn);
    
    // 计算位置并显示
    const coords = editor.charCoords(cursor);
    container.style.position = 'absolute';
    container.style.left = `${coords.left}px`;
    container.style.top = `${coords.bottom}px`;
    
    // 添加到文档
    document.body.appendChild(container);
    
    // 设置按钮点击事件
    confirmBtn.addEventListener('click', () => {
      const selectedDate = datePicker.value;
      this.insertDueDate(editor, cursor, selectedDate);
      document.body.removeChild(container);
    });
    
    // 聚焦日期选择器
    datePicker.focus();
  }
  
  insertDueDate(editor, cursor, date) {
    // 格式化日期
    const formattedDate = this.formatDate(date, this.settings.dateFormat);
    
    // 获取当前行
    const line = editor.getLine(cursor.line);
    
    // 移除触发词并添加日期
    const newLine = line.replace(
      /\s+due$/i, 
      ` @due(${formattedDate})`
    );
    
    // 更新行
    editor.setLine(cursor.line, newLine);
    
    // 显示通知
    new Notice(`已设置截止日期: ${formattedDate}`);
  }
  
  formatDate(dateString, format) {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    // 简单的格式化，可以根据需要扩展
    return format
      .replace('YYYY', yyyy)
      .replace('MM', mm)
      .replace('DD', dd);
  }
  
  addDueDateToSelectedTask(editor, view) {
    const cursor = editor.getCursor();
    const line = editor.getLine(cursor.line);
    
    if (line.match(/- \[ \]/i)) {
      this.showDatePicker(editor, cursor);
    } else {
      new Notice('请选择一个任务项');
    }
  }
  
  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class LifeOSTaskDatesSettingTab {
  constructor(app, plugin) {
    this.app = app;
    this.plugin = plugin;
  }
  
  display() {
    // 设置界面的实现可以根据需要扩展
    const {containerEl} = this;
    containerEl.empty();
    
    containerEl.createEl('h2', {text: 'LifeOS 任务截止日期设置'});
    
    new Setting(containerEl)
      .setName('触发词')
      .setDesc('输入此词后会触发日期选择')
      .addText(text => text
        .setValue(this.plugin.settings.triggerWord)
        .onChange(async (value) => {
          this.plugin.settings.triggerWord = value;
          await this.plugin.saveSettings();
        }));
        
    new Setting(containerEl)
      .setName('日期格式')
      .setDesc('设置截止日期的显示格式')
      .addText(text => text
        .setValue(this.plugin.settings.dateFormat)
        .onChange(async (value) => {
          this.plugin.settings.dateFormat = value;
          await this.plugin.saveSettings();
        }));
  }
}

module.exports = LifeOSTaskDates; 
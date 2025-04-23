import { Editor, MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { LifeOSTaskDatesSettings, DEFAULT_SETTINGS, LifeOSTaskDatesSettingTab } from './settings';
import './styles.css';
import { DatePickerModal } from './date-picker-modal';
import { format, isAfter, isBefore, parseISO, addDays } from 'date-fns';
import { addPluginStyles, removePluginStyles } from './css-styles';

export default class LifeOSTaskDates extends Plugin {
    settings: LifeOSTaskDatesSettings;

    async onload() {
        await this.loadSettings();

        // 注册设置选项卡
        this.addSettingTab(new LifeOSTaskDatesSettingTab(this.app, this));

        // 注册一个编辑器上下文菜单项
        this.registerEvent(
            this.app.workspace.on('editor-menu', (menu, editor, view) => {
                menu.addItem((item) => {
                    item.setTitle('添加截止日期')
                        .setIcon('calendar')
                        .onClick(() => {
                            new DatePickerModal(this.app, (selectedDate) => {
                                const dateStr = format(selectedDate, this.settings.dateFormat);
                                editor.replaceSelection(`截止: ${dateStr}`);
                            }).open();
                        });
                });
            })
        );

        // 注册命令：添加默认截止日期（今天+设置天数）
        this.addCommand({
            id: 'add-default-due-date',
            name: '添加默认截止日期',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                const defaultDate = addDays(new Date(), this.settings.defaultDueDays);
                const dateStr = format(defaultDate, this.settings.dateFormat);
                editor.replaceSelection(`截止: ${dateStr}`);
                new Notice(`已添加截止日期：${dateStr}`);
            }
        });

        // 监听编辑器变化，以便在输入触发词后显示日期选择器
        this.registerEvent(
            this.app.workspace.on('editor-change', (editor: Editor, view: MarkdownView) => {
                const cursor = editor.getCursor();
                const line = editor.getLine(cursor.line);

                // 检查光标前文本是否有触发词
                for (const word of this.settings.triggerWords) {
                    if (line.endsWith(word) || line.endsWith(`${word}:`)) {
                        // 显示日期选择器
                        new DatePickerModal(this.app, (selectedDate) => {
                            const dateStr = format(selectedDate, this.settings.dateFormat);
                            // 替换触发词为完整的截止日期格式
                            const newLine = line.replace(
                                new RegExp(`${word}:?$`), 
                                `${word}: ${dateStr}`
                            );
                            editor.setLine(cursor.line, newLine);
                        }).open();
                        break;
                    }
                }
            })
        );

        // 注册Markdown后处理器，高亮显示截止日期
        this.registerMarkdownPostProcessor((element, context) => {
            if (!this.settings.enableHighlighting) return;

            const taskItems = element.querySelectorAll('li.task-list-item');
            const today = new Date();
            
            taskItems.forEach((taskItem) => {
                const text = taskItem.textContent;
                
                // 查找截止日期模式
                for (const word of this.settings.triggerWords) {
                    const regex = new RegExp(`${word}:\\s*(\\d{4}-\\d{2}-\\d{2})`, 'i');
                    const match = text.match(regex);
                    
                    if (match) {
                        const dateStr = match[1];
                        const dueDate = parseISO(dateStr);
                        const reminderDate = addDays(today, this.settings.reminderDays);

                        // 检查任务是否已完成
                        const checkbox = taskItem.querySelector('input[type="checkbox"]');
                        const isCompleted = checkbox && checkbox.checked;

                        if (!isCompleted) {
                            if (isBefore(dueDate, today)) {
                                // 已过期
                                taskItem.addClass('lifeos-task-overdue');
                            } else if (isBefore(dueDate, reminderDate)) {
                                // 即将到期
                                taskItem.addClass('lifeos-task-soon');
                            }
                        }
                    }
                }
            });
        });
    }

    onunload() {
        console.log('LifeOS任务截止日期插件已卸载');
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
} 
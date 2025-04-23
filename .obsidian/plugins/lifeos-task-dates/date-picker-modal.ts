import { App, Modal } from 'obsidian';
import { format, addDays, startOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export class DatePickerModal extends Modal {
    private date: Date;
    private onChoose: (date: Date) => void;
    private dateFormat: string;

    constructor(
        app: App,
        initialDate: Date = new Date(),
        onChoose: (date: Date) => void,
        dateFormat: string = 'yyyy-MM-dd'
    ) {
        super(app);
        this.date = initialDate || startOfDay(new Date());
        this.onChoose = onChoose;
        this.dateFormat = dateFormat;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: '选择日期' });
        contentEl.addClass('lifeos-date-picker-modal');

        // 日期预览
        const datePreviewEl = contentEl.createDiv({ cls: 'date-preview' });
        const updateDatePreview = () => {
            datePreviewEl.textContent = format(this.date, this.dateFormat, { locale: zhCN });
        };
        updateDatePreview();

        // 日期输入框
        const dateInputContainer = contentEl.createDiv({ cls: 'date-input-container' });
        const dateInput = dateInputContainer.createEl('input', {
            type: 'date',
            value: format(this.date, 'yyyy-MM-dd')
        });
        dateInput.addEventListener('change', () => {
            if (dateInput.value) {
                this.date = startOfDay(new Date(dateInput.value));
                updateDatePreview();
            }
        });

        // 预设按钮
        const presetButtonsEl = contentEl.createDiv({ cls: 'date-preset-buttons' });
        
        // 今天按钮
        const todayBtn = presetButtonsEl.createEl('button', { text: '今天' });
        todayBtn.addEventListener('click', () => {
            this.date = startOfDay(new Date());
            dateInput.value = format(this.date, 'yyyy-MM-dd');
            updateDatePreview();
        });
        
        // 明天按钮
        const tomorrowBtn = presetButtonsEl.createEl('button', { text: '明天' });
        tomorrowBtn.addEventListener('click', () => {
            this.date = startOfDay(addDays(new Date(), 1));
            dateInput.value = format(this.date, 'yyyy-MM-dd');
            updateDatePreview();
        });
        
        // 一周后按钮
        const nextWeekBtn = presetButtonsEl.createEl('button', { text: '一周后' });
        nextWeekBtn.addEventListener('click', () => {
            this.date = startOfDay(addDays(new Date(), 7));
            dateInput.value = format(this.date, 'yyyy-MM-dd');
            updateDatePreview();
        });

        // 确认/取消按钮
        const footerEl = contentEl.createDiv({ cls: 'date-picker-footer' });
        
        const cancelBtn = footerEl.createEl('button', { text: '取消' });
        cancelBtn.addEventListener('click', () => {
            this.close();
        });
        
        const confirmBtn = footerEl.createEl('button', { text: '确认', cls: 'mod-cta' });
        confirmBtn.addEventListener('click', () => {
            this.onChoose(this.date);
            this.close();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
} 
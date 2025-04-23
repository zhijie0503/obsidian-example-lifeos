import { App, PluginSettingTab, Setting } from 'obsidian';
import LifeOSTaskDates from './main';

export interface LifeOSTaskDatesSettings {
    triggerWords: string[];
    dateFormat: string;
    reminderDays: number;
    enableHighlighting: boolean;
    defaultDueDays: number;
}

export const DEFAULT_SETTINGS: LifeOSTaskDatesSettings = {
    triggerWords: ['截止', '到期', 'due'],
    dateFormat: 'yyyy-MM-dd',
    reminderDays: 3,
    enableHighlighting: true,
    defaultDueDays: 7
};

export class LifeOSTaskDatesSettingTab extends PluginSettingTab {
    plugin: LifeOSTaskDates;

    constructor(app: App, plugin: LifeOSTaskDates) {
        super(app);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'LifeOS 任务截止日期设置' });

        new Setting(containerEl)
            .setName('触发词')
            .setDesc('输入这些词后会自动弹出日期选择器')
            .addText(text => text
                .setPlaceholder('截止,到期,due')
                .setValue(this.plugin.settings.triggerWords.join(','))
                .onChange(async (value) => {
                    this.plugin.settings.triggerWords = value.split(',').map(s => s.trim());
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('日期格式')
            .setDesc('用于显示截止日期的格式')
            .addText(text => text
                .setPlaceholder('yyyy-MM-dd')
                .setValue(this.plugin.settings.dateFormat)
                .onChange(async (value) => {
                    this.plugin.settings.dateFormat = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('提醒天数')
            .setDesc('任务到期前多少天开始提醒')
            .addSlider(slider => slider
                .setLimits(1, 14, 1)
                .setValue(this.plugin.settings.reminderDays)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.reminderDays = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('启用高亮')
            .setDesc('在预览模式下高亮显示即将到期和已过期的任务')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHighlighting)
                .onChange(async (value) => {
                    this.plugin.settings.enableHighlighting = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('默认截止天数')
            .setDesc('使用默认截止日期命令时，将设置为当前日期加上指定天数')
            .addSlider(slider => slider
                .setLimits(1, 30, 1)
                .setValue(this.plugin.settings.defaultDueDays)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.defaultDueDays = value;
                    await this.plugin.saveSettings();
                }));
    }
} 
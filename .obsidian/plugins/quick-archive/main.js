const { Plugin, Notice, TFile, TFolder, PluginSettingTab } = require('obsidian');

const ARCHIVE_FOLDER = '.archive';

class QuickArchivePlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        // 跳过 .archive 自身及其子项
        if (file.path === ARCHIVE_FOLDER || file.path.startsWith(ARCHIVE_FOLDER + '/')) return;

        if (file instanceof TFile) {
          menu.addItem((item) => {
            item.setTitle('归档');
            item.setIcon('archive');
            item.onClick(async () => {
              await this.archiveFile(file);
            });
          });
        } else if (file instanceof TFolder) {
          menu.addItem((item) => {
            item.setTitle('归档文件夹');
            item.setIcon('archive');
            item.onClick(async () => {
              await this.archiveFolder(file);
            });
          });
        }
      })
    );

    // 注册设置面板,使插件出现在设置侧边栏
    this.addSettingTab(new QuickArchiveSettingTab(this.app, this));
  }

  async archiveFile(file) {
    try {
      const adapter = this.app.vault.adapter;

      if (!(await adapter.exists(ARCHIVE_FOLDER))) {
        await adapter.mkdir(ARCHIVE_FOLDER);
      }

      let newPath = `${ARCHIVE_FOLDER}/${file.name}`;

      if (await adapter.exists(newPath)) {
        const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        newPath = `${ARCHIVE_FOLDER}/${file.basename}-${ts}.${file.extension}`;
      }

      await adapter.rename(file.path, newPath);
      new Notice(`已归档: ${file.name}`);
    } catch (error) {
      new Notice(`归档失败: ${error.message}`);
      console.error('Archive error:', error);
    }
  }

  async archiveFolder(folder) {
    try {
      const adapter = this.app.vault.adapter;

      if (!(await adapter.exists(ARCHIVE_FOLDER))) {
        await adapter.mkdir(ARCHIVE_FOLDER);
      }

      let newPath = `${ARCHIVE_FOLDER}/${folder.name}`;

      if (await adapter.exists(newPath)) {
        const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        newPath = `${ARCHIVE_FOLDER}/${folder.name}-${ts}`;
      }

      await adapter.rename(folder.path, newPath);
      new Notice(`已归档文件夹: ${folder.name}`);
    } catch (error) {
      new Notice(`归档失败: ${error.message}`);
      console.error('Archive error:', error);
    }
  }
}

class QuickArchiveSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('p', { text: `归档目标文件夹:${ARCHIVE_FOLDER}` });
  }
}

module.exports = QuickArchivePlugin;

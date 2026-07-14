const { Plugin, Notice, TFile } = require('obsidian');

const ARCHIVE_FOLDER = '.archive';

class QuickArchivePlugin extends Plugin {
  async onload() {
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (!(file instanceof TFile)) return;
        if (file.path.startsWith(ARCHIVE_FOLDER + '/')) return;

        menu.addItem((item) => {
          item.setTitle('归档');
          item.setIcon('archive');
          item.onClick(async () => {
            await this.archiveFile(file);
          });
        });
      })
    );
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
}

module.exports = QuickArchivePlugin;

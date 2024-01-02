import { storage } from './utils.js';

const settingsStorage = storage('settings');

class Theme {
  constructor() {
    this.theme = settingsStorage.get('theme');
    
    if (theme === 'system default') this.set('system-default');
    
    if (this.theme) this.set(this.theme);
    else this.set('indigo');
  }

  /**
   * Set the theme of the page
   * @param {string} theme The name of the theme
   * @param {boolean} save Whether or not the theme should be saved
   */
  set = (theme, save) => {
    document.body.setAttribute('data-theme', theme);
    this.theme = theme;
  
    if (save !== false) settingsStorage.set('theme', theme);
  };

  /**
   * Get the current theme
   * @returns {string}
   */
  get = () => {
    return document.body.getAttribute('data-theme');
  };
}

export default new Theme();

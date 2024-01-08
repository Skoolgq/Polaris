import { storage } from './utils.js';

const settingsStorage = storage('settings');

class Theme {
  constructor() {
    this.theme = settingsStorage.get('theme');
    
    if (this.theme === 'system default' || this.theme === 'system-default' || !this.theme) this.set('dark', true);
    else this.set(this.theme);
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
  get = () => document.body.getAttribute('data-theme');
 }

export default new Theme();

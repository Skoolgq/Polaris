class Theme {
    constructor() {
        this.theme = localStorage.getItem('theme');

        if (this.theme) {
            this.set(this.theme);
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.set('dark', false);
            } else {
                this.set('light', false);
            }
        }
    }

    set = (theme, save) => {
        document.body.setAttribute('data-theme', theme);

        if (save !== false) {
            localStorage.setItem('theme', theme);
        }
    }
}

export default new Theme();
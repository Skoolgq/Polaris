class Theme {
    constructor() {
        this.theme = localStorage.getItem('theme');

        if (this.theme) {
            this.set(this.theme);
        } else {
            this.set('system default');
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
class Theme {
    constructor() {
        this.theme = localStorage.getItem('theme');

        if (this.theme) {
            this.set(this.theme);
        } else {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.set('dark');
            } else {
                this.set('light');
            }
        }
    }

    set = (theme) => {
        document.body.setAttribute('data-theme', theme);

        localStorage.setItem('theme', theme);
    }
}

export default new Theme();
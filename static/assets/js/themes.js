const set = (name, value) => {
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({}));
    } else {
        try {
            JSON.parse(localStorage.getItem('settings'));
        } catch (e) {
            localStorage.setItem('settings', JSON.stringify({}));
        }
    }

    const settings = JSON.parse(localStorage.getItem('settings'));
    settings[name] = value;
    localStorage.setItem('settings', JSON.stringify(settings));
};

const get = (name) => {
    if (!localStorage.getItem('settings')) {
        localStorage.setItem('settings', JSON.stringify({}));
    } else {
        try {
            JSON.parse(localStorage.getItem('settings'));
        } catch (e) {
            localStorage.setItem('settings', JSON.stringify({}));
        }
    }

    const settings = JSON.parse(localStorage.getItem('settings'));
    return settings[name];
}

class Theme {
    constructor() {
        this.theme = get('theme');

        if (this.theme) {
            this.set(this.theme);
        } else {
            this.set('system default');
        }
    }

    set = (theme, save) => {
        document.body.setAttribute('data-theme', theme);

        if (save !== false) {
            set('theme', theme);
        }
    }
}

export default new Theme();
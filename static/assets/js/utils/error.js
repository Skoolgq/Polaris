class PolarisError {
    constructor(e) {
        let notificationContainer = document.querySelector('.notifications');

        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.classList = 'notifications';
            document.body.appendChild(notificationContainer);
        }

        const error = document.createElement('div');
        error.classList = 'notification error';
        if (e.message) error.innerHTML = `<span>An error occurred: ${e.message.toString()}</span>`;
        else error.innerHTML = `<span>An error occurred: ${e.toString()}</span>`;
        notificationContainer.appendChild(error);

        error.onclick = () => {
            error.style.height = '0px';
            error.style.opacity = 0;
            error.style.padding = '0px';
            error.firstElementChild.style.fontSize = '0px';

            setTimeout(() => {
                error.remove();
            }, 500);
        }

        setTimeout(() => {
            error.style.height = '0px';
            error.style.opacity = 0;
            error.style.padding = '0px';
            error.firstElementChild.style.fontSize = '0px';

            setTimeout(() => {
                error.remove();
            }, 500);
        }, 8000);

        if (e.stack) console.log('An error occurred:\n\n' + e.stack);
        else console.log('An error occurred:\n\n' + e);
    }
}

if (this) {
    window.onerror = (...e) => new PolarisError(e);
    window.console.error = (...e) => new PolarisError(e);
    window.onmessageerror = (...e) => new PolarisError(e);
}

export default PolarisError;
export { PolarisError };

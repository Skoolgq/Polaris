import PolarisError from './error.js';

const load = () => {
    const evBundle = document.createElement('script');
    evBundle.src = '/uv/ev.bundle.js';
    document.body.appendChild(evBundle);
}

export default { load };
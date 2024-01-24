import { storage } from './utils.js';

const analyticsPreferences = storage('analytics');

if (analyticsPreferences.get('enabled') !== false) {
    var analyticsData;

    if (!analyticsPreferences.get('savedResponse')) {
        try {
            analyticsData = await (await fetch('/api/analytics/site/' + location.hostname)).json();
            analyticsPreferences.set('savedResponse', analyticsData);
        } catch (e) { analyticsPreferences.set('enabled', false);location.reload(); }
    } else analyticsData = analyticsPreferences.get('savedResponse');

    if (analyticsData.success && analyticsData.data.domain === location.hostname) {
        analyticsPreferences.set('enabled', true);

        const script = document.createElement('script');
        script.src = '/api/analytics/script.js';
        script.setAttribute('data-website-id', analyticsData.data.id);
        script.setAttribute('data-auto-track', 'false');
        script.setAttribute('data-host-url', location.origin + '/api/analytics');
        script.setAttribute('data-cache', 'true');
        document.head.appendChild(script);
    } else analyticsPreferences.set('enabled', false);
}

/**
 * @type {{ track: (event: string, props: {}) => {}}} umami
 */
const umami = window.umami || {};

export { umami };
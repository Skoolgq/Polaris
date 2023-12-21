import configTemplate from './polaris.config.template.js';

/**
 * @type {configTemplate}
 */
export default {
    port: 8080,
    mode: 'dev',
    minify: false,
    assetScrambling: true,
    allowDangerousTemplateInsert: true
};
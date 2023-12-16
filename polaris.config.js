import configTemplate  from './polaris.config.template.js';

/**
 * @type {configTemplate}
 */
export default {
    port: 8080,
    mode: 'dev',
    minify: true,
    assetScrambling: true,
    allowDangerousTemplateInsert: true
};
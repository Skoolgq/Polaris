import configTemplate from './polaris.config.template.js';

/**
 * @type {configTemplate}
 */
export default {
    port: 8080,
    mode: 'prod',
    //Messes up uv
    minify: false,
    //Beta
    assetScrambling: false,
    allowDangerousTemplateInsert: true
};
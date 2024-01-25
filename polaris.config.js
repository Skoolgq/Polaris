import useConfig from './lib/config.js';

export default useConfig({
    port: 8080,
    mode: 'prod',
    options: {
        //Messes up uv
        minify: false,
        //Beta
        assetScrambling: false,
        allowDangerousTemplateInsert: true,
        api: {
            domain: 'api.polarislearning.org',
            secure: true
        }
    }
});
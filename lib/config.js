var config = {
    port: 8080,
    mode: 'prod',
    options: {
        api: {
            domain: 'api.polarislearning.org',
            secure: true
        },
        minify: false,
        assetScrambling: false,
        allowDangerousTemplateInsert: true
    }
};

/**
 * @param {config} userConfig 
 * @returns {config}
 */
export const useConfig = (userConfig) => {
    config = {
        ...config,
        ...userConfig,
        mode: (process.argv[2] === 'prod' || process.argv[2] === 'dev' ? process.argv[2] : (process.argv[3] === 'prod' || process.argv[3] === 'dev' ? process.argv[3] : (userConfig.mode === 'prod' || userConfig.mode === 'dev' ? userConfig.mode : 'prod'))),
        port: (process.argv[2] !== 'prod' && process.argv[2] !== 'dev' && Boolean(Number(process.argv[2]))) ? process.argv[2] : (Boolean(Number(process.argv[3])) ? process.argv[3] : (Boolean(Number(userConfig.port)) ? userConfig.port : (mode === 'prod' ? 80 : 8080)))
    };

    Object.keys(userConfig).forEach(option => {
        if (typeof config[option] === 'function') config[option] = config[option]();
    });

    return config;
}

/**
 * @returns {config}
 */
export const getConfig = () => config;
export default useConfig;
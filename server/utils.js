import * as rewriter from './utils/rewriter.js';
import TokenManager from './utils/token.js';

import path from 'node:path';
import fs from 'node:fs';

/**
 * @param {string} url 
 * @param {string} folderPath 
 * @returns {{ exists: boolean, path: string }}
 */
const pathToFile = (url = '', folderPath) => {
    if (url.endsWith('/')) url = url + 'index.html';
    else if (url.split(/[#?]/)[0].split('.').pop().trim() === url) {
        if (!fs.existsSync(path.join(folderPath, url))) url = url + '.html';
    }

    return {
        exists: fs.existsSync(path.join(folderPath, url)),
        path: path.join(folderPath, url)
    };
};

export default {
    pathToFile,
    TokenManager,
    rewriter
};

export {
    pathToFile,
    TokenManager,
    rewriter
};
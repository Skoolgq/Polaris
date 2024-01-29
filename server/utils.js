import isWord from 'is-word';

import * as rewriter from './utils/rewriter.js';
import TokenManager from './utils/token.js';
import config from '../polaris.config.js';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const dictionary = fs.readFileSync(path.join(__dirname, '../node_modules/is-word/dictionary/american-english.txt'))
    .toString()
    .split('\n')
    .map(word => word.trim());
const englishWords = isWord('american-english');
const parsedFilter = config.options.filtering ? fs.readFileSync(path.join(__dirname, '../filter.txt'))
    .toString()
    .split('\n')
    .map(query => query.trim())
    .filter(query => query && !query.startsWith('->')) : [];

/**
 * @param {string} url 
 * @param {string} folderPath 
 * @returns {{ exists: boolean, path: string }}
 */
export const pathToFile = (url = '', folderPath) => {
    if (url.endsWith('/')) url = url + 'index.html';
    else if (url.split(/[#?]/)[0].split('.').pop().trim() === url) {
        if (!fs.existsSync(path.join(folderPath, url))) url = url + '.html';
    }

    return {
        exists: fs.existsSync(path.join(folderPath, url)),
        path: path.join(folderPath, url)
    };
};

/**
 * Get words from a string
 * @param {string} input 
 * @param {Array.<string>} words 
 * @returns {Promise.<Array.<string>>}
 */
export const getWords = (input, words) => new Promise(async (resolve, reject) => {
    let output = [];

    for (let i = 0; i < words.length; i++) {
        output.push(...Array((input.match(RegExp(words[i], 'gi')) || []).length).fill(words[i]));

        if (i + 1 === words.length) resolve(output);
    }
});

/**
 * @param {string} query 
 * @returns {Promise.<{ flagged: true, query: string }>}
 */
export const filter = (query) => new Promise(async (resolve, reject) => {
    if (parsedFilter.length === 0) {
        resolve({
            flagged: false,
            query: ''
        });
        return;
    }

    const parsedQuery = query.replaceAll('/', ' ').replaceAll('-', ' ').replaceAll('_', ' ').split(' ');

    for (let i = 0; i < parsedQuery.length; i++) {
        /**
         * @type {string}
         */
        const query = parsedQuery[i];
        const validWord = englishWords.check(query);

        if (validWord && parsedFilter.includes(query)) {
            resolve({
                flagged: true,
                query
            });
            return;
        }

        if (!validWord) {
            const results = await (new Promise((resolve, reject) => {
                for (let i = 0; i < parsedFilter.length; i++) {
                    const hasFiltered = query.includes(parsedFilter[i]);

                    if (hasFiltered) {
                        resolve({
                            flagged: true,
                            query: parsedFilter[i]
                        });
                        return;
                    }

                    if (i + 1 === parsedFilter.length) resolve({
                        flagged: false,
                        query: ''
                    });
                }
            }));

            console.log(query);

            if (results.flagged) {
                resolve({
                    flagged: true,
                    query: results.query
                });
                return;
            }
        }

        if (i + 1 === parsedQuery.length) resolve({
            flagged: false,
            query: ''
        });
    }
});

export default {
    pathToFile,
    filter,
    TokenManager,
    rewriter
};

export {
    TokenManager,
    rewriter
};
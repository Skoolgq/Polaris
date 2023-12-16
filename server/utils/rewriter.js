import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyHTML } from 'html-minifier';
import { JSDOM } from 'jsdom';
import mime from 'mime';

import { TokenManager } from '../utils.js';
import config from '../../polaris.config.js';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const mode = (process.argv[2] === 'prod' || process.argv[2] === 'dev' ? process.argv[2] : (process.argv[3] === 'prod' || process.argv[3] === 'dev' ? process.argv[3] : (config.mode === 'prod' || config.mode === 'dev' ? config.mode : 'prod')));
const __dirname = url.fileURLToPath(new URL('../', import.meta.url));

const templateParser = (data) => {
    return new Promise(async (resolve, reject) => {
        resolve(String(data).split('<!--el:')
            .map(data => {
                if (data.split('\n')[0].trim().endsWith('-->')) return data.split('\n')[0].trim().replace('-->', '');
                else return undefined;
            })
            .map(data => {
                if (data) {
                    if (data.startsWith('{{') && data.split(':')[data.split(':').length - 2].endsWith('}}')) {
                        if (config.allowDangerousTemplateInsert) {
                            if (Boolean(eval(String(data.split(':')[data.split(':').length - 2]).slice(2, -2)))) return data;
                            else return undefined;
                        } else return undefined;
                    } else return data;
                } else return undefined;
            })
            .filter(data => fs.existsSync(path.join(__dirname, '../templates', (data ? (data.startsWith('{{') && data.split(':')[data.split(':').length - 2].endsWith('}}') ? data.split(':')[data.split(':').length - 1] : data) : undefined) + '.html')))
            .map(data => {
                return {
                    name: data,
                    file: fs.readFileSync(path.join(__dirname, '../templates', (data ? (data.startsWith('{{') && data.split(':')[data.split(':').length - 2].endsWith('}}') ? data.split(':')[data.split(':').length - 1] : data) : undefined) + '.html').toString())
                };
            }));
    });
};

const html = (data) => {
    return new Promise(async (resolve, reject) => {
        var htmlData = String(data);

        const templates = await templateParser(data);

        templates.forEach(template => htmlData = htmlData.replace(`<!--el:${template.name}-->`, template.file));

        const dom = new JSDOM(htmlData);

        if (config.assetScrambling) {
            for (let i = 0; i < dom.window.document.documentElement.querySelectorAll('script').length; i++) {
                const script = dom.window.document.documentElement.querySelectorAll('script')[i];

                if (script.src.startsWith('/') && !script.src.startsWith('//') && fs.existsSync(path.join(__dirname, '../static', script.src))) script.setAttribute('src', `/asset/${TokenManager.generate('asset', 20000, {
                    asset: path.join(__dirname, '../static', script.src),
                    type: 'application/javascript'
                }).token}`);
            }

            for (let i = 0; i < dom.window.document.documentElement.querySelectorAll('link[rel="stylesheet"]').length; i++) {
                const css = dom.window.document.documentElement.querySelectorAll('link[rel="stylesheet"]')[i];

                if (css.href.startsWith('/') && !css.href.startsWith('//') && fs.existsSync(path.join(__dirname, '../static', css.href))) css.setAttribute('href', `/asset/${TokenManager.generate('asset', 20000, {
                    asset: path.join(__dirname, '../static', css.href),
                    type: 'text/css'
                }).token}`);
            }

            for (let i = 0; i < dom.window.document.documentElement.querySelectorAll('img').length; i++) {
                const img = dom.window.document.documentElement.querySelectorAll('img')[i];

                if (img.src.startsWith('/') && !img.src.startsWith('//') && fs.existsSync(path.join(__dirname, '../static', img.src))) img.setAttribute('src', `/asset/${TokenManager.generate('asset', 20000, {
                    asset: path.join(__dirname, '../static', img.src),
                    type: mime.getType(path.join(__dirname, '../static', img.src))
                }).token}`);
            }
        }

        if (config.minify) resolve(minifyHTML(dom.serialize(), {
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
            removeScriptTypeAttributes: true,
            useShortDoctype: true,
            collapseWhitespace: true,
            removeComments: true
        }))
        else resolve(dom.serialize());
    });
};

const javascript = (data) => {
    return new Promise((resolve, reject) => {
        const imports = String(data).split('import ')
            .map(data => data.split('from ')[1])
            .filter(data => Boolean(data))
            .map(data => data.split(';')[0]
                .replaceAll('\'', '')
                .replaceAll('`', '')
                .replaceAll('"', ''))
            .filter(data => fs.existsSync(path.join(__dirname, '../templates', data + '.javascript')));


        let javascript = String(data);

        if (config.assetScrambling) for (let i = 0; i < imports.length; i++) {
            javascript = javascript.replace(imports[i], '/asset/' + TokenManager.generate('asset', 20000, {
                asset: path.join(__dirname, '../static', imports[i]),
                type: 'text/javascript'
            }).token);
        }

        if (config.minify) resolve(JavaScriptObfuscator.obfuscate(javascript,
            {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                stringArrayShuffle: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }).getObfuscatedCode());
        else resolve(javascript);
    });
};

const css = (data) => {
    return new Promise((resolve, reject) => {
        const imports = String(data).split('url(')
            .map(data => {
                if (data.split('\n')[0].split(' ')[0].replace(';', '').trim().endsWith(')')) return data.split('\n')[0]
                    .split(' ')[0]
                    .trim()
                    .replace(';', '')
                    .replace(')', '')
                    .replaceAll('\'', '')
                    .replaceAll('`', '')
                    .replaceAll('"', '');
                else return undefined;
            })
            .filter(data => {
                if (data) {
                    try {
                        new URL(data);

                        return false;
                    } catch (e) {
                        if (data.startsWith('/')) return true;
                        else return false;
                    }
                } else return false;
            })
            .filter(data => fs.existsSync(path.join(__dirname, '../templates', data + mime.getExtension(data))));

        let css = String(data);

        if (config.assetScrambling) for (let i = 0; i < imports.length; i++) {
            css = css.replace(imports[i], '/asset/' + TokenManager.generate('asset', 20000, {
                asset: path.join(__dirname, '../static', imports[i]),
                type: mime.getType(path.join(__dirname, '../static', imports[i]))
            }).token);
        }

        if (config.minify) resolve(css.replace(/(\r\n|\n|\r)/gm, '').replaceAll('    ', ' '));
        else resolve(css);
    });
};

const auto = async (data, type) => {
    if (type === 'text/html') return await html(data);
    else if (type === 'text/javascript' || type === 'application/javascript') return await javascript(data);
    else if (type === 'text/css') return await css(data);
    else return data;
};

export {
    auto,
    html,
    javascript,
    css
};
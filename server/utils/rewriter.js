import JavaScriptObfuscator from 'javascript-obfuscator';
import { minify as minifyHTML } from 'html-minifier';
import { JSDOM } from 'jsdom';
import mime from 'mime';

import { TokenManager } from '../utils.js';
import config from '../../polaris.config.js';

import path from 'node:path';
import url from 'node:url';
import fs from 'node:fs';

const __dirname = url.fileURLToPath(new URL('../', import.meta.url));
const mode = config.mode;

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
                        if (config.options.allowDangerousTemplateInsert) {
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

        for (let i = 0; i < templates.length; i++) htmlData = htmlData.replace(`<!--el:${templates[i].name}-->`, templates[i].file)

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

        for (let i = 0; i < dom.window.document.documentElement.querySelectorAll('a').length; i++) {
            const link = dom.window.document.documentElement.querySelectorAll('a')[i];

            if (URL.canParse(link.href)) {
                if (new URL(link.href).protocol === 'https:') link.href = `/view?load=${Buffer.from(JSON.stringify({
                    target: link.href,
                    redirect: true,
                    trusted: true
                })).toString('base64')}`;
                else if (new URL(link.href).protocol === 'http:') link.href = `/view?load=${Buffer.from(JSON.stringify({
                    target: link.href,
                    redirect: true
                })).toString('base64')}`;
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

const javascript = (data, filePath) => {
    return new Promise((resolve, reject) => {
        filePath = filePath.replaceAll('\\', '/');

        const imports = String(data).split('import ')
            .map(data => data.split('from ')[1])
            .filter(data => Boolean(data))
            .map(data => data.split('\n')[0]
                .replaceAll('\'', '')
                .replaceAll('`', '')
                .replaceAll('"', '')
                .replaceAll(';', ''))
            .map(data => {
                if (data.startsWith('./')) return {
                    originalFile: data.replaceAll('\r', ''),
                    newFile: path.join(filePath.split('/').slice(0, -1).join('/'), data).replaceAll('\r', '')
                };
                else if (data.startsWith('../')) return {
                    originalFile: data.replaceAll('\r', ''),
                    newFile: path.join(filePath.split('/').slice(0, -1).join('/'), data).replaceAll('\r', '')
                };
                else return {
                    originalFile: data.replaceAll('\r', ''),
                    newFile: data.replaceAll('\r', '')
                };
            })
            .filter(data => fs.existsSync(path.join(__dirname, '../static', data.newFile)));

        let javascript = String(data);

        if (config.assetScrambling) for (let i = 0; i < imports.length; i++) javascript = javascript.replace(imports[i].originalFile, '/asset/' + TokenManager.generate('asset', 20000, {
            asset: path.join(__dirname, '../static', imports[i].newFile),
            type: 'text/javascript'
        }).token);

        if (config.minify) resolve(JavaScriptObfuscator.obfuscate(javascript, {
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

const css = (data, filePath) => {
    return new Promise((resolve, reject) => {
        filePath = filePath.replaceAll('\\', '/');

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
                else return null;
            })
            .filter(data => {
                if (data) try {
                    new URL(data);

                    return false;
                } catch (e) {
                    return true;
                } else return false;
            })
            .map(data => {
                if (data.startsWith('./')) return {
                    originalFile: data,
                    newFile: path.join(filePath.split('/').slice(0, -1).join('/'), data)
                };
                else if (data.startsWith('../')) return {
                    originalFile: data,
                    newFile: path.join(filePath.split('/').slice(0, -1).join('/'), data)
                };
                else return {
                    originalFile: data,
                    newFile: data
                };
            })
            .filter(data => fs.existsSync(path.join(__dirname, '../static', data.newFile)));

        let css = String(data);

        if (config.assetScrambling) for (let i = 0; i < imports.length; i++) css = css.replace(imports[i].originalFile, '/asset/' + TokenManager.generate('asset', 20000, {
            asset: path.join(__dirname, '../static', imports[i].newFile),
            type: mime.getType(path.join(__dirname, '../static', imports[i].newFile))
        }).token);

        if (config.minify) resolve(css.replace(/(\r\n|\n|\r)/gm, '').replaceAll('    ', ' '));
        else resolve(css);
    });
};

const auto = async (data, type, filePath) => {
    if (type === 'text/html') return await html(data);
    else if (type === 'text/javascript' || type === 'application/javascript') return await javascript(data, filePath);
    else if (type === 'text/css') return await css(data, filePath);
    else return data;
};

export {
    auto,
    html,
    javascript,
    css
};
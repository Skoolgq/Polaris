import { v4 as uuid } from 'uuid';

class TokenManager {
    constructor() {
        this.tokens = {};

        setInterval(() => {
            const currentDate = Date.now();

            Object.keys(this.tokens).forEach(key => {
                const token = this.tokens[key];

                if (currentDate > token.expires) delete this.tokens[key];
            });
        }, 100);
    }

    /**
     * Generate a token
     * @param {string} type The type of token you are generating
     * @param {number} expires How long it will take for the token to expire in miliseconds
     * @param {object | string} data The data to be stored with the token
     * @returns {{token: number, expires: number}} The token data
     */
    generate = (type, expires, data) => {
        const token = uuid();

        this.tokens[token] = {
            token: token,
            type: type,
            expires: Date.now() + expires,
            data: data
        }

        return {
            token: token,
            expires: Date.now() + expires
        }
    }

    /**
     * Check if a token exists
     * @param {string} token The token
     * @returns {boolean}
     */
    exists = (token) => {
        return this.tokens[token] ? true : false;
    }

    /**
     * Get all tokens in a category
     * @param {string} type The token category
     * @returns {Array.<{token: stromg, type: string, expires: number, data: object | string}>} The list of tokens
     */
    getAll = (type) => {
        const tokens = [];

        Object.keys(this.tokens).forEach(key => {
            const token = this.tokens[key];

            if (token.type == type) tokens.push(token);
        });

        return tokens;
    }

    /**
     * Get token information from a token
     * @param {string} token The token
     * @returns {{token: stromg, type: string, expires: number, data: object | string}} Token data
     */
    get = (token) => {
        return this.tokens[token];
    }

    delete = (token) => delete this.tokens[token];
}

export default new TokenManager();
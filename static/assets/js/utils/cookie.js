const cookie = (this, function () {
    'use strict';
    var cookie = function () {
        return cookie.get.apply(cookie, arguments);
    };

    var utils = cookie.utils = {
        isArray: Array.isArray || function (value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        },
        isPlainObject: (value) => !!value && Object.prototype.toString.call(value) === '[object Object]',
        toArray: (value) => Array.prototype.slice.call(value),
        getKeys: Object.keys || function (obj) {
            var keys = [];
            var key = '';

            for (key in obj) {
                if (obj.hasOwnProperty(key)) keys.push(key);
            }

            return keys;
        },
        encode: (value) => btoa(value.toString()),
        decode: (value) => {
            try {
                return atob(value.toString());
            } catch {
                return value.toString();
            }
        },
        retrieve: (value, fallback) => value == null ? fallback : value

    };

    cookie.defaults = {};

    cookie.expiresMultiplier = 60 * 60 * 24;

    cookie.set = function (key, value, options) {
        if (utils.isPlainObject(key)) {

            for (var k in key) {
                if (key.hasOwnProperty(k)) this.set(k, key[k], value);
            }
        } else {
            options = utils.isPlainObject(options) ? options : { expires: options };

            var expires = options.expires !== undefined ? options.expires : (this.defaults.expires || ''),
                expiresType = typeof (expires);

            if (expiresType === 'string' && expires !== '') expires = new Date(expires);
            else if (expiresType === 'number') expires = new Date(+new Date + 1000 * this.expiresMultiplier * expires);

            if (expires !== '' && 'toUTCString' in expires) expires = ';expires=' + expires.toUTCString();

            var path = options.path || this.defaults.path;
            path = path ? ';path=' + path : '';

            var domain = options.domain || this.defaults.domain;
            domain = domain ? ';domain=' + domain : '';

            var secure = options.secure || this.defaults.secure ? ';secure' : '';
            if (options.secure === false) secure = '';

            var sameSite = options.sameSite || this.defaults.sameSite;
            sameSite = sameSite ? ';SameSite=' + sameSite : '';
            if (options.sameSite === null) sameSite = '';

            document.cookie = key + '=' + value + expires + path + domain + secure + sameSite;
        }

        return this;
    };

    cookie.setDefault = function (key, value, options) {
        if (utils.isPlainObject(key)) {
            for (var k in key) {
                if (this.get(k) === undefined) this.set(k, key[k], value);
            }
            return cookie;
        } else {
            if (this.get(key) === undefined) return this.set.apply(this, arguments);
        }
    },

        cookie.remove = function (keys) {
            keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

            for (var i = 0, l = keys.length; i < l; i++) {
                this.set(keys[i], '', -1);
            }

            return this;
        };

    cookie.removeSpecific = function (keys, options) {
        if (!options) return this.remove(keys);

        keys = utils.isArray(keys) ? keys : [keys];
        options.expires = -1;

        for (var i = 0, l = keys.length; i < l; i++) {
            this.set(keys[i], '', options);
        }

        return this;
    };

    cookie.empty = function () {
        return this.remove(utils.getKeys(this.all()));
    };

    cookie.get = function (keys, fallback) {
        var cookies = this.all();

        if (utils.isArray(keys)) {
            var result = {};

            for (var i = 0, l = keys.length; i < l; i++) {
                var value = keys[i];
                result[value] = utils.retrieve(cookies[value], fallback);
            }

            return result;

        } else return utils.retrieve(cookies[keys], fallback);
    };

    cookie.all = function () {
        if (document.cookie === '') return {};

        var cookies = document.cookie.split('; '),
            result = {};

        for (var i = 0, l = cookies.length; i < l; i++) {
            var item = cookies[i].split('=');
            var key = item.shift();
            var value = item.join('=');
            result[key] = value;
        }

        return result;
    };

    cookie.enabled = function () {
        if (navigator.cookieEnabled) return true;

        var ret = cookie.set('_', '_').get('_') === '_';
        cookie.remove('_');
        return ret;
    };

    return cookie;
});

export default cookie();
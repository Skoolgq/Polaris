const xor = {
    encode: (str, key = 2) => {
        if (!str) return str;

        return encodeURIComponent(str.split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join(''));
    },
    decode: (str, key = 2) => {
        if (!str) return str;

        return decodeURIComponent(str).split('').map((e, i) => i % key ? String.fromCharCode(e.charCodeAt(0) ^ key) : e).join('');
    }
}

const plain = {
    encode: (str) => {
        if (!str) return str;

        return encodeURIComponent(str);
    },
    decode: (str) => {
        if (!str) return str;

        return decodeURIComponent(str);
    }
}

const none = {
    encode: (str) => str,
    decode: (str) => str,
}

const base64 = {
    encode: (str) => {
        if (!str) return str;

        return decodeURIComponent(btoa(str));
    },
    decode: (str) => {
        if (!str) return str;

        return atob(str);
    }
}

export { xor, plain, none, base64 };
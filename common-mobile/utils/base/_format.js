import moment from 'moment';

module.exports = {

    enumeration: {
        get(value) { // MY_CONSTANT > My constant
            if (!value) {
                return '';
            }
            return Format.camelCase(value.replace(/_/g, ' '));
        },
        set(value) { // My Constant > MY_CONSTANT
            return value ? value.replace(/ /g, '_').toUpperCase() : '';
        },
    },

    age(value) { // DATE > 10
        if (value) {
            const a = moment();


            const b = moment(value);
            return a.diff(b, 'years');
        }
        return value;
    },

    camelCase(val) { // hello world > Hello world
        return val && (typeof val === 'string') ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase() : '';
    },

    cssImage(value) { // lol.jpg  > url('lol.jpg')
        return value ? `url("${value}")` : 'none';
    },

    ordinal(value) {
        if (!value) {
            return '0';
        }
        const s = ['th', 'st', 'nd', 'rd'];
        const v = value % 100;
        return value ? value + (s[(v - 20) % 10] || s[v] || s[0]) : '';
    },

    truncateText(text, numberOfChars) { // lol,1 > l...
        if (text) {
            if (text.length > numberOfChars) {
                return `${text.substring(0, numberOfChars)}...`;
            }
        }
        return text;
    },

    removeAccents(str) { // Sergio Agüero > Sergio Aguero
        if (!str) {
            return '';
        }
        for (let i = 0; i < Utils.accents.length; i++) {
            str = str.replace(Utils.accents[i].letters, Utils.accents[i].base);
        }
        return str;
    },
};

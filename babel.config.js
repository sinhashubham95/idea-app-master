module.exports = (api) => {
    api.cache(true);
    return {
        presets: ['module:metro-react-native-babel-preset'],
        plugins: [
            ['module-resolver', {
                alias: {
                    stores: './common-mobile/stores',
                    providers: './common-mobile/providers',
                    components: './app/components/',
                },
            }],
        ],
    };
};

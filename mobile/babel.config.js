module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@navigation': './src/navigation',
          '@theme': './src/theme',
          '@types': './src/types',
        },
      },
    ],
  ],
};

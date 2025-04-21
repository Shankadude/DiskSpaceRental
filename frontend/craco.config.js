const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        zlib: require.resolve('browserify-zlib'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser'),
        assert: require.resolve('assert/')
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      return webpackConfig;
    },
  },
};

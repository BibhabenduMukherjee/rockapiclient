const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  target: 'electron-renderer',
  entry: './src/index.tsx',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific functions
          },
          mangle: {
            safari10: true, // Fix Safari 10 issues
          },
        },
        extractComments: false, // Don't create separate license file
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 20000, // 20KB minimum chunk size
      maxSize: 200000, // 200KB maximum chunk size
      cacheGroups: {
        // Separate vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
          maxSize: 100000, // 100KB max for vendor chunks
        },
        // Separate Ant Design (largest dependency)
        antd: {
          test: /[\\/]node_modules[\\/]antd[\\/]/,
          name: 'antd',
          chunks: 'all',
          priority: 20,
          maxSize: 150000, // 150KB max for Ant Design
        },
        // Separate React libraries
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 15,
          maxSize: 100000, // 100KB max for React
        },
        // Common code between chunks
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          maxSize: 100000, // 100KB max for common code
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { 
                targets: { electron: '28' },
                modules: false,
                useBuiltIns: 'usage',
                corejs: 3
              }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    // Global polyfill for Node.js compatibility
    new webpack.DefinePlugin({
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    }),
    new webpack.ProvidePlugin({
      global: 'globalThis',
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      "global": false,
      "fs": false,
      "path": false,
      "os": false,
      "crypto": false,
      "stream": false,
      "util": false,
      "buffer": "buffer",
      "process": "process/browser",
      "assert": false,
      "http": false,
      "https": false,
      "zlib": false,
      "url": false,
      "querystring": false
    }
  },
  externals: {
    // Exclude server-side dependencies from renderer bundle
    'express': 'commonjs express',
    'cors': 'commonjs cors',
    'ws': 'commonjs ws',
  },
  performance: {
    hints: 'warning',
    maxEntrypointSize: 500000, // 500KB
    maxAssetSize: 200000, // 200KB
  },
};
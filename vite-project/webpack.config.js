const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const webpack = require('webpack');
const NODE_ENV = process.env.NODE_ENV || 'development';

require('dotenv').config();

module.exports = () => {
  const publicPath = process.env.PUBLIC_PATH || 'http://localhost:8080/';

  return {
    mode: NODE_ENV !== 'production' ? 'development' : 'production',
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath,
      filename: '[name].js',
      chunkFilename: '[name].[contenthash].js'
    },
    entry: {
      bundle: './src/index.tsx'
    },
    experiments: {
      lazyCompilation: {
        entries: false,
        imports: NODE_ENV === 'development'
      }
    },
    plugins: [
      !!process.env.BUNDLE_ANALYZER && new BundleAnalyzerPlugin(),
      NODE_ENV === 'development' && new ReactRefreshWebpackPlugin(),

      new ForkTsCheckerWebpackPlugin(),
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        hash: true,
        filename: 'index.html',
        template: 'assets/index.html'
      }),

      new webpack.EnvironmentPlugin({
        HONEYBADGER_API_KEY: '',
        BUGSNAG_API_KEY: '',
        GITHUB_VERSION: '',
        LOGROCKET_PROJECT: '',
        NOTIV_ENV: 'development',
        COLLABORATE_URL: '',
        API_URL: 'http://localhost:5000/v1',
        CENTRIFUGE_URL: '',
        SUPPORT_EMAIL: 'support@notiv.com',
        PRIVACY_POLICY_URL: 'https://www.notiv.com/privacy',
        TERMS_OF_SERVICE_URL: 'https://www.notiv.com/terms-and-conditions',
        ENABLE_AHOY_TRACKING: 'true',
        LANGUAGE_DETECTION: 'querystring',
        DUBBER_IDP_HOSTNAME: '',
        ENABLE_DUBBER_IDP_AUTH: '',
        RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED:
          process.NODE_ENV === 'production' ? 'true' : 'false'
      }),

      new RetryChunkLoadPlugin({
        cacheBust: `function() {
          return Date.now();
        }`,
        retryDelay: 3000,
        maxRetries: 5
      }),

      NODE_ENV === 'production' &&
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              encodeOptions: {
                jpeg: {
                  // https://sharp.pixelplumbing.com/api-output#jpeg
                  quality: 100
                },
                webp: {
                  // https://sharp.pixelplumbing.com/api-output#webp
                  lossless: true
                },
                avif: {
                  // https://sharp.pixelplumbing.com/api-output#avif
                  lossless: true
                },

                // png by default sets the quality to 100%, which is same as lossless
                // https://sharp.pixelplumbing.com/api-output#png
                png: {},

                // gif does not support lossless compression at all
                // https://sharp.pixelplumbing.com/api-output#gif
                gif: {}
              }
            }
          }
        }),

      // Merges all import() statmeents together for the test build (to make Cypress more reliable)
      NODE_ENV === 'test' &&
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1
        })
    ].filter(Boolean),
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                plugins: [
                  NODE_ENV === 'development' &&
                    require.resolve('react-refresh/babel')
                ].filter(Boolean)
              }
            }
          ]
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.html$/,
          use: ['html-loader']
        }
      ]
    },
    devServer: {
      client: {
        webSocketURL: 'auto://0.0.0.0:0/ws'
      },
      allowedHosts: ['.ngrok.io'],
      host: '0.0.0.0',
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'assets')
      },

      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    optimization: {
      splitChunks: {
        chunks:
          NODE_ENV === 'test' ? 'initial' : process.env.SPLIT_CHUNKS || 'async'
      }
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.css']
    },
    devtool:
      NODE_ENV !== 'production' ? 'cheap-module-source-map' : 'source-map'
  };
};
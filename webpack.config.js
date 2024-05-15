const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './static/js/App.js', // Your main JavaScript file
    output: {
        path: path.resolve(__dirname, 'static/js'),
        filename: '[name].bundle.js', // Output bundle name
    },
    devtool: 'source-map',
    externals: {
        'three-TextGeometry': 'THREE.TextGeometry',
        'three-OrbitControls': 'THREE.OrbitControls',
        'three-orbitControls': 'THREE.OrbitControls',
        'three-GLTFLoader': 'THREE.GLTFLoader',
        'three-DRACOLoader': 'THREE.DRACOLoader',
        'three-BufferGeometryUtils': 'THREE.BufferGeometryUtils',
        'three-FBXLoader': 'THREE.FBXLoader',
        'three-TextureLoader': 'THREE.TextureLoader',
        'three-FontLoader': 'THREE.FontLoader',
        'three-SkeletonUtils': 'THREE.SkeletonUtils',
        'three-WebGL': 'THREE.WebGL',
    },
    resolve: {
        alias: {
            'three': path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
            'THREE': path.resolve(__dirname, 'node_modules/three/build/three.module.js'),
            'three-mesh-bvh': path.resolve(__dirname, 'node_modules/three-mesh-bvh/build/index.umd.cjs')
        },
    },
    plugins: [
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map'
        }),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: true,
            }),
        ],
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    }
};
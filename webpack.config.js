/*
 * @Author: 羊驼
 * @Date: 2024-05-21 14:59:30
 * @LastEditors: 羊驼
 * @LastEditTime: 2024-05-21 15:41:01
 * @Description: file content
 */
const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
module.exports = {
  mode: "production",
  devtool: false,
  entry: "./lib/index.js", // 你的组件入口文件
  output: {
    path: path.resolve(__dirname, "dist"), // 输出目录
    filename: "index.js", // 输出文件名
    library: "workflow", // 你的组件库名称
    libraryTarget: "umd", // 库目标格式，UMD可以在各种环境中使用
    globalObject: "this", // 用于UMD的全局对象
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: {
          loader: "vue-loader",
          options: {
            extractCSS: process.env.NODE_ENV === "production",
            loaders: {
              sass: "vue-style-loader!css-loader!sass-loader?indentedSyntax=1",
              scss: "vue-style-loader!css-loader!sass-loader",
              less: "vue-style-loader!css-loader!less-loader",
            },
          },
        },
      },
      {
        test: /\.s(c|a)ss$/,
        use: ["vue-style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@vue/cli-plugin-babel/preset"],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: "url-loader",
        },
      },
    ],
  },
  plugins: [
    // make sure to include the plugin for the magic
    new VueLoaderPlugin(),
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: "initial",
      minChunks: 2,
    },
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js", // 确保使用Vue的ESM版本
    },
    extensions: ["*", ".js", ".vue"], // 后缀名自动补全
  },
};

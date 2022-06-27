//Imports
import pkg from 'gulp';
const { src, dest } = pkg;
const { watch, parallel, series, task } = pkg;

import * as nodePath from "path";
const root_folder = nodePath.basename(nodePath.resolve());

//Import packedge
import del from "del";
import fileInclude from "gulp-file-include";
import replace from 'gulp-replace';
import webpHtmlNosvg from 'gulp-webp-html-nosvg';
//Plugins
import plumber from "gulp-plumber";
import notify from "gulp-notify";
import rename from "gulp-rename";
import newer from "gulp-newer"

// BRowser
import browsersync from "browser-sync";
// Scss
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass)
import cleanCss from "gulp-clean-css";
import webpcss from "gulp-webpcss";
import autoprefixer from "gulp-autoprefixer";
import groupCssMediaQueries from "gulp-group-css-media-queries";

//Js packeges
import webpack from "webpack-stream";
import minify from "gulp-minify"

//Images
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";

//Svg
import svgSprite from 'gulp-svg-sprite';

//ways to folders
const build_folder = `./build`;
const source_folder = `./src`;

const path = {
     build: {
          js: `${build_folder}/js/`,
          css: `${build_folder}/css/`,
          html: `${build_folder}/`,
          images: `${build_folder}/img`,
          files: `${build_folder}/`
     },
     src: {
          js: `${source_folder}/js/app.js`,
          images: `${source_folder}/img/**/*.{jpg,jpeg,png,gif,webp}`,
          svg: `${source_folder}/img/**/*.svg`, 
          scss: `${source_folder}/scss/style.scss`,
          html: `${source_folder}/*.html`,
          files: `${source_folder}/*.*`, 
          svgicons: `${source_folder}/svgicons/*.svg`,
     },
     watch: {
          js: `${source_folder}/**/*.js`,
          images: `${source_folder}/img/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`,
          scss: `${source_folder}/scss/**/*.scss`,
          html: `${source_folder}/**/*.html`,
          files: `${source_folder}/src/**/*.*`
     },
     clean: build_folder,
     build_folder: build_folder,
     source_folder: source_folder,
     root_folder: root_folder,
     ftp: ``
}
//Plugins for tasks
const plugins = {
     replace: replace,
     plumber: plumber,
     notify: notify,
     browsersync: browsersync,
     newer: newer

}
//Copy
const copy = () => {
     return src(path.src.files)
          .pipe(dest(path.build.files))
}
// Clean Folder and Reset
const reset = () => {
     return del(path.clean)
}


//---------------------------------------------------------------------------------------------------
//Html Task
const html = () => {
     return src(path.src.html)
          .pipe(fileInclude())
          .pipe(plugins.plumber(
               plugins.notify.onError({
                    title: "HTML",
                    message: "Error: <%= error.message %>"
               })
          ))
          .pipe(plugins.replace(/@img\//g, 'img/'))
          .pipe(webpHtmlNosvg())
          .pipe(dest(path.build.html))
          .pipe(plugins.browsersync.reload({ stream: true }))
}
//Scss function
const scss = () => {
     return src(path.src.scss)
          .pipe(plugins.plumber(
               plugins.notify.onError({
                    title: "SCSS",
                    message: "Error: <%= error.message %>"
               })
          ))
          .pipe(plugins.replace(/@img\//g, 'img/'))
          .pipe(sass({
               outputStyle: 'expanded'
          }))
          .pipe(groupCssMediaQueries())
          .pipe(webpcss({
               webpClass: ".webp",
               noWebpClass: ".no-webp"
          }))
          .pipe(autoprefixer({
               grid: true,
               overrideBrowserslist: ["last 3 version "],
               cascade: true
          }))
          .pipe(dest(path.build.css))
          .pipe(cleanCss())
          .pipe(rename({
               extname: '.min.css'
          }))
          .pipe(dest(path.build.css))
          .pipe(plugins.browsersync.reload({ stream: true }))
}

//Js Function 
const js = () => {
     return src(path.src.js, { sourcemaps: true })
          .pipe(plugins.plumber(
               plugins.notify.onError({
                    title: "SCSS",
                    message: "Error: <%= error.message %>"
               })
          ))
          // .pipe(minify({
          //      ext: {
          //           min: '.min.js'
          //      },
          //      ignoreFiles: ['-min.js']
          // }))
          .pipe(webpack({
               mode: 'development',
               output: {
                    filename: 'app.min.js'
               }
          }))
          .pipe(dest(path.build.js))
          .pipe(plugins.browsersync.reload({ stream: true }))
}
//Images function
const images = () => {
     return src(path.src.images)
          .pipe(plugins.plumber(
               plugins.notify.onError({
                    title: "IMAGES",
                    message: "Error: <%= error.message %>"
               })
          ))
          .pipe(plugins.newer(path.build.images))
          .pipe(webp())
          .pipe(dest(path.build.images))
          .pipe(src(path.src.images))
          .pipe(plugins.newer(path.build.images))
          .pipe(imagemin({
               progressive: true,
               svgPlugins: [{ removeViewBox: false }],
               interlaced: true,
               optimizationLevel: 3
          }))
          .pipe(dest(path.build.images))
          .pipe(src(path.src.svg))
          .pipe(dest(path.build.images))
          .pipe(plugins.browsersync.reload({ stream: true }))
}
//Svg Icons
const svgIcons = () => {
     return src(path.src.svgicons)
          .pipe(plugins.plumber(
               plugins.notify.onError({
                    title: "SVG",
                    message: "Error: <%= error.message %>"
               })
          ))
          .pipe(svgSprite({
               mode: {
                    stack: {
                         sprite: `./icons/icons.svg`,
                         example: true
                    }
               }
          }))
          .pipe(dest(path.build.images)) 
}     
//---------------------------------------------------------------------------------------------------
//Browser Live Server
function server (done) {
     plugins.browsersync.init({
          server: {
               baseDir: `${path.build.html}`
          },
          notify: false,
          port: 3000,
     })
}
//---------------------------------------------------------------------------------------------------
//Watch all tasks
function watcher() {
     watch(path.watch.files, copy);
     watch(path.watch.html, html);
     watch(path.watch.scss, scss);
     watch(path.watch.js, js);
     watch(path.watch.images, images);
}
//Concat tasks in one
const main_task = parallel(copy, html, scss, js, images, svgIcons)
// Looking implemention of tasks
const dev = series(reset, main_task, parallel( watcher, server))
//Implement Tasks
task('default', dev)
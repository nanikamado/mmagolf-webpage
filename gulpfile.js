const { src, dest, watch, series, parallel } = require('gulp');
const pug = require('gulp-pug');
const sass = require("gulp-sass")(require("sass"));
const through = require('through2');
const rename = require('gulp-rename');
const markdownit = require('markdown-it');
const mkKatex = require('@traptitech/markdown-it-katex');
const mkContainer = require('markdown-it-container');

const md = new markdownit();
md.use(mkKatex);
md.use(mkContainer, 'code-with-katex');

exports.pug = () =>
    src(
        ['./src/**/*.pug', '!./src/**/_*.pug']
    )
    .pipe(pug({
        pretty: false,
        locals: {
            test_local: "<p>this is test p</p>"
        },
        filters: {
            'markdown': (text, options) => md.render(text)
        }
    }))
    .pipe(dest('./dist'));

exports.scss = () =>
    src("src/style.scss")
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(dest("dist"));

exports.js = () =>
    src("src/main.js")
    .pipe(dest("dist"));

exports.default = parallel(exports.pug, exports.scss, exports.js);
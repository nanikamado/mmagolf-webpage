const gulp = require('gulp');
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
    gulp.src(
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
    .pipe(gulp.dest('./dist'));

exports.scss = () =>
    gulp
    .src("src/style.scss")
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(gulp.dest("dist"));

exports.js = () =>
    gulp
    .src("src/main.js")
    .pipe(gulp.dest("dist"));

exports.md = () =>
    gulp
    .src("src/problems/*.md")
    .pipe(through.obj(function(file, enc, cb) {
        file.contents = Buffer.from(md.render(String(file.contents)));
        cb(null, file);
    })).pipe(
        rename({
            extname: ".html"
        })
    )
    .pipe(gulp.dest("dist/problems"));
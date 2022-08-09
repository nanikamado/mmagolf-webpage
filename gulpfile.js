const { src, dest, watch, series, parallel } = require('gulp');
const gulp_pug = require('gulp-pug');
const pug = require('pug');
const sass = require('gulp-sass')(require('sass'));
const through = require('through2');
const rename = require('gulp-rename');
const markdownit = require('markdown-it');
const mkKatex = require('@traptitech/markdown-it-katex');
const mkContainer = require('markdown-it-container');
const fs = require('fs');
const through2 = require('through2');
var vinyl = require('vinyl');
var es = require('event-stream');

const md = new markdownit();
md.use(mkKatex);
md.use(mkContainer, 'code-with-katex');

function renderCode(origRule, _) {
    return (...args) => {
        const [tokens, idx] = args;
        tokens[idx].content = tokens[idx].content.replace(/\n\n$/, '\n');
        const content = tokens[idx]
            .content
            .replaceAll('"', '&quot;')
            .replaceAll("'", "&lt;");
        const origRendered = origRule(...args);
        if (content.length === 0)
            return origRendered;
        if (tokens[idx].info)
            return `<div class="code-outer">
                <div class="caption">${tokens[idx].info}</div>
                ${origRendered}
                <div class="copy-button" data-clipboard-text="${content}">Copy</div>
            </div>`;
        return `<div>
            ${origRendered}
            <div class="copy-button" data-clipboard-text="${content}">Copy</div>
        </div>`;
    };
}


md.use((md, options) => {
    md.renderer.rules.code_block = renderCode(md.renderer.rules.code_block, options);
    md.renderer.rules.fence = renderCode(md.renderer.rules.fence, options);
});

let problems = [];

const get_problems = (cb) => {
    const problem_list = fs.readFileSync('src/problems/problem-list.txt').toString().split('\n').filter(a => a !== '');
    problems = problem_list.map(p => {
        let o = JSON.parse(fs.readFileSync(`src/problems/${p}/problem.json`));
        o.id = p;
        return o;
    }
    );
    fs.writeFileSync('dist/problems.json', JSON.stringify(problems));
    cb();
};

get_problems(() => { });

const test_case_priority = (t) =>
    [t.match(/sample/) ? 0 : 1]
        .concat(t.match(/[^\d]+|\d+/g).map((d) => parseInt(d) || d))
        .concat([t]);

const cmp = (a, b) => {
    if (!a.length && !b.length) {
        return 0;
    } else if (!a.length) {
        return -1;
    } else if (!b.length) {
        return 1;
    } else if (a[0] === b[0]) {
        return cmp(a.slice(1), b.slice(1));
    } else if (a[0] < b[0]) {
        return -1;
    } else {
        return 1;
    }
};

exports.pug = () =>
    src(
        ['./src/**/*.pug', '!./src/**/_*.pug']
    )
        .pipe(gulp_pug({
            pretty: false,
            locals: {
                test_local: '<p>this is test p</p>',
                problems
            },
            filters: {
                'markdown': (text, options) => md.render(text)
            }
        }))
        .pipe(dest('./dist'));

exports.scss = () =>
    src('src/**/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(dest('dist'));

exports.js = () =>
    src('src/*.js')
        .pipe(dest('dist'));

exports.problems = () =>
    es.readArray(problems.map(p => {
        const problem_text = md.render(
            fs.readFileSync(`src/problems/${p.id}/README.md`)
                .toString()
                .replace(/([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf])\$/g, '$1 $')
                .replace(/\$([\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf])/g, '$ $1')
        ).replace(/h4>/g, 'h5>').replace(/h2>/g, 'h3>').replace(/h1>/g, 'h2>');
        const test_cases = fs.readdirSync(`src/problems/${p.id}/testcases/in`)
            .sort((a, b) => cmp(test_case_priority(a), test_case_priority(b)));
        const contents = pug.renderFile(
            'src/problem/_problem.pug',
            { problem: p, problem_text, time_limit: p.timeLimit / 1000, test_cases }
        );
        return new vinyl({ path: `${p.id}/index.html`, contents: new Buffer.from(contents) });
    }))
        .pipe(dest('dist/problem'));

exports.test_cases = () =>
    src('src/problems/*/testcases/*/*', {base: 'src/problems/'})
        .pipe(dest('dist/problem'))

// exports.default = parallel(exports.pug, exports.scss, exports.js);
exports.watch = () => {
    watch(['src/problems/**/*', './src/**/*.pug', '!./src/**/_*.pug'], exports.pug);
    watch('src/**/style.scss', exports.scss);
    watch('src/*.js', exports.js);
    watch(['src/problem/_problem.pug', 'src/problems/*/README.md'], exports.problems);
};

// exports.default = () => parallel(exports.js, exports.scss, exports.pug, exports.problems);
exports.default = parallel(exports.js, exports.scss, exports.pug, exports.problems, exports.test_cases);

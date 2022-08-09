(() => {
    'use strict';
    const $$ = t => document.querySelectorAll(t);
    const $ = t => document.querySelector(t);
    const main = () => {
        let pageNum = 0;
        const ls = $$('.nav>ul>li');
        const pages = $$('.pages>div');
        let hash_m = new Map([...ls].map((e, i) => [(new URL(e.children[0].href)).hash, i]));
        const movePage = n => {
            pages[pageNum].classList.remove('active');
            pages[n].classList.add('active');
            ls[pageNum].classList.remove('active');
            ls[n].classList.add('active');
            pageNum = n;
        };
        const hash_to_n = hash => hash_m.get(hash) || 0;
        movePage(hash_to_n(location.hash));
        ls.forEach(li => li.addEventListener('click', e => {
            const hash = (new URL(li.children[0].href)).hash;
            const n = hash_to_n(hash);
            if (pageNum !== n) {
                movePage(n)
                history.pushState('', '', hash || location.pathname);
            }
            e.preventDefault();
        }));
        window.addEventListener('popstate', e => {
            movePage(hash_to_n(location.hash));
        });
        const copy_buttons = document.getElementsByClassName("copy-button");
        [...copy_buttons].map(copy_button => copy_button.addEventListener("click", () => {
            navigator.clipboard.writeText(copy_button.clipboardText);
            copy_button.innerHTML = "Copied";
            setTimeout(() => copy_button.innerHTML = 'Copy', 1000)
        }));
        const ranking_table_tmp = $('#ranking-table');
        const ranking_elm = $('.rankings');
        const ranking_ul = $('.rankings>ul');
        (async () => {
            const ranking = await (await fetch("ranking.json", { cache: "no-cache" })).json();
            const problems = await (await fetch("problems.json")).json();
            problems.forEach(p => {
                let ranking_table = ranking_table_tmp.content.cloneNode(true);
                let tbody = ranking_table.querySelector('table>tbody');
                let h = ranking_table.querySelector('h2');
                h.innerHTML = `<a href="problem/${p.id}">${p.title}</a>`;
                (ranking[p.id] || []).forEach((r, j) => {
                    let tr = document.createElement("tr");
                    tr.innerHTML = `<td rowspan="2">${j + 1}</td><td>${r[0]} B</td><td>${r[1]}</td><td>${r[2]}</td><td><a href="javascript:void(0)" class="detail-button">詳細</a></td>`;
                    tbody.appendChild(tr);
                    let code = document.createElement("tr");
                    code.classList.add('code');
                    code.innerHTML = `<td colspan="${r.length - 1}"><div><table><tbody><tr><th>提出日時</th></tr><tr><td>${r[3]}</td></tr><tr><th>コード</th></tr><tr><td><pre>${r[4]}&#010;</pre></td></tr></tbody></table></div></td>`;
                    tbody.appendChild(code);
                });
                ranking_elm.insertBefore(ranking_table, ranking_ul);
            });
            $$('table.ranking .detail-button').forEach(e => e.addEventListener('click', e => {
                e.target.parentNode.parentNode.classList.toggle('expanded');
            }));
        })();
    };
    document.addEventListener("DOMContentLoaded", main);
})();
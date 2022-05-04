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
        fetch("ranking.json")
            .then(response =>
                response.json()
            ).then(ranking => {
                $$('.rankings>.ranking>tbody').forEach((tbody, i) => {
                    ranking[i].forEach((r, j) => {
                        let tr = document.createElement("tr");
                        tr.innerHTML = `<td rowspan="2">${j + 1}</td><td>${r[0]} B</td><td>${r[1]}</td><td>${r[2]}</td><td><a href="javascript:void(0)" class="detail-button">詳細</a></td>`;
                        tbody.appendChild(tr);
                        let code = document.createElement("tr");
                        code.classList.add('code');
                        code.innerHTML = `<td colspan="${r.length - 1}"><div><table><tbody><tr><th>提出日時</th></tr><tr><td>${r[3]}</td></tr><tr><th>コード</th></tr><tr><td><pre>${r[4]}</pre></td></tr></tbody></table></div></td>`;
                        tbody.appendChild(code);
                    });
                });
                $$('table.ranking .detail-button').forEach(e => e.addEventListener('click', e => {
                    e.target.parentNode.parentNode.classList.toggle('expanded');
                }));
            });
    };
    document.addEventListener("DOMContentLoaded", main);
})();
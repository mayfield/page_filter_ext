let showing;
let dialog;
let pageFilter;

const MAGIC = 'las44492fddljkl243lsadfljasdlkfj';
const hideClass = 'page-filter-hidden-' + MAGIC;


function showFilter() {
    if (showing) {
        return;
    }
    if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.classList.add('page-filter-' + MAGIC);
        dialog.innerHTML = `
            <form method="dialog">
                <input type="text" autocomplete="off" spellcheck="false"
                       name="page-filter" placeholder="regex page filter"/>
                <label>Case Insensitive <input type="checkbox" checked name="case-i"/></label>
                <button value="cancel">Close</button>
            </form>
        `;
        dialog.addEventListener('close', ev => showing = false);
        const caseI = dialog.querySelector('input[name="case-i"]');
        pageFilter = dialog.querySelector('input[name="page-filter"]');
        const skip = new Set([
            document.documentElement,
            document.body,
        ]);
        dialog.querySelector('form').addEventListener('input', () => {
            let re;
            try {
                if (pageFilter.value.length >= 2) {
                    re = new RegExp(pageFilter.value, caseI.checked ? 'i' : '');
                }
            } catch(e) {
                return;
            }
            const nodes = Array.from(document.all);
            const matches = new Set();
            const missing = new Set();
            const filtered = new Set();
            for (let i = 0; i < nodes.length; i++) {
                const x = nodes[i];
                if (x.closest(`dialog.page-filter-${MAGIC}, head, script, link, style`) || skip.has(x)) {
                    continue;
                }
                if (x.innerText) {
                    if (x.textContent.match(re)) {
                        matches.add(x);
                    } else {
                        missing.add(x);
                    }
                }
            }
            const roots = new Set();
            for (const x of matches) {
                let parent = x;
                while ((parent = parent.parentElement) && !roots.has(parent)) {
                    roots.add(parent);
                }
            }
            for (const root of roots) {
                if (!root.parentElement) {
                    continue;
                }
                for (const x of root.parentElement.children) {
                    if (missing.has(x) && !roots.has(x)) {
                        filtered.add(x);
                    }
                }
            }
            for (const x of document.querySelectorAll('.' + hideClass)) {
                x.classList.remove(hideClass);
            }
            for (const x of filtered) {
                x.classList.add(hideClass);
            }
        });
        document.body.append(dialog);
    }
    dialog.show();
    pageFilter.focus();
    showing = true;
}


const commands = {
    showFilter,
};

chrome.runtime.onMessage.addListener(command => {
    commands[command]();
});

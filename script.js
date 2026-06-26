//script.js
/*========================
Main Database
========================*/
const trending = [
    {
        img: "https://i0.wp.com/elintransigente.com/wp-content/uploads/2026/02/Therians.webp?w=992&quality=95&ssl=1",
        name: "Therians",
        dir: "therians",
        icon: '<img src="https://static.wikia.nocookie.net/therian/images/3/38/Theta-Delta_Reworked.svg" alt="Icon">'
    },
    {
        img: "https://www.lovebscott.com/wp-content/uploads/2025/03/Credit-@zeekayartInstagram.png",
        name: "Furries",
        dir: "furry",
        icon: '<i class="fi fi-rr-paw"></i>'
    },
    {
        img: "https://i.pinimg.com/236x/31/45/42/314542e02240a91c045f830c9745ef5a.jpg",
        name: "Femboys",
        dir: "femboy",
        icon: '<img src="https://cdn-icons-png.magnific.com/512/72/72934.png" alt="Icon">'
    },
    {
        img: "https://imgs.search.brave.com/E8rHoTTYf0M9ctr97G3cBBUniaMsp_hI931UmDtJsBE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzVhLzVk/LzliLzVhNWQ5YjY0/ZGM5NzBmYmY1ZDAx/YWJkNjRhZGM2YTdj/LmpwZw",
        name: "Transgéneros",
        dir: "transgender",
        icon: '<img src="https://4dce06115b.cbaul-cdnwnd.com/ad81221e05c0e76e640534280e224467/200000004-e55e7e6572/S%C3%ADmbolo%20Transg%C3%A9nero%20Page.png" alt="Icon">'
    }
]

const quizes = [
    {
        img: "https://i0.wp.com/elintransigente.com/wp-content/uploads/2026/02/Therians.webp?w=992&quality=95&ssl=1",
        name: "Eres un therian?",
        description: "Este quiz te ayudara a verificar si eres un therian!",
        dir: "therians"
    },
    {
        img: "https://www.lovebscott.com/wp-content/uploads/2025/03/Credit-@zeekayartInstagram.png",
        name: "Soy furry???",
        description: "Este quiz te ayudará a verificar qué tan afín eres al fandom furry!",
        dir: "furry"
    },
    {
        img: "https://i0.wp.com/elintransigente.com/wp-content/uploads/2026/02/Therians.webp?w=992&quality=95&ssl=1",
        name: "Observador Therian",
        description: "Este quiz te ayudara a identificar señales de identidad therian en tu hijo, estudiante o conocido!",
        dir: "isfriendtherian"
    }
]

let userdata = {
    username: "Usuario",
    accent: "Purple",
    theme: "Light"
}

let currentArticle = null;
let currentArticleTitle = '';
let currentArticleText = '';
let aiChatHistory = [];
let currentQuizData = null;
let currentQuizQuestions = [];

let debugModeOpen = false;
let debug_writingArticle = false;

/*========================
DOM Shortcuts
========================*/
const $ = (fr) => document.getElementById(fr);

/*========================
Localstorage
========================*/
function loadUserData() {
    const loadedUsrDat = localStorage.getItem('userdata');
    if (loadedUsrDat) {
        try {
            const parsedUsrDat = JSON.parse(loadedUsrDat);
            userdata = parsedUsrDat;
        } catch(e) {
            console.error('Invalid JSON Data:',e);
        }
    }
}

function saveUserData() {
    if (userdata) {
        try {
            const stringifiedUsrDat = JSON.stringify(userdata);
            localStorage.setItem('userdata', stringifiedUsrDat);
            updateRqData();
        } catch(e) {
            console.error('Invalid JSON Data:',e);
        }
    }
}

function updateRqData() {
    $('welcometext').textContent = `Bienvenido, ${userdata.username}!`;
    $('settings_usernameInput').value = userdata.username;
}
/*========================
Main Wallpapers
========================*/
function setWallpaper(type = "main") {
    const articleBG_deviceType = (window.matchMedia("(max-width: 768px)").matches) ? "mobile" : "desktop";
    const articleBackgroundImage = `/background/${type}/${articleBG_deviceType}_${userdata.theme}.webp`;

    document.body.style.backgroundImage = `URL('${articleBackgroundImage}')`;
}

/*========================
Sidebar
========================*/
$('sidebar').onmouseenter = () => {
    $('sidebar').classList.add('onhover');
};
$('sidebar').onmouseleave = () => {
    $('sidebar').classList.remove('onhover');
};

function showSidebar(show = true) {
    if (show) {
        $('sidebar').classList.add('onhover');
    } else {
        $('sidebar').classList.remove('onhover');
    }
}

/*========================
Page/Articles System
========================*/
window.addEventListener('popstate', (e) => {
    if (e.state?.page === 'article') {
        openArticle(e.state.id, false);
    } else if (e.state?.page === 'quizes') {
        openQuiz(e.state.id, false);
    } else {
        gotoPage('home');
    }
});
 
window.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    const articleMatch = path.match(/^\/articulo\/(.+)$/);
    const quizMatch    = path.match(/^\/quiz\/(.+)$/);

    if (articleMatch) {
        openArticle(articleMatch[1], false);
        history.replaceState({ page: 'article', id: articleMatch[1] }, '', path);
    } else if (quizMatch) {
        openQuiz(quizMatch[1], false);
        history.replaceState({ page: 'quizes', id: quizMatch[1] }, '', path);
    } else {
        gotoPage('home');
    }
});
 
function hideAllPages() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
}
 
function gotoPage(page = 'home', redirect = 'lang') {
    document.body.style.backgroundImage = "";
    hideAllPages();
    if (window.matchMedia("(max-width: 768px)").matches) {
        showSidebar(false);
    }
    $('searchbar_results_wrapper').classList.add('hidden');
    try {
        $(`page_${page}`).classList.remove('hidden');
    } catch(e) {}
    $('floating_back_mobile').classList.remove('hidden');
    if (page === "home") {
        renderHomescreenTrending();
        $('homepage_searchbar').value = '';
        currentArticle = null;

        setWallpaper('main');

        history.pushState({ page: 'home' }, '', '/');
        document.title = 'Identiccionary';
    }
    if (page === "settings") {
        gotoStPage(redirect);
        $('floating_back_mobile').classList.add('hidden');

        setWallpaper('settings');
    }
    if (page === "debug") {
        debugModeOpen = true;
    }
    if (page === "quizes") {
        renderQuizes();
    }
    if (page === "debug_createArtcl") {
        debug_writingArticle = true;
    }
    if (page === "all") {
        renderAllPage(0);
    }
}

async function openArticle(article, updateUrl = true) {
    gotoPage('articles');
 
    const basePath = `/articles/${article}`;
    const contentEl = $('article_content');
 
    $('loading-overlay').classList.remove('hidden');
    $('article_title').textContent = 'Cargando...';
    contentEl.innerHTML = '';
 
    try {
        const [dataRes, mdRes] = await Promise.all([
            fetch(`${basePath}/data.json`),
            fetch(`${basePath}/content.md`)
        ]);
 
        if (!dataRes.ok || !mdRes.ok) {
            throw new Error(`No se encontro el articulo "${article}"`);
        }
 
        const data = await dataRes.json();
        const mdText = await mdRes.text();
 
        $('loading-overlay').classList.add('hidden');
 
        $('article_title').textContent = data.title;
        $('article_asidetitle').textContent = data.title;
 
        const articleBG_deviceType = (window.matchMedia("(max-width: 768px)").matches) ? "mobile" : "desktop";
        const articleBackgroundImage = `/articles/${article}/backgrounds/${articleBG_deviceType}_${userdata.theme}.webp`;

        //document.body.style.backgroundImage = `linear-gradient(var(--bg-article), var(--bg-article)), url('${data.mainimg}')`;
        document.body.style.backgroundImage = `linear-gradient(var(--bg-article), var(--bg-article)), url('${articleBackgroundImage || data.mainimg}')`;
 
        $('article_asideimg').src = data.mainimg;
        $('article_asidecontent').textContent = data.asideinfo;
        $('article_publishinfo').innerHTML = `Publicado el <strong>${data.date}</strong> por <strong>${data.author}</strong>`;
 
        const processedMd = processCustomVideoTags(mdText, basePath);
        contentEl.innerHTML = marked.parse(processedMd);
 
        currentArticle = article;
        currentArticleTitle = data.title;
        currentArticleText = contentEl.textContent;
        aiChatHistory = [];
        document.querySelector('#aimodal .messages_container').innerHTML = '';

        if (debugModeOpen) {
            $('article_modifyarticle_btn').classList.remove('hidden');
        }
 
        if (updateUrl) {
            history.pushState({ page: 'article', id: article }, '', `/articulo/${article}`);
        }
        document.title = `${data.title} | Identiccionary`;
 
    } catch(e) {
        console.error(e);
        contentEl.innerHTML = `<h2>Ocurrio un error :(</h2> <p>Lamentamos mucho el problema,
            por favor <a href="mailto:galletamelendez5@gmail.com?subject=Error%20de%20Identiccionary&body=Estoy%20reportando%20un%20error%20en%20Identiccionary%20el%20cual%20no%20contiene%20detalles%20especificos.">
            reporta este error.
            </a>
        </p>`;
        $('loading-overlay').classList.add('hidden');
    }
}

function processCustomVideoTags(mdText, basePath) {
    return mdText.replace(/\{\{video:\s*(.+?)\}\}/g, (match, filename) => {
        const trimmed = filename.trim();

        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return `<div class="video-wrapper"><iframe src="${trimmed}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
        }

        return `<div class="video-wrapper"><video controls src="${basePath}/${trimmed}"></video></div>`;
    });
}


/*========================
Serach Tokenizer
========================*/
const stopwords = new Set([
    'el','la','los','las','un','una','unos','unas','de','del','al','a','y','o','u',
    'que','es','en','con','por','para','le','les','se','lo','su','sus','mi','mis',
    'tu','tus','dice','dijo','porque','como','cuando','donde','este','esta','estos',
    'estas','ese','esa','esos','esas','muy','mas','pero','si','no','ya','me','te','su'
]);

function tokenizeQuery(q) {
    return q
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !stopwords.has(t));
}

function searchArticles(query) {
    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) return [];

    const bestByItem = new Map();

    tokens.forEach(token => {
        fuse.search(token).forEach(({ item, score }) => {
            const prev = bestByItem.get(item.id);
            if (!prev || score < prev.score) {
                bestByItem.set(item.id, { item, score });
            }
        });
    });

    return [...bestByItem.values()].sort((a, b) => a.score - b.score);
}

/*========================
Settings Pages
========================*/
function hideAllStPages() {
    document.querySelectorAll('.settings_page').forEach(page => {
        page.classList.add('hidden');
    });
}

function gotoStPage(page = 'lang') {
    hideAllStPages();
    try {
        $(`settings_page_${page}`).classList.remove('hidden');
    } catch(e) {}
}

gotoStPage('lang');

function settings_saveUsername() {
    userdata.username = $('settings_usernameInput').value;

    saveUserData();

    showToast('Datos guardados', 'success');
}

function settings_clearData() {
    localStorage.clear();
    window.location.reload();
}

function toggleShowImgs() {
    $('page_home').classList.toggle('hideimages');

    if ($('page_home').classList.contains('hideimages')) {
        showToast('Imagenes desactivadas', 'success');
    } else {
        showToast('Imagenes activadas', 'success');
    }
}

function setDarkMode(on = "dark") {
    if (on === "dark") {
        document.body.classList.add('darkMode');
        userdata.theme = "dark";
    } else {
        document.body.classList.remove('darkMode');
        userdata.theme = "light";
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('darkMode');
    if (document.body.classList.contains('darkMode')) {
        userdata.theme = "dark";
        showToast('Modo oscuro activado', 'success');
    } else {
        userdata.theme = "light";
        showToast('Modo oscuro desactivado', 'success');
    }
    saveUserData();

    setWallpaper('settings');
}

function settings_askForDebugPassword() {
    $('passcode-overlay').classList.remove('hidden');
    $('passcode_ovr__input').value = '';
    $('wrong_code_msg').classList.remove('showerror');
}

function settings_debugOvr_trylogin() {
    if ($('passcode_ovr__input').value === "1234uwu") { //ya se que es inseguro poner contrase;as en el frontend, pero no ocupo seguridad real jeje
        $('passcode-overlay').classList.add('hidden');
        gotoPage('debug');

    } else {
        $('wrong_code_msg').classList.add('showerror');
    }
}

/*========================
Search
========================*/
let articleIdx = [];
let fuse;

async function loadManifest() {
    const res = await fetch('/manifest.json');
    articleIdx = await res.json();
    fuse = new Fuse(articleIdx, {
        keys: ['title', 'tags'],
        threshold: 0.4
    });
}

$('homepage_searchbar').onclick = () => {
    const rect = $('homepage_searchbar').getBoundingClientRect();

    $('searchbar_results_wrapper').style.left = rect.left + "px";
    $('searchbar_results_wrapper').style.top = ((rect.bottom + window.scrollY) + 20) + "px";

    $('searchbar_results_wrapper').classList.remove('hidden');
}

$('homepage_searchbar').addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (!query) {
        $('searchbar_results_wrapper').innerHTML = '<span style="width: 100%; text-align: center;">Busca algo...</span>';
        return;
    };
    renderSearchResults(searchArticles(query));
});

document.addEventListener('click', (e) => {
    const wrapper = $('searchbar_results_wrapper');
    const searchInput = $('homepage_searchbar');

    if (!wrapper || !searchInput) return;

    if (wrapper.classList.contains('hidden')) return;

    if (wrapper.contains(e.target) || searchInput.contains(e.target) || e.target === searchInput) return;

    wrapper.classList.add('hidden');
});


/*========================
Renders
========================*/
function renderHomescreenTrending(db = trending) {
    const container = $('homepage_trending');
    container.innerHTML = '';

    db.forEach(item => {
        const itemTr = document.createElement('div');
        itemTr.className = 'tr_item';
        itemTr.innerHTML = `
            <img alt="Example Image" src="${item.img}">
            <span class="title">${item.name}</span>
            <button class="gobtn"> Ver más <i class="fi fi-br-angle-right"></i> </button>
        `;
        itemTr.onclick = () => openArticle(item.dir);
        container.appendChild(itemTr);
    });
}

function renderSidebarTrending(db = trending) {
    const container = $('trending_sidebar');
    container.innerHTML = '';

    db.forEach(item => {
        const itemBtn = document.createElement('button');
        itemBtn.onclick = () => openArticle(item.dir);
        itemBtn.innerHTML = `
            ${item.icon} ${item.name}
        `;
        container.appendChild(itemBtn);
    });
}

function renderSearchResults(results) {
    const container = $('searchbar_results_wrapper');
    container.innerHTML = '';

    results.forEach(({item}) => {
        const el = document.createElement('div');
        el.className = 'resItem';
        el.innerHTML = `
            <span class="title">${item.title}</span>
            <div class="moreinfo"> <i class="fi fi-br-angle-right"></i> </div>
        `;
        el.onclick = () => openArticle(item.id);

        container.appendChild(el);
    });
}

let allPage_currentPage = 0;
const ALL_PAGE_SIZE = 20;

function renderAllPage(page = 0) {
    allPage_currentPage = page;
    const start = page * ALL_PAGE_SIZE;
    const items = articleIdx.slice(start, start + ALL_PAGE_SIZE);
    const totalPages = Math.ceil(articleIdx.length / ALL_PAGE_SIZE);

    const container = $('allpg_item_wrapper_grid');
    container.innerHTML = '';
    container.scrollIntoView({ behavior: 'smooth' });

    items.forEach(item => {
        const itemTr = document.createElement('div');
        itemTr.className = 'tr_item';
        itemTr.innerHTML = `
            <img alt="${item.title}" src="${item.mainimg || 'https://placehold.co/600x400'}">
            <span class="title">${item.title}</span>
            <button class="gobtn"> Ver más <i class="fi fi-br-angle-right"></i> </button>
        `;
        itemTr.onclick = () => openArticle(item.id);
        container.appendChild(itemTr);
    });

    document.querySelectorAll('.pagination_wrapper').forEach(item => item.remove());
    const paginationEl = document.createElement('div');
    paginationEl.className = 'pagination_wrapper';
    paginationEl.innerHTML = `
        <button class="btn neutral" onclick="renderAllPage(${page - 1})" ${page === 0 ? 'disabled' : ''}>
            <i class="fi fi-rr-angle-left"></i> Anteriores
        </button>
        <span>${page + 1} / ${totalPages}</span>
        <button class="btn neutral" onclick="renderAllPage(${page + 1})" ${page >= totalPages - 1 ? 'disabled' : ''}>
            Siguientes <i class="fi fi-rr-angle-right"></i>
        </button>
    `;
    $('page_all').appendChild(paginationEl);
}

function renderQuizes(db = quizes) {
    const container = $('page_quizes_quizescontainer');
    container.innerHTML = '';

    db.forEach(item => {
        const itemTr = document.createElement('div');
        itemTr.className = 'tr_item quiz';
        itemTr.innerHTML = `
            <img alt="Example Image" src="${item.img}">
            <span class="title">${item.name}</span>
            <span class="description">${item.description}</span>
            <button class="gobtn"> Tomar quiz <i class="fi fi-br-angle-right"></i> </button>
        `;
        itemTr.onclick = () => openQuiz(item.dir);
        container.appendChild(itemTr);
    });
}

/*========================
Quizes System
========================*/
async function openQuiz(quizId, updateUrl = true) {
    gotoPage('quizform');
 
    const basePath = `/quizes/${quizId}`;
    const contentEl = $('quizFormContainer');
 
    $('loading-overlay').classList.remove('hidden');
    contentEl.innerHTML = '';
 
    try {
        const [dataRes, mdRes] = await Promise.all([
            fetch(`${basePath}/data.json`),
            fetch(`${basePath}/questions.json`)
        ]);
 
        if (!dataRes.ok || !mdRes.ok) {
            throw new Error(`No se encontro el quiz "${quizId}"`);
        }
 
        const data = await dataRes.json();
        const mdText = await mdRes.json();
 
        $('loading-overlay').classList.add('hidden');
 
        //A PARTIR DE AQUI SE PUEDE USAR data y mdText
        $('quizFormDateAuthor').innerHTML = `Creado el <strong>${data.date}</strong> por <strong>${data.author}</strong>`;
        $('quizFormDescription').textContent = data.description;
        $('quizFormTitle').textContent = data.title;
        $('quizFormTopImg').style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%), url(${data.mainimg})`;

        currentQuizData = data;
        currentQuizQuestions = mdText;

        mdText.forEach(object => {
            const op_wrapper = document.createElement('div');
            op_wrapper.className = "op_wrapper";
            object.options.forEach(option => {
                const optionBtn = document.createElement('button');
                optionBtn.className = `opt quizFormBtn_${object.quesitonid}`;
                optionBtn.innerHTML = `
                    <img src="${option.img || 'https://placehold.co/600x400?text=→'}" alt="Imagen sobre la opcion">
                    <label>${option.text}</label>
                `;
                optionBtn.onclick = () => {
                    document.querySelectorAll(`.quizFormBtn_${object.quesitonid}`).forEach(qst => qst.classList.remove('selected'));
                    optionBtn.classList.add('selected');
                };
                op_wrapper.appendChild(optionBtn);
            });

            const fitem = document.createElement('div');
            fitem.className = "fitem";
            fitem.innerHTML = `<span class="question">${object.question}</span>`;

            fitem.appendChild(op_wrapper);

            contentEl.appendChild(fitem);
        });
 
        if (updateUrl) {
            history.pushState({ page: 'quizes', id: quizId }, '', `/quiz/${quizId}`);
        }
        document.title = `${data.title} | Identiccionary`;
 
    } catch(e) {
        console.error(e);
        contentEl.innerHTML = `<h2>Ocurrio un error :(</h2> <p>Lamentamos mucho el problema,
            por favor <a href="mailto:galletamelendez5@gmail.com?subject=Error%20de%20Identiccionary&body=Estoy%20reportando%20un%20error%20en%20Identiccionary%20el%20cual%20no%20contiene%20detalles%20especificos.">
            reporta este error.
            </a>
        </p>`;
        $('loading-overlay').classList.add('hidden');
    }
}

async function quizFormShowResults() {
    const answers = currentQuizQuestions.map(q => {
        const selected = document.querySelector(`.quizFormBtn_${q.quesitonid}.selected`);
        return {
            question: q.question,
            answer: selected ? selected.querySelector('label').textContent.trim() : 'Sin respuesta'
        };
    });

    const answersText = answers
        .map(a => `Q: ${a.question}\nR: ${a.answer}`)
        .join('\n\n');

    gotoPage('quizResults');
    $('loading-overlay').classList.remove('hidden');
    $('quizResTitle').textContent = 'Analizando...';
    $('quizResFullInfo').textContent = '';

    try {
        const res = await fetch('/.netlify/functions/ask-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                quizTitle:       currentQuizData.title,
                quizDescription: currentQuizData.description,
                mainQuestion:    currentQuizData.mainquestionforai,
                answersText
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error desconocido');

        $('quizResTitle').textContent    = data.titleRes;
        $('quizResFullInfo').textContent = data.explanationRes;

    } catch(e) {
        console.error(e);
        $('quizResTitle').textContent    = 'Error';
        $('quizResFullInfo').textContent = 'Ocurrió un error al analizar tus respuestas. Intenta de nuevo.';
        showToast('Error al consultar la IA', 'danger');
    }

    $('loading-overlay').classList.add('hidden');
}

/*========================
AI Modal & System
========================*/
let AIModalBox_drag = false;
let AIMB_offsetX = 0;
let AIMB_offsetY = 0;

const AIModalBox = $('aimodal');
const AIUserInput = $('aimodal-usrinput');

AIUserInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMsgToAI();
});

$('aimodal_topbar').addEventListener('pointerdown', (e)=>{
    AIModalBox_drag = true;
    const rect = AIModalBox.getBoundingClientRect();
    AIMB_offsetX = e.clientX - rect.left;
    AIMB_offsetY = e.clientY - rect.top;
});

document.addEventListener('pointerup', ()=>{
    AIModalBox_drag = false;
});

document.addEventListener('pointermove', (e)=>{
    if (!AIModalBox_drag) return;

    AIModalBox.style.left = (e.clientX - AIMB_offsetX) + 'px';
    AIModalBox.style.top = (e.clientY - AIMB_offsetY) + 'px';
});

function closeAIModal() {
    AIModalBox.classList.add('hidden');
}

function article_askAI() {
    AIModalBox.classList.remove('hidden');
}

async function sendMsgToAI() {
    if (!window.location.href.includes('netlify.app')) {
        showToast('No puedes usar ClintAI localmente.', 'danger');
        return;
    }
    const input = AIUserInput;
    const question = input.value.trim();
    if (!question) return;

    const msgsContainer = document.querySelector('#aimodal .messages_container');

    const userBubble = document.createElement('div');
    userBubble.className = 'msg user';
    userBubble.textContent = question;
    msgsContainer.appendChild(userBubble);

    input.value = '';
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'msg ai loading';
    loadingBubble.textContent = 'Pensando...';
    msgsContainer.appendChild(loadingBubble);
    msgsContainer.scrollTop = msgsContainer.scrollHeight;

    try {
        const res = await fetch('/.netlify/functions/ask-ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question,
                articleTitle: currentArticleTitle,
                articleContent: currentArticleText,
                history: aiChatHistory
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error desconocido');

        loadingBubble.remove();

        const aiBubble = document.createElement('div');
        aiBubble.className = 'msg ai';
        aiBubble.textContent = data.answer;
        msgsContainer.appendChild(aiBubble);

        aiChatHistory.push({ role: 'user', content: question });
        aiChatHistory.push({ role: 'assistant', content: data.answer });

    } catch (e) {
        console.error(e);
        loadingBubble.textContent = 'Ocurrió un error, intenta de nuevo.';
        loadingBubble.classList.add('error');
        showToast('Error al consultar la IA', 'danger');
    }

    msgsContainer.scrollTop = msgsContainer.scrollHeight;
}

/*========================
Markdown Editor
========================*/
const debug_currentEditingArtc = {
    title: "",
    asideinfo:"",
    author:"desconocido",
    date:"--",
    mainimg:"",
    tags:[]
};
function renderMarkdownEditor() {
    $('markdown_editor').innerHTML = `
        <div class="md-toolbar">
            <button data-cmd="h1" title="Encabezado 1"><i class="fi fi-rr-h1"></i></button>
            <button data-cmd="h2" title="Encabezado 2"><i class="fi fi-rr-h2"></i></button>
            <button data-cmd="h3" title="Encabezado 3"><i class="fi fi-rr-h3"></i></button>
            <span class="md-sep"></span>
            <button data-cmd="bold" title="Negrita"><i class="fi fi-rr-bold"></i></button>
            <button data-cmd="italic" title="Cursiva"><i class="fi fi-rr-italic"></i></button>
            <span class="md-sep"></span>
            <button data-cmd="ul" title="Lista"><i class="fi fi-rr-list"></i></button>
            <button data-cmd="ol" title="Lista numerada"><i class="fi fi-rr-list-check"></i></button>
            <button data-cmd="quote" title="Cita"><i class="fi fi-rr-quote-right"></i></button>
            <span class="md-sep"></span>
            <button data-cmd="link" title="Enlace"><i class="fi fi-rr-link"></i></button>
            <button data-cmd="image" title="Imagen"><i class="fi fi-rr-picture"></i></button>
            <button data-cmd="video" title="Video" class="hidden"><i class="fi fi-rr-video-camera"></i></button>
            <button data-cmd="code" title="Código"><i class="fi fi-rr-code-simple"></i></button>
            <button data-cmd="hr" title="Separador"><i class="fi fi-rr-line-width"></i></button>
            <span class="md-sep"></span>
            <button data-cmd="preview" id="md_preview_toggle" title="Vista previa"><i class="fi fi-rr-eye"></i></button>
        </div>
        <div class="md-editor-body">
            <textarea id="md_textarea" placeholder="Escribe aqui..." spellcheck="false"></textarea>
            <div id="md_preview" class="hidden"></div>
        </div>
    `;

    const textarea = $('md_textarea');

    $('markdown_editor').querySelectorAll('.md-toolbar button[data-cmd]').forEach(btn => {
        btn.onclick = () => md_runCommand(btn.dataset.cmd, textarea);
    });
}

function md_getLineBounds(text, pos) {
    const start = text.lastIndexOf('\n', pos - 1) + 1;
    let end = text.indexOf('\n', pos);
    if (end === -1) end = text.length;
    return { start, end };
}

function md_wrapSelection(textarea, before, after = before) {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e) || 'texto';

    textarea.setRangeText(`${before}${selected}${after}`, s, e, 'select');
    textarea.focus();
    textarea.setSelectionRange(s + before.length, s + before.length + selected.length);
}

function md_prefixLines(textarea, prefix, numbered = false) {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const blockStart = md_getLineBounds(value, s).start;
    const blockEnd = md_getLineBounds(value, Math.max(e - 1, s)).end;

    const block = value.slice(blockStart, blockEnd);
    const lines = block.split('\n');

    const newBlock = lines
        .map((line, i) => numbered ? `${i + 1}. ${line}` : `${prefix}${line}`)
        .join('\n');

    textarea.setRangeText(newBlock, blockStart, blockEnd, 'end');
    textarea.focus();
}

function md_insertAtCursor(textarea, text, cursorOffset = null) {
    const { selectionStart: s } = textarea;
    textarea.setRangeText(text, s, textarea.selectionEnd, 'end');
    textarea.focus();
    if (cursorOffset !== null) {
        textarea.setSelectionRange(s + cursorOffset, s + cursorOffset);
    }
}

function md_runCommand(cmd, textarea) {
    switch (cmd) {
        case 'h1': md_prefixLines(textarea, '# '); break;
        case 'h2': md_prefixLines(textarea, '## '); break;
        case 'h3': md_prefixLines(textarea, '### '); break;
        case 'bold': md_wrapSelection(textarea, '**'); break;
        case 'italic': md_wrapSelection(textarea, '_'); break;
        case 'ul': md_prefixLines(textarea, '- '); break;
        case 'ol': md_prefixLines(textarea, '', true); break;
        case 'quote': md_prefixLines(textarea, '> '); break;
        case 'code': {
            const isMultiline = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd).includes('\n');
            md_wrapSelection(textarea, isMultiline ? '```\n' : '`', isMultiline ? '\n```' : '`');
            break;
        }
        case 'link': {
            const url = prompt('URL del enlace:', 'https://');
            if (!url) return;
            const { selectionStart: s, selectionEnd: e, value } = textarea;
            const txt = value.slice(s, e) || 'texto del enlace';
            md_insertAtCursor(textarea, `[${txt}](${url})`);
            break;
        }
        case 'image': {
            const url = prompt('URL de la imagen:', 'https://');
            if (!url) return;
            md_insertAtCursor(textarea, `![descripción](${url})`);
            break;
        }
        case 'video': {
            const url = prompt('URL de YouTube o nombre de archivo local (ej: video.mp4):', 'https://');
            if (!url) return;
            md_insertAtCursor(textarea, `{{video: ${url}}}`);
            break;
        }
        case 'hr':
            md_insertAtCursor(textarea, '\n\n---\n\n');
            break;
        case 'preview':
            md_togglePreview();
            break;
    }
}

function md_togglePreview() {
    const textarea = $('md_textarea');
    const preview = $('md_preview');
    const btn = $('md_preview_toggle');

    const showingPreview = !preview.classList.contains('hidden');

    if (showingPreview) {
        preview.classList.add('hidden');
        textarea.classList.remove('hidden');
        btn.classList.remove('active');
    } else {
        preview.innerHTML = marked.parse(textarea.value || '*Sin contenido todavía...*');
        preview.classList.remove('hidden');
        textarea.classList.add('hidden');
        btn.classList.add('active');
    }
}

function debug_openmd() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,text/markdown,text/plain';

    input.onchange = () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            $('md_textarea').value = reader.result;
            showToast('Archivo cargado', 'success');
        };
        reader.onerror = () => showToast('Error al leer el archivo', 'danger');
        reader.readAsText(file);
    };

    input.click();
}

async function debug_downloadmd() {
    const mdContent   = $('md_textarea').value;
    const tagsRaw     = $('modatc_config_stags')?.value || '';
    const tags        = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

    const dataJson = {
        title:     debug_currentEditingArtc.title     || $('editor_article_title').value || '',
        asideinfo: debug_currentEditingArtc.asideinfo || $('editor_article_asidecontent').value || '',
        author:    debug_currentEditingArtc.author    || '',
        date:      debug_currentEditingArtc.date      || '',
        mainimg:   debug_currentEditingArtc.mainimg   || '',
        tags:      debug_currentEditingArtc.tags?.length ? debug_currentEditingArtc.tags : tags
    };

    const zip = new JSZip();
    zip.file('content.md', mdContent);
    zip.file('data.json', JSON.stringify(dataJson, null, 4));

    const blob = await zip.generateAsync({ type: 'blob' });
    const url  = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href     = url;
    a.download = `${dataJson.title || 'articulo'}.zip`;
    a.click();

    URL.revokeObjectURL(url);
    showToast('Artículo descargado', 'success');

    debug_writingArticle = false;
}

function debug_configmd() {
    $('modatc_config-overlay').classList.remove('hidden');
}

$('editor_article_asidecontent').addEventListener('change', () => {
    debug_currentEditingArtc.asideinfo  =  $('editor_article_asidecontent').value;
});
$('editor_article_title').addEventListener('change', () => {
    debug_currentEditingArtc.title  =  $('editor_article_title').value;

    $('editor_article_asidetitle').textContent = $('editor_article_title').value;
});

function debug_savemdsettings() {
    $('editor_article_publishinfo').innerHTML = `Publicado el <strong>${$('modatc_config_dateinput').value}</strong> por <strong>${$('modatc_config_authorinput').value}</strong>`;
    $('editor_article_asideimg').src = $('modatc_config_mainimg').value;

    debug_currentEditingArtc.author  =  $('modatc_config_authorinput').value;
    debug_currentEditingArtc.date    =  $('modatc_config_dateinput').value;
    debug_currentEditingArtc.mainimg    =  $('modatc_config_mainimg').value;
    debug_currentEditingArtc.tags = $('modatc_config_stags').value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

    showToast('Datos guardados!', 'success');
    $('modatc_config-overlay').classList.add('hidden');
}

async function openArticleModify() {
    gotoPage('debug_createArtcl');

    $('editor_article_title').value         = currentArticleTitle;
    $('editor_article_asidetitle').textContent = currentArticleTitle;
    $('editor_article_asidecontent').value  = $('article_asidecontent').textContent;

    debug_currentEditingArtc.title    = currentArticleTitle;
    debug_currentEditingArtc.asideinfo = $('article_asidecontent').textContent;

    try {
        const dataRes = await fetch(`/articles/${currentArticle}/data.json`);
        const data    = await dataRes.json();

        $('modatc_config_authorinput').value = data.author || '';
        $('modatc_config_dateinput').value   = data.date   || '';
        $('modatc_config_stags').value       = (data.tags || []).join(', ');

        debug_currentEditingArtc.author  = data.author  || '';
        debug_currentEditingArtc.date    = data.date    || '';
        debug_currentEditingArtc.tags    = data.tags    || [];
        debug_currentEditingArtc.mainimg = data.mainimg || '';

        $('editor_article_publishinfo').innerHTML =
            `Publicado el <strong>${data.date}</strong> por <strong>${data.author}</strong>`;

        if (data.mainimg) showImgPreview(data.mainimg);

    } catch(e) {
        showToast('No se pudo cargar data.json', 'danger');
    }

    try {
        const mdRes = await fetch(`/articles/${currentArticle}/content.md`);
        const md    = await mdRes.text();
        $('md_textarea').value = md;
    } catch(e) {
        showToast('No se pudo cargar content.md', 'danger');
    }
}

/*========================
Image Upload (Editor)
========================*/
let _imgUploadBase64 = null;

function initImgUploadZone() {
    const zone      = $('img_upload_zone');
    const fileInput = $('img_upload_fileinput');

    zone.addEventListener('click', (e) => {
        if (e.target === $('modatc_config_mainimg')) return;
        fileInput.click();
    });

    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processImgFile(file);
    });

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) processImgFile(file);
    });

    $('modatc_config_mainimg').addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            _imgUploadBase64 = null;
            showImgPreview(val);
        }
    });
}

function processImgFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const maxW   = 640;
            const scale  = Math.min(1, maxW / img.width);
            const canvas = document.createElement('canvas');
            canvas.width  = Math.round(img.width  * scale);
            canvas.height = Math.round(img.height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            _imgUploadBase64 = base64;
            debug_currentEditingArtc.mainimg = base64;
            $('modatc_config_mainimg').value = '';
            showImgPreview(base64);
            showToast('Imagen comprimida y cargada', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function showImgPreview(src) {
    $('img_upload_zone').classList.add('hidden');
    $('img_preview_wrapper').classList.remove('hidden');
    $('img_preview').src = src;
    $('editor_article_asideimg').src = src;
}

function clearImgUpload() {
    _imgUploadBase64 = null;
    debug_currentEditingArtc.mainimg = '';
    $('img_upload_zone').classList.remove('hidden');
    $('img_preview_wrapper').classList.add('hidden');
    $('img_preview').src = '';
    $('modatc_config_mainimg').value = '';
    $('img_upload_fileinput').value  = '';
}

/*========================
Toast
========================*/
function showToast(text = "Toast...", type = 'neutral', autohide = 3000) {
    $('toast_text').textContent = text;
    $('toast').classList.add('showtoast');
    $('toast').classList.add(type);

    if (autohide) {
        setTimeout(()=>{
            hideToast();
        },autohide);
    }
}

function hideToast() {
    $('toast').classList.remove('showtoast');
}

/*========================
Init
========================*/
loadManifest();
loadUserData();
renderSidebarTrending();
renderMarkdownEditor();
initImgUploadZone();

updateRqData();

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(()=>{
        window.scrollTo(0, 0);

        setDarkMode(userdata.theme);
        setWallpaper('main');
    },30);
});

window.addEventListener('load', () => {
    setTimeout(()=>{
        window.scrollTo(0, 0);

        $('loading-overlay').classList.add('hidden');

        $('homepage_trending').classList.add('showanimated');
        $('homescreen_logo').classList.add('showlogo');

        const savedLang = localStorage.getItem('i12y_lang')
        || navigator.language.split('-')[0]
        || 'es';

        i18n.load(savedLang);
    },200);
});

window.addEventListener('beforeunload', (e) => {
    if (debug_writingArticle) {
        e.preventDefault();
    }
});
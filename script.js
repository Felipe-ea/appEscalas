const AVAILABLE_USERS = [
    { id: 'u1', name: 'Felipe' },
    { id: 'u2', name: 'Maria' },
    { id: 'u3', name: 'João' },
    { id: 'u4', name: 'Ana' },
    { id: 'u5', name: 'Lucas' },
    { id: 'u6', name: 'Isabela' },
    { id: 'u7', name: 'Rafael' },
    { id: 'u8', name: 'Bruna' },
    { id: 'u9', name: 'Pedro' },
    { id: 'u10', name: 'Carolina' }
];

const ROLES = [
    { key: 'opening', label: 'Abertura', multiple: false },
    { key: 'minister', label: 'Ministro(a) de louvor', multiple: false },
    { key: 'bv', label: 'Back Vocal', multiple: true },
    { key: 'guitar_ac', label: 'Violão', multiple: false },
    { key: 'guitar_el', label: 'Guitarra', multiple: false },
    { key: 'bass', label: 'Baixo', multiple: false },
    { key: 'keys', label: 'Teclado', multiple: false },
    { key: 'drums', label: 'Bateria', multiple: false },
    { key: 'offering', label: 'Palavra de oferta', multiple: false },
    { key: 'preacher', label: 'Pregador(a)', multiple: false }
];

const STORAGE_KEY = 'louvor_schedules_v1';
const raw = localStorage.getItem(STORAGE_KEY);
const SCHEDULES = raw ? JSON.parse(raw) : {};

function saveLocal() { localStorage.setItem(STORAGE_KEY, JSON.stringify(SCHEDULES)); }

// Pega e armazena as section do painel, edicao e historico
const panelView = document.querySelector('#panelView section') || document.querySelector('#panelView');
const panelSection = document.querySelector('#panelView section');
const editView = document.getElementById('editView');
const historyView = document.getElementById('historyView');

// logica da troca aba
// Chama a funcao switchTo passando como parametro o nome do botao que foi clicado
document.getElementById('tab-panel').addEventListener('click', () => switchTo('panel'));
document.getElementById('tab-edit').addEventListener('click', () => switchTo('edit'));
document.getElementById('tab-history').addEventListener('click', () => switchTo('history'));

// função para trocar de aba
function switchTo(name) {
    // se (name) retornar verdadeiro adiciona o elemento
    // se (name) retornar falso retira o elemento
    document.getElementById('tab-panel').classList.toggle('bg-brand/10', name === 'panel');
    document.getElementById('tab-edit').classList.toggle('bg-brand/10', name === 'edit');
    document.getElementById('tab-history').classList.toggle('bg-brand/10', name === 'history');
    // logica invertida pelo !==
    // se (name) retornar verdadeiro adciona hidden pq o botao clicado é diferente do comparado
    //se (name) retornar falso retira o hidden pq o botao clicado é igual ao comparado
    panelSection.parentElement.classList.toggle('hidden', name !== 'panel');
    editView.classList.toggle('hidden', name !== 'edit');
    historyView.classList.toggle('hidden', name !== 'history');
    // renderiza as caracteristicas do painel
    if (name === 'panel') renderPanel();
    if (name === 'edit') initEdit();
    if (name === 'history') loadHistory();
}

// funcao para formatar datas
const fmtISO = d => new Date(d).toISOString().slice(0, 10);
const toBR = d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })

// funcao para pegar a data dos proximos tres cultos
// define o contador para pefar apenas tres valores
function nextServices(count = 3) {
    // armazenar as datas
    const out = [];
    // dias que devem ser pegos
    const days = [3, 6, 0]; // quarta(3), sab(6), dom(0)
    // define o contador para 0 e instancia o objeto data
    let i = 0, d = new Date();
    // enquanto a lista que armazena as datas for menor que o contador executa
    // enquanto i for menor que 30 executa
    while (out.length < count && i < 30) {
        // pega a data atual e a cada vez que o contador aumenta passa 1 dia
        const cand = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
        // se um dos valores do array days estiver contido na dia de hoje, a data é formatada e incluida em out
        if (days.includes(cand.getDay())) out.push(fmtISO(cand));
        i++;
    }
    return out;
}

// funcao para renderizar o painel
function renderPanel() {
    const container = panelSection;
    container.innerHTML = '';
    const dates = nextServices(3);
    dates.forEach(date => {
        const data = SCHEDULES[date] || null;
        const card = document.createElement('article');
        card.className = 'p-4 rounded-xl glass';
        card.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm text-slate-300">${toBR(date)}</div>
              <div class="mt-1 font-semibold text-lg">${data ? (data.program_type || 'Culto') : 'Culto'}</div>
            </div>
            <div class="text-right">
              <button class="px-3 py-1 rounded-md bg-brand text-white text-sm" onclick="openEditFor('${date}')">Editar</button>
            </div>
          </div>
          <div class="mt-4 grid gap-2">
            ${ROLES.map(r => {
            const vals = data && data.roles && data.roles[r.key] ? data.roles[r.key] : [];
            const names = vals.map(id => userName(id)).join(', ') || '<span class="text-slate-400">—</span>';
            return `<div class="flex items-center justify-between"><div class="text-sm text-slate-300">${r.label}</div><div class="text-sm font-medium">${names}</div></div>`;
        }).join('')}
          </div>`;
        container.appendChild(card);
    });
}


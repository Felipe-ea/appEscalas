const AVAILABLE_USERS = [
  { id: 'u1', name: 'Felipe' },
  { id: 'u2', name: 'Biel' },
  { id: 'u3', name: 'Samuel' },
  { id: 'u4', name: 'Gabriel' },
  { id: 'u5', name: 'Pr.Willian' },
  { id: 'u6', name: 'Pr. Domicio' },
  { id: 'u7', name: 'Vagner' },
  { id: 'u8', name: 'Pra. Pâmela' },
  { id: 'u9', name: 'Ap. Rodrigo' },
  { id: 'u10', name: 'Pra. Mara' },
  { id: 'u11', name: 'Pra. Kassia' },
  { id: 'u12', name: 'Elias' }
];

const ROLES = [
  { key: 'abertura', label: 'Abertura', multiple: false },
  { key: 'ministro', label: 'Ministro(a)', multiple: false },
  { key: 'back', label: 'Back Vocal', multiple: true },
  { key: 'violao', label: 'Violão', multiple: false },
  { key: 'guitarra', label: 'Guitarra', multiple: false },
  { key: 'baixo', label: 'Baixo', multiple: false },
  { key: 'teclado', label: 'Teclado', multiple: false },
  { key: 'bateria', label: 'Bateria', multiple: false },
  { key: 'oferta', label: 'Palavra de Oferta', multiple: false },
  { key: 'pregador', label: 'Pregador(a)', multiple: false }
];

const SUPABASE_URL = 'https://gmdgvrsjtyrtatifvvtj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtZGd2cnNqdHlydGF0aWZ2dnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MjE2NzQsImV4cCI6MjA3MjQ5NzY3NH0.pXpiRJDEYEqGH7Ln364EjtQWE2Qyh50T7St7F8u8u7E';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
const formatador = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit', // Formato de dois dígitos para o dia
  month: '2-digit', // Formato de dois dígitos para o mês
  year: 'numeric' // Formato numérico para o ano
});

// funcao para pegar a data dos proximos tres cultos
// define o contador para pegar apenas tres valores
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
async function renderPanel() {
  const container = panelSection;
  container.innerHTML = '<p class="text-slate-400 md:col-span-3 text-center">Carregando escalas...</p>';
  const dates = nextServices(3);

  const promises = dates.map(date => carregarEscala(date));

  const escalasData = await Promise.all(promises);

  container.innerHTML = '';

  dates.forEach((date, index) => {
    // Pegamos o dado correspondente a esta data do array de resultados.
    const data = escalasData[index];

    console.log(`Dados para a data ${date}:`, data); // Agora vai mostrar o objeto correto!

    const card = document.createElement('article');
    card.className = 'p-4 rounded-xl glass flex flex-col';

    // O código de renderização do card agora funciona, pois 'data' é o objeto real ou null.
    // Usei 'data?.propriedade' (Optional Chaining) para mais segurança.
    card.innerHTML = `
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="text-sm text-slate-300">${toBR(date)}</div>
                  <div class="mt-1 font-semibold text-lg">${data?.tipo || 'Culto'}</div>
                </div>
                <div class="text-right">
                  <button class="px-3 py-1 rounded-md bg-brand text-white text-sm hover:bg-slate-700" onclick="openEditFor('${date}')">Editar</button>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-slate-700 grid gap-2 flex-grow">
                ${ROLES.map(r => {
      const name = data?.[r.key] || '<span class="text-slate-400">—</span>';
      return `<div class="flex items-center justify-between">
                              <div class="text-sm text-slate-300">${r.label}</div>
                              <div class="text-sm font-medium text-right">${name}</div>
                            </div>`;
    }).join('')}
              </div>`;
    container.appendChild(card);
  });
}
// change to screen of edition when the card is clicked
window.openEditFor = function (date) {
  switchTo('edit');
  document.getElementById('dateInput').value = date;
  loadEdit(date);
}




/* ---------- EDIT view ---------- */
function initEdit() {
  if (!document.getElementById('dateInput').value) document.getElementById('dateInput').value = fmtISO(new Date());
  document.getElementById('dateInput').addEventListener('change', e => loadEdit(e.target.value));
  document.getElementById('saveBtn').addEventListener('click', saveCurrent);
  document.getElementById('clearBtn').addEventListener('click', () => {
    ROLES.forEach(r => setRoleSelection(r.key, []));
    renderRoles();
  });
  document.getElementById('deleteBtn').addEventListener('click', () => {
    const d = document.getElementById('dateInput').value;
    if (!d) return alert('Escolha uma data');
    if (confirm('Excluir essa escala?')) { excluirEscala(d); }
  });
  renderRoles();
  loadEdit(document.getElementById('dateInput').value);
}

async function excluirEscala(data) {
  await supabaseClient.from('escalas').delete().eq('data', data);
  alert('Excluído');
  renderPanel();
}

async function loadEdit(date) {
  renderRoles();
  const dado = await carregarEscala(date);

  console.log(dado)

  const programacao = document.getElementById('programType');
  programacao.value = dado.tipo;

  /*data.forEach(r => {
      const vals = data && data.roles && data.roles[r.key] ? data.roles[r.key] : [];
      setRoleSelection(r.key, vals);
  })*/

  document.getElementById('abertura').textContent = dado.abertura
  document.getElementById('ministro').textContent = dado.ministro;
  document.getElementById('back').textContent = dado.back;
  document.getElementById('violao').textContent = dado.violao;
  document.getElementById('guitarra').textContent = dado.guitarra;
  document.getElementById('baixo').textContent = dado.baixo;
  document.getElementById('teclado').textContent = dado.teclado;
  document.getElementById('bateria').textContent = dado.bateria;
  document.getElementById('oferta').textContent = dado.oferta;
  document.getElementById('pregador').textContent = dado.pregador;

}

async function carregarEscala(dataBusca) {

  const { data, error } = await supabaseClient
    .from('escalas')
    .select('*')
    .eq('data', dataBusca)

  if (error) {
    console.error('Erro na busca', error);
    return;
  }

  if (data && data.length > 0) {
    const escalaEncontrada = data[0];
    return escalaEncontrada;
  }
  return null;
}

function renderRoles() {
  const out = document.getElementById('rolesList');
  out.innerHTML = ROLES.map(r => {
    const selected = getRoleSelection(r.key).map(id => `<span id="${r.key}" class="chip mr-2">${userName(id)}</span>`).join('');
    return `
          <div class="p-3 rounded-lg border border-slate-700">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-slate-300">${r.label}</div>
                <div class="mt-2">${selected || `<span id="${r.key}" class="text-slate-500 text-sm">—</span>`}</div>
              </div>
              <div>
                <button class="px-3 py-2 rounded-md glass text-sm" onclick="openModalFor('${r.key}')">Selecionar</button>
              </div>
            </div>
          </div>`;
  }).join('');
}

// estado temporário de seleção para a view
const ROLE_SELECTION = {}; // roleKey -> array of userIds
function setRoleSelection(roleKey, ids) { ROLE_SELECTION[roleKey] = Array.isArray(ids) ? ids : (ids ? [ids] : []); }
function getRoleSelection(roleKey) { return ROLE_SELECTION[roleKey] || []; }



function userName(id) { const u = AVAILABLE_USERS.find(x => x.id === id); return u ? u.name : id; }

/* ---------- MODAL de seleção ---------- */
let currentModalRole = null;

function openModalFor(roleKey) {
  currentModalRole = roleKey;
  document.getElementById('modalTitle').textContent = 'Selecionar: ' + (ROLES.find(r => r.key === roleKey)?.label || roleKey);
  const list = document.getElementById('modalContent');
  list.innerHTML = '';
  const multiple = ROLES.find(r => r.key === roleKey)?.multiple;
  const selected = getRoleSelection(roleKey);
  AVAILABLE_USERS.forEach(u => {
    const id = 'chk_' + u.id;
    const checked = selected.includes(u.id) ? 'checked' : '';
    list.insertAdjacentHTML('beforeend', `
          <label class="flex items-center gap-3 p-2 rounded-md hover:bg-slate-800 cursor-pointer">
            <input type="checkbox" data-uid="${u.id}" ${checked} ${multiple ? '' : ''} class="w-4 h-4" />
            <div class="text-sm">${u.name}</div>
          </label>
        `);
  });
  // quando multiple==false, ensure only one checkbox can be checked at a time
  list.querySelectorAll('input[type=checkbox]').forEach(chk => {
    chk.addEventListener('change', function () {
      if (!multiple && this.checked) {
        list.querySelectorAll('input[type=checkbox]').forEach(x => { if (x !== this) x.checked = false; });
      }
    });
  });

  document.getElementById('modal').classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); document.body.classList.remove('modal-open'); }

function modalSave() {
  const roleKey = currentModalRole; if (!roleKey) return closeModal();
  const list = document.getElementById('modalContent');
  const checked = Array.from(list.querySelectorAll('input[type=checkbox]:checked')).map(i => i.dataset.uid);
  const multiple = ROLES.find(r => r.key === roleKey)?.multiple;
  setRoleSelection(roleKey, multiple ? checked : (checked[0] ? [checked[0]] : []));
  renderRoles();
  closeModal();
}

/* ---------- SALVAR / carregar ---------- */
async function saveCurrent() {
  /*
  const date = document.getElementById('dateInput').value;
  if (!date) return alert('Escolha uma data');
  const program = document.getElementById('programType').value;
  const custom = document.getElementById('customProgram').value.trim();
  const programType = (program === 'Outro' && custom) ? custom : program;
  const payload = { date, program_type: programType, roles: {} };
  ROLES.forEach(r => { payload.roles[r.key] = getRoleSelection(r.key); });
  SCHEDULES[date] = payload; saveLocal(); alert('Escala salva'); renderPanel();
  */

  const data = document.getElementById('dateInput').value
  const tipo = document.getElementById('programType').value
  const abertura = document.getElementById('abertura')?.textContent ?? '--'
  const ministro = document.getElementById('ministro')?.textContent ?? '--'
  const back = document.getElementById('back')?.textContent ?? '--'
  const guitarra = document.getElementById('guitarra')?.textContent ?? '--'
  const violao = document.getElementById('violao')?.textContent ?? '--'
  const baixo = document.getElementById('baixo')?.textContent ?? '--'
  const teclado = document.getElementById('teclado')?.textContent ?? '--'
  const bateria = document.getElementById('bateria')?.textContent ?? '--'
  const oferta = document.getElementById('oferta')?.textContent ?? '--'
  const pregador = document.getElementById('pregador')?.textContent ?? '--'

  const escala = {
    data: data,
    tipo: tipo,
    abertura: abertura,
    ministro: ministro,
    back: back,
    guitarra: guitarra,
    violao: violao,
    baixo: baixo,
    teclado: teclado,
    bateria: bateria,
    oferta: oferta,
    pregador: pregador
  }

  await supabaseClient.from('escalas').insert([escala]);
  alert("Escala Criada");

}



/* ---------- HISTÓRICO ---------- */
function loadHistory() {
  const anchor = document.getElementById('historyAnchor').value || fmtISO(new Date());
  const weeks = parseInt(document.getElementById('historyPeriod').value || '1', 10);
  const end = new Date(anchor + 'T00:00:00');
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (7 * weeks) + 1);
  const keys = Object.keys(SCHEDULES).sort((a, b) => b.localeCompare(a));
  const items = keys.filter(k => (k >= fmtISO(start) && k <= fmtISO(end))).map(k => SCHEDULES[k]);
  const container = document.getElementById('historyList');
  container.innerHTML = items.length ? items.map(item => {
    return `
          <div class="p-3 rounded-lg glass">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-slate-300">${toBR(item.date)}</div>
                <div class="font-semibold">${item.program_type}</div>
              </div>
              <div><button class="px-3 py-1 rounded-md glass" onclick="openEditFor('${item.date}')">Editar</button></div>
            </div>
            <div class="mt-3 text-sm">
              ${ROLES.map(r => {
      const vals = item.roles[r.key] || [];
      const names = vals.map(id => userName(id)).join(', ') || '<span class="text-slate-400">—</span>';
      return `<div class="flex justify-between py-1"><div class="text-slate-300">${r.label}</div><div class="font-medium">${names}</div></div>`;
    }).join('')}
            </div>
          </div>`;
  }).join('') : '<div class="text-slate-400 p-4">Sem registros no período selecionado.</div>';
}

// inicialização
(function () {
  // valores iniciais
  document.getElementById('historyAnchor').value = fmtISO(new Date());
  renderPanel();
  renderRoles();
  // deixar aba 'panel' visível
  switchTo('panel');
})();

// expor algumas funções para console/uso global
window.SCHEDULES = SCHEDULES;
window.AVAILABLE_USERS = AVAILABLE_USERS;
window.ROLES = ROLES;
window.saveLocal = saveLocal;


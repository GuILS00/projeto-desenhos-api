// js/app.js

const API_BASE = 'https://rickandmortyapi.com/api/character';
const container = document.getElementById('cards-container');
const loadMoreBtn = document.getElementById('loadMore');
const searchInput = document.getElementById('search');

let nextPageUrl = API_BASE; // começa na base
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

/** Busca personagens da API (página atual) */
async function fetchCharacters(url){
  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error('Erro na requisição: ' + res.status);
    const data = await res.json();
    // data.results = array de personagens; data.info.next = próxima página
    nextPageUrl = data.info?.next || null;
    return data.results || [];
  } catch(err){
    console.error(err);
    alert('Erro ao carregar personagens. Veja o console.');
    return [];
  }
}

/** Cria um card a partir de um objeto personagem */
function createCard(character){
  const card = document.createElement('article');
  card.className = 'card';

  const img = document.createElement('img');
  img.className = 'card-image';
  img.src = character.image || '';
  img.alt = character.name;

  const body = document.createElement('div');
  body.className = 'card-body';

  const h3 = document.createElement('h3');
  h3.textContent = character.name;

  const p = document.createElement('p');
  p.textContent = character.status ? `${character.status} — ${character.species || ''}` : (character.origin?.name || '');

  body.appendChild(h3);
  body.appendChild(p);

  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const idSpan = document.createElement('span');
  idSpan.textContent = `ID: ${character.id || '-'}`;

  const heart = document.createElement('button');
  heart.className = 'icon-heart';
  heart.setAttribute('aria-label', 'Favoritar personagem');
  heart.innerHTML = favorites.includes(character.id) ? '❤' : '♡';
  if(favorites.includes(character.id)) heart.classList.add('favorito');

  // Toggle favorito
  heart.addEventListener('click', () => {
    if(favorites.includes(character.id)){
      favorites = favorites.filter(id => id !== character.id);
      heart.innerHTML = '♡';
      heart.classList.remove('favorito');
    } else {
      favorites.push(character.id);
      heart.innerHTML = '❤';
      heart.classList.add('favorito');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  });

  footer.appendChild(idSpan);
  footer.appendChild(heart);

  card.appendChild(img);
  card.appendChild(body);
  card.appendChild(footer);

  return card;
}

/** Renderiza uma lista de personagens no container */
function renderCharacters(list){
  const fragment = document.createDocumentFragment();
  list.forEach(ch => fragment.appendChild(createCard(ch)));
  container.appendChild(fragment);
}

/** Inicialização: carregar primeira página */
async function init(){
  container.innerHTML = ''; // limpa
  const list = await fetchCharacters(nextPageUrl);
  renderCharacters(list);
  updateLoadMore();
}

/** Carregar próxima página quando houver */
async function loadMore(){
  if(!nextPageUrl) return;
  const list = await fetchCharacters(nextPageUrl);
  renderCharacters(list);
  updateLoadMore();
}

function updateLoadMore(){
  if(nextPageUrl) {
    loadMoreBtn.disabled = false;
    loadMoreBtn.textContent = 'Carregar mais';
  } else {
    loadMoreBtn.disabled = true;
    loadMoreBtn.textContent = 'Fim';
  }
}

/** Pesquisa simples: filtra cards já carregados */
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  Array.from(container.children).forEach(card => {
    const name = card.querySelector('h3')?.textContent.toLowerCase() || '';
    card.style.display = name.includes(q) ? '' : 'none';
  });
});

loadMoreBtn.addEventListener('click', loadMore);

init();

const appContainer = document.getElementById('app');
const linkPageFavorite = document.getElementById('favourites');
const linkPageCatalog = document.getElementById('catalog');

//добавления хранилища для картинок с лайками
if (localStorage.getItem('store') === null) {
  localStorage.setItem('store', '[]')
}

//  следим за кликами по листу
const handleClickItem = (event) => {
  if (event.target.tagName !== "SPAN") {
    return;
  }

  let nodeItem = event.target.parentNode;
  nodeItem.classList.toggle('list__item_open');
  let childrenContainer = nodeItem.querySelector("ul");

  if (!childrenContainer) {
    let userId = event.target.dataset.userKey;
    let albumId = event.target.dataset.albumKey;

    if (!!userId) {
      getAlbumUser(userId, nodeItem);
    }

    if (!!albumId) {
      getPhotosAlbum(albumId, nodeItem);
    }

    return;
  }

  childrenContainer.hidden = !childrenContainer.hidden;
};


// модалка
const handleToggleModal = (pathImg) => () => {
  let modal = document.getElementById('modal');
  if (modal.classList.contains('modal_active')) {
    modal.classList.remove('modal_active');
    document.body.style.overflowY = 'unset';
  }
  else {
    let img = modal.querySelector('.modal__content__img');
    img.src = pathImg;
    modal.classList.add('modal_active');
    document.body.style.overflowY = 'hidden';
  }
}

let closeModalButton = document.querySelector('.modal__close');
closeModalButton.addEventListener('click', handleToggleModal());

// выбор понравившегося
const handleToggleFavorite = (id) => (e) => {

  let star = e.target;
  let store = JSON.parse(localStorage.getItem('store'));

  if (e.target.parentNode.tagName === 'FIGURE') {
    if (confirm('Вы дейсвительно хотите удалить картинку из избранного?')) {
      e.target.parentNode.remove();
      onRemoveImage(store, id);
    }
    return;
  }

  if (star.classList.contains('list__item__star_favorite')) {
    star.classList.remove('list__item__star_favorite');
    onRemoveImage(store, id);
  } else {
    star.classList.add('list__item__star_favorite');
    store.push(Number(id));
    localStorage.setItem("store", JSON.stringify(store));
  }
}

const onRemoveImage = (store, id) => {
  newStore = store.filter(item => item !== Number(id));
  localStorage.setItem("store", JSON.stringify(newStore));
}

// события картинок
const addEventImages = () => {
  let stars = appContainer.querySelectorAll('.list__item__star');
  stars.forEach(star => star.addEventListener('click', handleToggleFavorite(star.dataset.photoKey)))

  let images = appContainer.querySelectorAll('.list__item__img');
  images.forEach(image => image.addEventListener('click', handleToggleModal(image.dataset.fullsizeImage)));
}


//запросы
const getUser = () => {
  fetch("https://json.medrating.org/users/")
    .then((response) => response.json())
    .then((data) => renderList(data));
}

const getAlbumUser = (userId, node) => {
  fetch(`https://json.medrating.org/albums?userId=${userId}`)
    .then((response) => response.json())
    .then((data) => renderAlbum(data, node));
}

const getPhotosAlbum = (albumId, node) => {
  fetch(`https://json.medrating.org/photos?albumId=${albumId}`)
    .then((response) => response.json())
    .then((data) => renderPhotoAlbum(data, node));
}

const getPhotos = () => {
  fetch('https://json.medrating.org/photos')
    .then((response) => response.json())
    .then((data) => renderPhotoGallery(data));
}

//рендер
const renderList = (arr) => {
  let list = document.createElement('ul');
  list.classList.add('container__list', 'list');

  newList = arr.filter((item) => item.name !== undefined);
  newList.map((item) =>
    list.insertAdjacentHTML(
      "beforeend",
      `
  <li class="list__item">
    <span data-user-key=${item.id}>${item.name}</span>
  </li>
  `
    )
  );
  appContainer.innerText = '';
  appContainer.append(list);

  list.addEventListener("click", handleClickItem);
}

const renderAlbum = (arr, node) => {
  let ul = document.createElement("ul");
  ul.classList.add('list');

  arr.map((item) =>
    ul.insertAdjacentHTML(
      "beforeend",
      `
  <li class="list__item">
    <span data-album-key=${item.id}>${item.title}</span>
  </li>
  `
    )
  );
  node.append(ul);
}

const renderPhotoAlbum = (arr, node) => {
  let ul = document.createElement("ul");
  ul.classList.add('list');
  let store = JSON.parse(localStorage.getItem('store'));
  arr.map((item) =>
    ul.insertAdjacentHTML(
      "beforeend",
      `
  <li class="list__item">
    <img 
      class="list__item__star ${store.includes(item.id) ? 'list__item__star_favorite' : ''}"
      data-photo-key=${item.id}
      src="./img/star.svg"
      alt="star"
      title="like"
    >
    <img class="list__item__img" data-fullsize-image="${item.url}" src="${item.thumbnailUrl}" alt="${item.title}" title="${item.title}">
  </li>
  `
    )
  );
  node.append(ul);

  addEventImages();
}

const renderPhotoGallery = (photos) => {

  let store = JSON.parse(localStorage.getItem('store'));

  if (store.length === 0) {
    appContainer.innerHTML = '';
    appContainer.append('Нет избранных изображений.');
    return;
  }

  let newList = photos.filter(photo => store.includes(photo.id));
  let photoGallery = document.createElement('div');
  photoGallery.classList.add('container__list', 'list', 'photos');

  newList.map((item) =>
    photoGallery.insertAdjacentHTML(
      "beforeend",
      `
    <figure class="photos__item__wrap">
      <img 
        class="list__item__star ${store.includes(item.id) ? 'list__item__star_favorite' : ''}"
        data-photo-key=${item.id}
        src="./img/star.svg"
        alt="star"
        title="like"
      >
      <img class="list__item__img" data-fullsize-image="${item.url}" src="${item.thumbnailUrl}" alt="${item.title}" title="${item.title}">
      <figcaption>${item.title}</figcaption>
    </figure>
  `
    )
  );

  appContainer.innerHTML = '';
  appContainer.append(photoGallery);

  addEventImages();
}

//смены страниц
linkPageFavorite.addEventListener('click', () => getPhotos());

linkPageCatalog.addEventListener('click', () => getUser());

//первый рендер
getUser();

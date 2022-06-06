import { PixabayApi } from './js/pixabayApi';
import createGalleryCards from './template/gallery-card.hbs';
import Notiflix from 'notiflix';

const galleryArr = document.querySelector('.gallery');
const searchForm = document.querySelector('#search-form');
const btnLoadMore = document.querySelector('.load-more');

const pixabayApi = new PixabayApi();

const onSearchFormSubmit = event => {
  event.preventDefault();

  pixabayApi.q = event.currentTarget.elements['searchQuery'].value
    .trim()
    .toLowerCase();
  pixabayApi.page = 1;

  pixabayApi
    .fetchPhotos()
    .then(({ data } = {}) => {
      if (data.total > 1) {
        Notiflix.Notify.success('Hooray! We found totalHits images.');
      }

      if (!data.total) {
        btnLoadMore.classList.add('is-hidden');
        galleryArr.innerHTML = '';
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (data.total <= 40) {
        galleryArr.innerHTML = createGalleryCards(data.hits);
        btnLoadMore.classList.add('is-hidden');
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      galleryArr.innerHTML = createGalleryCards(data.hits);

      btnLoadMore.classList.remove('is-hidden');
    })
    .catch(err => {
      console.log(err);
    });
};

const onLoadMoreBtnElClick = event => {
  pixabayApi.incrementPage();
  pixabayApi
    .fetchPhotos()
    .then(({ data } = {}) => {
      galleryArr.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));

      if (pixabayApi.page === Math.ceil(data.totalHits / 40)) {
        event.target.classList.add('is-hidden');
      }
    })
    .catch(err => {
      console.log(err);
    });
};

searchForm.addEventListener('submit', onSearchFormSubmit);
btnLoadMore.addEventListener('click', onLoadMoreBtnElClick);

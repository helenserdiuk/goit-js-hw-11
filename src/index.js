import { PixabayApi } from './js/pixabayApi.js';
import createGalleryCards from './template/gallery-card.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryArr = document.querySelector('.gallery');
const searchForm = document.querySelector('#search-form');
const btnLoadMore = document.querySelector('.load-more');

const pixabayApi = new PixabayApi();

const onSearchFormSubmit = async event => {
  event.preventDefault();

  if (
    pixabayApi.q ===
    event.currentTarget.elements['searchQuery'].value.trim().toLowerCase()
  ) {
    searchForm.reset();
    return;
  }
  pixabayApi.q = event.currentTarget.elements['searchQuery'].value
    .trim()
    .toLowerCase();

  pixabayApi.page = 1;

  if (pixabayApi.q === '') {
    btnLoadMore.classList.add('is-hidden');
    galleryArr.innerHTML = '';
    Notiflix.Notify.info('Request is empty, please enter a designation!');
    return;
  }

  try {
    btnLoadMore.classList.add('is-hidden');

    const { data } = await pixabayApi.fetchPhotos();
    if (data.total > 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
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
    const { height: cardHeight } = document
      .querySelector('.photo-card')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    simpleLightboxImage();

    btnLoadMore.classList.remove('is-hidden');
  } catch (err) {
    console.log(err);
  }

  searchForm.reset();
};

const onLoadMoreBtnElClick = async event => {
  pixabayApi.incrementPage();
  try {
    const { data } = await pixabayApi.fetchPhotos();
    galleryArr.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
    simpleLightboxImage();

    if (pixabayApi.page === Math.ceil(data.totalHits / 40)) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      event.target.classList.add('is-hidden');
    }
  } catch (err) {
    console.log(err);
  }
};

searchForm.addEventListener('submit', onSearchFormSubmit);
btnLoadMore.addEventListener('click', onLoadMoreBtnElClick);

function simpleLightboxImage() {
  const lightbox = new SimpleLightbox('.photo-card a', {
    captionDelay: 250,
  });

  lightbox.refresh();
}

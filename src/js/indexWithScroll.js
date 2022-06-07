import { PixabayApi } from './pixabayApi.js';
import createGalleryCards from '../template/gallery-card.hbs';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryArr = document.querySelector('.gallery');
const searchForm = document.querySelector('#search-form');

const pixabayApi = new PixabayApi();

const intersectionObserverOption = {
  root: null,
  rootMargin: '0px 0px 200px 0px',
  threshold: 1.0,
};

const intersectionObserver = new IntersectionObserver((entries, observe) => {
  entries.forEach(async entry => {
    if (!entry.isIntersecting) {
      return;
    }
    pixabayApi.incrementPage();
    try {
      const { data } = await pixabayApi.fetchPhotos();
      galleryArr.insertAdjacentHTML('beforeend', createGalleryCards(data.hits));
      simpleLightboxImage();

      if (pixabayApi.page === Math.ceil(data.totalHits / 40)) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        intersectionObserver.unobserve(
          document.querySelector('.target-element')
        );
      }
    } catch (err) {
      console.log(err);
    }
  });
}, intersectionObserverOption);

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
    intersectionObserver.unobserve(document.querySelector('.target-element'));
    galleryArr.innerHTML = '';
    Notiflix.Notify.info('Request is empty, please enter a designation!');
    return;
  }

  try {
    const { data } = await pixabayApi.fetchPhotos();
    if (data.total > 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }

    if (!data.total) {
      intersectionObserver.unobserve(document.querySelector('.target-element'));
      galleryArr.innerHTML = '';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (data.total <= 40) {
      galleryArr.innerHTML = createGalleryCards(data.hits);
      intersectionObserver.unobserve(document.querySelector('.target-element'));
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

    intersectionObserver.observe(document.querySelector('.target-element'));
  } catch (err) {
    console.log(err);
  }

  searchForm.reset();
};

searchForm.addEventListener('submit', onSearchFormSubmit);

function simpleLightboxImage() {
  const lightbox = new SimpleLightbox('.photo-card a', {
    captionDelay: 250,
  });

  lightbox.refresh();
}

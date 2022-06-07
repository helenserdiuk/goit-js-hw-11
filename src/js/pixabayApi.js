import axios from 'axios';

export class PixabayApi {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '20753274-3f8d2754c12358a259804227b';

  constructor() {
    this.q = null;
    this.page = 1;
  }

  fetchPhotos() {
    return axios.get(`${this.#BASE_URL}?key=${this.#API_KEY}`, {
      params: {
        q: this.q,
        page: this.page,
        per_page: 40,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
      },
    });
  }

  incrementPage() {
    this.page += 1;
  }
}

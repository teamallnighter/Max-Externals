import { pexelsKey, pexelsQuery } from '../config';

const KEY = pexelsKey;

export async function getPexelsImage() {
  const headers = new Headers({
    Authorization: `${KEY}`,
  });
  const query = pexelsQuery || 'nature';
  const orientation = 'portrait'; // landscape, portrait or square
  const perPage = 1;
  const url = `https://api.pexels.com/v1/search?query=${query}&orientation=${orientation}&per_page=${perPage}&page=1`;
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();
    return data.photos[0];
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

export async function getPexelsVideo() {
  const headers = new Headers({
    Authorization: `${KEY}`,
  });
  const baseUrl = 'https://api.pexels.com/videos/search';
  const query = pexelsQuery || 'nature';
  const orientation = 'portrait'; // landscape, portrait or square
  const perPage = 1;
  const url =
    baseUrl +
    `?query=${query}&orientation=${orientation}&per_page=${perPage}&page=1`;
  try {
    const response = await fetch(url, {
      headers: headers,
    });
    const data = await response.json();
    return data.videos[0];
  } catch (error) {
    console.error('Error:', error);
    return '';
  }
}

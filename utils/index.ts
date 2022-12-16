import { Article } from '../types';

export { MONTHS, formatDate } from './date';

export const getUniqTags = (articles: Article[]) => {
  const tags: string[] = articles.reduce((result, { tag }) => {
    return tag ? [...result, tag] : result;
  }, []);

  return tags.length ? Array.from(new Set(tags)) : [];
};

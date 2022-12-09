export const MONTHS = [
  'Января',
  'Февраля',
  'Марта',
  'Апреля',
  'Мая',
  'Июня',
  'Июля',
  'Августа',
  'Сентября',
  'Октября',
  'Ноября',
  'Декабря',
];

export const formatDate = (jsonDate: string) => {
  const date = new Date(jsonDate);

  return `${date.getDate()} ${MONTHS[date.getMonth()].toLowerCase()}, ${date.getFullYear()}`;
};

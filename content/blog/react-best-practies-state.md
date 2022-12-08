---
title: 'React best practies - Состояние'
date: '2022-12-07'
description: 'Одной из самых важных концепций, которую должен понимать каждый разработчик, является состояние. Управление состоянием,
на мой взгляд, это самая сложная часть создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало разрабатывается.'
---

Одной из самых важных концепций, которую должен понимать каждый разработчик, является состояние. Управление состоянием,
на мой взгляд, это самая сложная часть создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало разрабатывается.

Известно, что хорошая (и одновременно плохая) сторона `React` заключается в том, что он дает разработчикам большую
гибкость - `React` не заставляет разработчиков использовать какое-либо конкретное решение для управления состоянием. И
хотя можно написать работающий код, особо не задумываясь об эффективном использовании встроенных инструментов (см.
`useState`, `useReducer` и др.), здесь будут описаны несколько примеров, которые помогут принять лучшее решение.

## Не добавляйте состояние без необходимости

Рассмотрим пример, компонент с картой и маркерами на ней. При клике на маркер нам нужно открывать или закрывать тултип,
ориентируясь на значение `isOpen`:

```tsx
const CustomMarker = (props) => {
  const markerRef = useRef();
  const [isOpen, setOpen] = useState(false);

  const handleClick = () => {
    if (isOpen) {
      markerRef.current.closeTooltip();
    } else {
      markerRef.current.openTooltip();
    }

    setOpen(!isOpen);
  };

  return <Marker ref={markerRef} onClick={}/>
};

const SomeComponent = (props) => {
  return (<Map>
      <CustomMarker />
      <CustomMarker />
      {...}
    </Map>);
};
```

Как можно заметить, состояние `isOpen` фактически **никак не влияет на сам рендер** маркера - оно нужно только для
определения действия с тултипом. Поэтому вместо `useState`, мы можем сохранить переменную в `useRef`, избежав тем самым
бесполезные повторные рендеры при клике:

```tsx
const CustomMarker = (props) => {
  const markerRef = useRef();
  const isOpenRef = useRef(false);

  const handleClick = () => {
    if (isOpenRef.current) {
      markerRef.current.closeTooltip();
    } else {
      markerRef.current.openTooltip();
    }

    isOpenRef.current = !isOpenRef.current;
  };

  return <Marker ref={markerRef} onClick={} />;
};
```

Или другой пример, нам необходимо вывести список фильмов, для чего мы предварительно извлекаем и фильтруем данные,
полученные с бека. `useQuery` при этом сохраняет результат запроса между рендерами компонента:

```tsx
const [films, setFilms] = useState([]);
const { data } = useQuery(QUERY_OPTIONS);

useEffect(() => {
  if (data) {
    const preparedData = data.filter(…).map(…);

    setFilms(preparedData);
  }
}, [data]);

return <FilmList>{ films.map(...) }</FilmList>;
```

Поскольку переменную `books` всегда **можно вычислить** напрямую из `data`, ее не обязательно помещать в состояние.
Также можно воспользоваться хуком `useMemo`, если нам важно сохранять
[ссылочное равенство](https://learn.javascript.ru/object-copy#sravnenie-po-ssylke):

```tsx
const { data } = useQuery(QUERY_OPTIONS);

// const books = (data || []).filter(…).map(…);

const books = useMemo(() => {
  if (data) {
    return data.filter(…).map(…);
  }

  return [];
}, [data]);

return <BooksList>{ books.map(...) }</BooksList>;
```

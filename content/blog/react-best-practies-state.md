---
title: 'React best practies - Состояние'
date: '2022-12-07T20:00:00.00Z'
tag: 'React'
description: 'Одной из самых важных концепций, которую должен понимать каждый разработчик, является состояние. Управление состоянием,
на мой взгляд, это самая сложная часть создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало разрабатывается.'
---

Одной из самых важных концепций, которую должен понимать каждый разработчик, является состояние. Управление состоянием,
на мой взгляд, это самая сложная часть создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало разрабатывается.

Известно, что хорошая (и одновременно плохая) сторона `React` заключается в том, что он дает разработчикам большую
гибкость - `React` не заставляет разработчиков использовать какое-либо конкретное решение для управления состоянием. И
хотя можно писать работающий код, особо не задумываясь об эффективном использовании встроенных инструментов (`useState`,
`useReducer` и др.), здесь будут описаны несколько примеров, которые помогут принять лучшее решение.

## Не добавляйте состояние без необходимости

Рассмотрим пример, компонент с картой и маркерами на ней. При клике на маркер нам нужно открывать или закрывать тултип,
ориентируясь на значение `isOpen`:

```js[class="line-numbers"]
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
полученные с бека. `useQuery` при этом сохраняет результат запроса между ререндерами компонента:

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

Поскольку переменную `books` всегда **можно вычислить** напрямую из `data`, ее не обязательно помещать в состояние, а
если нужно сохранить [ссылочное равенство](https://learn.javascript.ru/object-copy#sravnenie-po-ssylke), можно
воспользоваться хуком `useMemo`:

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

Еще один случай, когда состояние избыточно и потенциально ведет к проблемам с производительностью - это пример
реализации компонента `Grid`, в котором на определенном этапе прокрутки таблицы, должна выводиться кнопка "Вернуться в
начало":

```tsx
const [showButtonUp, setShowButtonUp] = useState(false);

const handleScroll = (event) => {
  ...

  if (event.target.scrollTop > offsetHeight) {
    setShowButtonUp(true);
  } else {
    setShowButtonUp(false);
  }
};

return (<Body onScroll={handleScroll}>
    {rows.map(...)}
    <ButtonUp />
  </Body>);
```

Очевидно, когда состояние кнопки меняется, происходит ререндер всех строк, коих может быть достаточно много. А если
таблица еще предоставляет возможности кастомизации ячеек, в которых могут содержаться достаточно сложные компоненты, мы
довольно скоро увидим результаты своего решения, в виде дополнительных "тормозов" при появлении/скрытии кнопки.

Если у нас достаточно маленький компонент, можно попробовать мемоизировать отрисовку строк, но при сложной внутренней
логике и большом количестве зависимостей для `rows` такой подход уже может не оказаться самым верным. В данном случае,
есть **альтернативный способ** решения нашей задачи:

```tsx
const buttonUpRef = useRef(null);

const handleScroll = (event) => {
  ...

  if (event.target.scrollTop > offsetHeight) {
    buttonUpRef.current.style.visibilty = 'visible';
  } else {
    buttonUpRef.current.style.visibilty = 'hidden';
  }
};

return (<Body onScroll={handleScroll}>
    {rows.map(...)}
    <ButtonUp ref={buttonUpRef} />
  </Body>);
```

Получив сам элемент кнопки и используя атрибут `style` мы можем скрывать и показывать кнопку, только лишь средствами
`css` и снова исключить из нашего кода состояние.

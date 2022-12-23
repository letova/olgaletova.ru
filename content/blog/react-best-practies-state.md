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
логике и большом количестве зависимостей для `rows` такой подход уже может оказаться не самым верным. В данном случае,
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

## Не дублируйте состояние

Довольно плохой практикой считается хранения одних и тех же данных в нескольких переменных состояния. Предположим, что
мы делаем страничку автора со списком книг. Можно выбрать одну и увидеть подробное описание книги:

```js
const WriterCard = (props) => {
  const { data: books = [] } = useQuery(QUERY_OPTIONS);
  const [selectedBook, setSelectedBook] = useState();

  return (
    <div>
      <BookPreview book={selectedBook} />
      {books.map((book) => {
        return (
          <div key={book.id} onClick={() => setSelectedBook(book)}>
            {book.name} {book.year}
          </div>
        );
      })}
    </div>
  );
};
```

Сейчас, мы сохраняем всю информацию о выбранной книге в `selectedBook` — это тот же объект, что и один из элементов
`books` списка. И это не очень хорошо, у нас задублировались одни и те же данные в разных переменных состояния. Чревато
это тем, что если список книг обновится, и выбранная книга изменится, то в `selectedBook` у нас окажется не актуальный
экземпляр.

Хотя мы можем написать код для синхронизации `selectedBook`, проще всего удалить дублирование. В приведенном ниже
примере, вместо объекта книги, мы сохраняем `selectedId`, а затем получаем выбранную книгу путем поиска среди списка
книг:

```js
const WriterCard = (props) => {
  const { data: books = [] } = useQuery(SOME_QUERY);
  const [selectedId, setSelectedId] = useState();

  const selectedBook = selectedId && books.find((book) => book.id === selectedId);

  return (
    <div className="input-container" style={containerStyle}>
      <BookPreview book={selectedBook} />
      {books.map((book) => {
        return (
          <div key={book.id} onClick={() => setSelectedBook(book.id)}>
            {book.name} {book.year}
          </div>
        );
      })}
    </div>
  );
};
```

Другой пример, это компонент `Checkbox`, который управляет своим состоянием `isChecked`:

```tsx
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  const handleChange = () => {
    setIsChecked(!isChecked);

    props.onChange?.(!isChecked);
  };

  return <input type="checkbox" checked={isChecked} onChange={handleChange} />;
};
```

Рассмотрим его в составе компонента `Filter`, который содержит список жанров для фильтрации, и кнопку "Сбросить
фильтры". Добавим в начальное состояние жанр `rock`:

```tsx
const Filter = (props) => {
  const [genres, setGenres] = useState(new Set(['rock']));

  const handleChange = (genre) => {
    if (genres.has(genre)) {
      genres.delete(genre);
    } else {
      genres.add(genre);
    }
  };

  return (
    <div>
      <button>Сбросить фильтры</button>
      <Checkbox checked={genres.has('rock')} onChange={handleChange} />
      <Checkbox checked={genres.has('jazz')} onChange={handleChange} />
      <Checkbox checked={genres.has('metal')} onChange={handleChange} />
    </div>
  );
};
```

При текущей реализации компонента `Checkbox`, функционирование кнопки "Сбросить фильтры" не возможно, поскольку
внутреннеее состояние компонента `Checkbox` уже определено и повлиять на него из вне мы не можем. Чтобы иметь
возможность задать чекбоксу актуальное состояние, нам приедется добавить в компонент `useEffect`:

```tsx
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  useEffect(() => {
    setIsChecked(props.isChecked);
  }, [props.isChecked]);
};
```

Однако теперь у нас стало две переменных определяющих одно и тоже состояние. Чтобы не создавать подобное дублирование,
хорошим решением будет вовсе избавиться от состояния в компоненте `Checkbox` и передавать состояние `isChecked` напрямую
через `props`:

```tsx
const Checkbox = (props) => {
  const handleChange = () => {
    props.onChange?.(!props.isChecked);
  };

  return <input type="checkbox" checked={props.isChecked} onChange={handleChange} />;
};
```

А если нам все же нужно поддерживать внутреннее состояние, для простоты использования в ряде случаев, то можно сделать
следующее:

```tsx
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  const hasCheckedProp = hasPropValue(props.isChecked);

  const handleChange = () => {
    if (!hasCheckedProp) {
      setIsChecked(!isChecked);
    }

    props.onChange?.(!props.isChecked);
  };

  const checked = hasCheckedProp ? props.isChecked : isChecked;

  return <input type="checkbox" checked={checked} onChange={handleChange} />;
};
```

Но такой подход нельзя порекомендовать как лучший, ввиду возрастающей сложности компонента.

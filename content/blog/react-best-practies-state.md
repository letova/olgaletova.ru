---
title: 'React best practies - Состояние'
date: '2022-12-07T20:00:00.00Z'
tag: 'React'
description: 'Одной из самых важных концепций, которую должен понимать каждый разработчик, является состояние. Управление состоянием,
на мой взгляд, это самая сложная часть создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало разрабатывается.'
---

Одной из самых важных концепций, которую должен понимать каждый разработчик,
является состояние. Управление состоянием, это, часто, самая сложная часть
создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало
разрабатывается.

Известно, что хорошая (и одновременно плохая) сторона **React** заключается в
том, что он дает разработчикам большую гибкость - **React** не заставляет
разработчиков использовать какое-либо конкретное решение для управления
состоянием. И хотя можно писать вполне себе работающий код, особо не задумываясь
об эффективном использовании встроенных инструментов (`useState`, `useReducer` и
др.), здесь будут описаны несколько примеров, которые помогут принять лучшее
решение.

## Не добавляйте состояние без необходимости

Говоря об управлении состоянием, одна из ошибок, которую совершают даже опытные
React-разработчики, заключается в том, что любые фрагменты данных помещаются в
React состояние, без особой на то, необходимости.

Рассмотрим пример, компонент с картой и маркерами на ней. При клике на маркер
нам нужно открывать или закрывать тултип, ориентируясь на значение `isOpen`:

```jsx[class="line-numbers"]
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

Как можно заметить, состояние `isOpen` фактически **никак не влияет на сам
рендер** маркера - оно нужно только для определения действия с тултипом. Поэтому
вместо `useState`, мы можем сохранить переменную в `useRef`, избежав тем самым
бесполезные повторные рендеры при клике:

```jsx[class="line-numbers"]
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

Или другой пример, нам необходимо вывести список фильмов, для чего мы
предварительно извлекаем и фильтруем данные, полученные с бека. `useQuery` при
этом сохраняет результат запроса между ререндерами компонента:

```jsx[class="line-numbers"]
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

Поскольку переменную `films` всегда **можно вычислить** напрямую из `data`, ее
не обязательно помещать в состояние, а если нужно сохранить
[ссылочное равенство](https://learn.javascript.ru/object-copy#sravnenie-po-ssylke),
можно воспользоваться хуком `useMemo`:

```jsx[class="line-numbers"]
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

Еще один случай, когда состояние окажется избыточным и довольно скоро приведет к
проблемам с производительностью - это пример реализации компонента `Grid`, в
котором на определенном этапе прокрутки таблицы, должна выводиться кнопка
"Вернуться в начало":

```jsx[class="line-numbers"]
const [showButtonUp, setShowButtonUp] = useState(false);

const handleScroll = (event) => {
  ...

  if (event.target.scrollTop > offsetHeight) {
    setShowButtonUp(true);
  } else {
    setShowButtonUp(false);
  }
};

return (
  <Body onScroll={handleScroll}>
    {rows.map(...)}
    {showButtonUp ? <ButtonUp /> : null}
  </Body>
);
```

Сейчас, когда состояние кнопки меняется, происходит ререндер всех строк, которых
может быть довольно много. А если таблица еще предоставляет возможности
кастомизации ячеек и в них могут содержаться достаточно сложные компоненты, мы
можем увидеть результаты своего решения - "тормоза" при появлении/скрытии
кнопки.

Если у нас достаточно маленький компонент, можно мемоизировать сами строки, но
при сложной внутренней логике и большом количестве зависимостей для `rows` такое
решение может оказаться не самым простым в реализации. И тогда можно задуматься
над **альтернативным способом** управления видимостью кнопки:

```jsx[class="line-numbers"]
const buttonUpRef = useRef(null);

const handleScroll = (event) => {
  ...

  if (event.target.scrollTop > offsetHeight) {
    buttonUpRef.current.style.visibilty = 'visible';
  } else {
    buttonUpRef.current.style.visibilty = 'hidden';
  }
};

return (
  <Body onScroll={handleScroll}>
    {rows.map(...)}
    <ButtonUp ref={buttonUpRef} />
  </Body>
);
```

Получив сам элемент кнопки и используя атрибут `style` мы можем скрывать и
показывать кнопку, только лишь средствами `css` и снова исключить из нашего кода
состояние.

## Не дублируйте состояние

Довольно плохой практикой считается хранения одних и тех же данных в нескольких
переменных состояния. Предположим, что мы делаем страничку автора со списком
книг. Можно выбрать одну из них и увидеть подробное описание книги:

```jsx[class="line-numbers"]
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

В примере выше, мы сохраняем всю информацию о выбранной книге в `selectedBook` —
это тот же объект, что и один из элементов `books` списка. И это не очень
хорошо, у нас задублировались одни и те же данные в разных переменных состояния.
Чревато это тем, что если список книг обновится, и выбранная книга изменится, то
в `selectedBook` у нас окажется не актуальный экземпляр.

Хотя мы можем написать код для синхронизации `selectedBook`, проще всего удалить
дублирование. В приведенном ниже примере, вместо объекта книги, мы сохраняем
`selectedId`, а затем получаем выбранную книгу путем поиска среди списка книг:

```jsx[class="line-numbers"]
const WriterCard = (props) => {
  const { data: books = [] } = useQuery(SOME_QUERY);
  const [selectedId, setSelectedId] = useState();

  const selectedBook =
    selectedId && books.find((book) => book.id === selectedId);

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

Другой пример, это компонент `Checkbox`, который управляет своим состоянием
`isChecked`:

```jsx[class="line-numbers"]
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  const handleChange = () => {
    setIsChecked(!isChecked);

    props.onChange?.(!isChecked);
  };

  return <input type="checkbox" checked={isChecked} onChange={handleChange} />;
};
```

Рассмотрим его в составе компонента `Filter`, который содержит список жанров для
фильтрации, и кнопку "Сбросить фильтры". Добавим в начальное состояние жанр
`rock`:

```jsx[class="line-numbers"]
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

При текущей реализации компонента `Checkbox`, функционирование кнопки "Сбросить
фильтры" не возможно, поскольку внутреннеее состояние компонента `Checkbox` уже
определено и повлиять на него извне мы не можем. Чтобы иметь возможность задать
чекбоксу актуальное состояние, нам приедется добавить в компонент `useEffect`:

```jsx[class="line-numbers"]
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  useEffect(() => {
    setIsChecked(props.isChecked);
  }, [props.isChecked]);
};
```

Однако теперь у нас стало две переменных, определяющих одно и тоже состояние.
Чтобы не создавать подобное дублирование, хорошим решением будет вовсе
избавиться от состояния в компоненте `Checkbox` и передавать состояние
`isChecked` напрямую через `props`:

```jsx[class="line-numbers"]
const Checkbox = (props) => {
  const handleChange = () => {
    props.onChange?.(!props.isChecked);
  };

  return (
    <input type="checkbox" checked={props.isChecked} onChange={handleChange} />
  );
};
```

А если нам все же нужно поддерживать внутреннее состояние, для простоты
использования в ряде случаев, то можно сделать следующее:

```jsx[class="line-numbers"]
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

Но такой подход нельзя порекомендовать как лучший, ввиду возрастающей сложности
компонента.

## Определяйте правильно объект состояния

Обычно, в состоянии всегда должна храниться сущность, которая является причиной
изменения компонента, а все зависимости вычисляются исходя из изменений этой
сущности.

Рассмотрим, создание кастомного компонента `Select`. Нам нужно имитировать
поведение элемента `input` и, к примеру, окрашивать рамку у контейнера, когда
возникает событие `onfocus`:

```jsx[class="line-numbers"]
const NORMAL_BORDER_STYLE = { borderColor: 'gray' };
const FOCUS_BORDER_STYLE = { borderColor: 'darkGray' };

const Select = (props) => {
  const [containerStyle, setContainerStyle] = useState(NORMAL_BORDER_STYLE);

  const handleFocus = () => {
    setContainerStyle(FOCUS_BORDER_STYLE);
  };

  const handleBlur = () => {
    setContainerStyle(NORMAL_BORDER_STYLE);
  };

  return (
    <div className="input-container" style={containerStyle}>
      <div
        className="input"
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      >
        {value}
      </div>
    </div>
  );
};
```

Сейчас мы добавили стили в состояние и меняем их при получени/снятии фокуса. Но
вот перед нами стоит следующая задача - добавлять иконку, появление которой
также зависит от фокуса:

```jsx[class="line-numbers"]
const Select = (props) => {
  const [containerStyle, setContainerStyle] = useState(NORMAL_BORDER_STYLE);
  const [showIcon, setShowIcon] = useState(false);

  const handleFocus = () => {
    setStyle(FOCUS_BORDER_STYLE);
    setShowIcon(true);
  };

  const handleBlur = () => {
    setStyle(NORMAL_BORDER_STYLE);
    setShowIcon(false);
  };

  return (
    <div className="input-container" style={style}>
      {showIcon && <Icon />}
      <div {...}>{value}</div>
    </div>
  );
};
```

Из кода выше становится понятно, что при добавлении новых эффектов, мы каждый
раз будем добавлять новый `useState`, либо усложнять текущий. Чтобы избежать
подобного сценария, необходимо сохранять само наличие фокуса, причину всех
изменений:

```jsx[class="line-numbers"]
const Select = (props) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className="input-container"
      style={isFocused ? FOCUS_BORDER_STYLE : NORMAL_BORDER_STYLE}
    >
      {isFocused && <Icon />}
      <div {...}>{value}</div>
    </div>
  );
};
```

Это правило тесно связанно с одним из примеров выше - важно не только отдавать
предпочтение вычислению данных "на ходу", если такая возможность есть, но и
организовывать состояние так, чтобы этим принципом можно было воспользоваться в
максимальном количестве случаев.

## Заключение

Суть этих правил состоит в том, что всякий раз, когда мы хотим сохранить что-то
в состоянии, мы должны задуматься:

- не можем ли мы обойтись без состояния? Сделать глупый `stateless` компонент и
  предоставлять все управление компонентам-пользователям, вычислять необходимые
  значения на ходу или пойти каким-то альтернативным путем, чтобы решить
  поставленную задачу?

- один ли у нас источник данных для отрисовки компонента?

- правильные ли мы данные храним в состоянии?

Ведь очень часто, что за плохие решения мы расплачиваемя снижением
производительности и переусложнением кода - вещами немаловажными при разработки
программ.

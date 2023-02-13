---
title: 'React Best Practies - Состояние'
date: '2023-01-07T18:37:00.00Z'
tag: 'React'
description: 'Одной из самых важных концепций, которую должен понимать каждый разработчик,
является состояние. Управление состоянием, это, часто, самая сложная часть
создания и масштабирования большинства веб-приложений. Именно поэтому сегодня
существует так много библиотек управления состоянием, и еще немало
разрабатывается.'
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
разработчики, заключается в том, что фрагменты данных помещаются в **React**
состояние, как правило, без особых раздумий.

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

  return <Marker ref={markerRef} onClick={handleClick} />
};

const SomeComponent = (props) => {
  return (
    <Map>
      <CustomMarker />
      <CustomMarker />
      {...}
    </Map>
  );
};
```

Как можно заметить, состояние `isOpen` фактически **никак не влияет на сам
рендер** маркера - оно нужно только для определения действия с тултипом. Поэтому
вместо `useState`, мы можем сохранить переменную в `useRef`, избежав тем самым
бесполезные повторные ререндеры при клике:

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

  return <Marker ref={markerRef} onClick={handleClick} />;
};
```

Другой пример - нам необходимо вывести список фильмов, для чего мы
предварительно извлекаем и фильтруем данные, полученные с бэка. `useQuery` при
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

Такой вариант будет не эффективным: сначала выполняется рендеринг с обновленным
значением для `data`, а затем выполняется повторный рендеринг для `films`.
Поскольку переменную `films` **можно вычислить** из `data`, ее не обязательно
помещать в состояние, а если нужно сохранить
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

Еще один пример, когда мы можем отказаться от использования состояния и вместе с
тем избежать потенциальных проблем с производительностью - это реализация
компонента `Grid`, в котором на определенном этапе прокрутки, должна выводиться
кнопка "Вернуться в начало":

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
  {...}
  <Body onScroll={handleScroll}>
    {rows.map(...)}
    {showButtonUp ? <ButtonUp /> : null}
  </Body>
);
```

Сейчас, когда состояние кнопки меняется, происходит ререндер всех строк, что
ведет к серьезной проблеме: если данных станет много, мы неизбежно столкнемся с
"тормозами" при появлении/скрытии кнопки.

Решением может стать использование `useMemo` для строк, но что если внутренняя
логика уже достаточно сложна и такое решение по каким-либо причинам не является
подходящим? В некоторых случаях можно воспользоваться **альтернативным
способом** управления состоянием элементов:

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
  {...}
  <Body onScroll={handleScroll}>
    {rows.map(...)}
    <ButtonUp ref={buttonUpRef} />
  </Body>
);
```

Получив сам элемент кнопки и используя атрибут `style` мы можем скрывать и
показывать кнопку, только лишь средствами `css`.

## Не дублируйте состояние

Довольно плохой практикой считается хранения одних и тех же данных в нескольких
переменных состояния. Иногда, не сразу можно разглядеть минусы этого подхода.

Предположим, что мы делаем страничку автора со списком книг. Можно выбрать одну
из них и увидеть подробное описание книги:

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
хорошо: у нас задублировались одни и те же данные в разных переменных состояния.
Чревато это тем, что если список книг обновится, и выбранная книга изменится, то
в `selectedBook` у нас окажется не актуальный экземпляр.

И хотя мы можем написать код для синхронизации `selectedBook`, проще всего
удалить дублирование. В приведенном ниже примере, вместо объекта книги, мы
сохраняем `selectedId`, а затем получаем выбранную книгу путем поиска среди
списка книг:

```jsx[class="line-numbers"]
const WriterCard = (props) => {
  const { data: books = [] } = useQuery(SOME_QUERY);
  const [selectedId, setSelectedId] = useState();

  const selectedBook =
    selectedId && books.find((book) => book.id === selectedId);

  return (
    <div>
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
`isChecked` локально:

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

Рассмотрим его в составе компонента `Filter`, который содержит список
музыкальных жанров для фильтрации, и кнопку "Сбросить фильтры":

```jsx[class="line-numbers"]
const Filter = (props) => {
  const [genres, setGenres] = useState(['rock']);

  const handleReset = () => {
    setGenres([]);
  };

  const handleChange = (genre) => {
    if (hasGenreIn(genres, genre)) {
      setGenres(genres.filter(...));
    } else {
      setGenres([...genres, genre]);
    }
  };

  return (
    <div>
      <button onClick={}>Сбросить фильтры</button>
      <Checkbox checked={hasGenreIn(genres, 'rock')} onChange={handleChange} />
      <Checkbox checked={hasGenreIn(genres, 'jazz')} onChange={handleChange} />
      <Checkbox checked={hasGenreIn(genres, 'metal')} onChange={handleChange} />
    </div>
  );
};
```

При текущей реализации `Checkbox`, мы не можем переопределять его внутреннее
состояние `isChecked` из родительского компонента - проперти `checked`
используется только при инициализации. Такие компоненты обычно называют
["неконтролируемыми"](https://beta.reactjs.org/learn/sharing-state-between-components#controlled-and-uncontrolled-components).
Чтобы иметь возможность задать чекбоксу актуальное состояние, появится соблазн
добавить в компонент `useEffect`:

```jsx[class="line-numbers"]
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  useEffect(() => {
    setIsChecked(props.isChecked);
  }, [props.isChecked]);

  ...
};
```

Но, как упоминалось выше, подобные обновления с `useEffect` нежелательны, так
как приводят к дополнительному ререндеру компонента, к тому же у нас теперь
стало две переменных, определяющих одно и тоже состояние. Чтобы не создавать
подобные проблемы, хорошим решением будет вовсе избавиться от состояния в
`Checkbox` и передавать состояние `isChecked` через `props`:

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

Однако, в ряде случаев, нам все же нужно поддерживать внутреннее состояние,
одновременно имея возможность задавать его извне, тогда можно воспользоваться
следующим паттерном:

```jsx[class="line-numbers"]
const Checkbox = (props) => {
  const [isChecked, setIsChecked] = useState(props.isChecked);

  const checked = props.state ? props.state.isChecked : isChecked;
  const setChecked = props.state ? props.state.setIsChecked : setIsChecked;

  const handleChange = () => {
    setChecked(!isChecked);

    props.onChange?.(!props.isChecked);
  };

  return <input type="checkbox" checked={checked} onChange={handleChange} />;
};
```

В примере выше, мы переключаемся на управление внешним состоянием, если
`props.state` определен, в противном случае, используем локальное состояние -
выбирая единственный источник правды в переменных `checked` и `setChecked`.
Конечно такой подход не идеален, ввиду возрастающей сложности компонента, но
убергает от минусов варианта с `useEffect`.

## Определяйте правильно объект состояния

Также встречаются ошибки, когда в состоянии хранится сущность, которая не
является первопричиной изменения компонента.

Рассмотрим, создание кастомного компонента `Select`, в котором нам нужно
имитировать поведение элемента `input` и, к примеру, окрашивать рамку у
контейнера, когда возникает событие `onfocus`:

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

Сейчас мы добавили стили в состояние и меняем их при получени/снятии фокуса.
Следующая задача - добавлять иконку, появление которой также зависит от фокуса:

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

Анализируя код выше, становится понятно, что при добавлении новых визуальных
эффектов, мы каждый раз будем добавлять новый `useState`, либо усложнять
текущий. Чтобы избежать подобного сценария, необходимо сохранять само наличие
фокуса - причину всех изменений:

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

Этот пример тесно связан с одним из предыдущих правил: организовывайте состояние
так, чтобы в нем содержалась минимально необходимая информация, на основе
которой уже будут вычислятся все остальные зависимые свойства.

## Заключение

Суть этих правил состоит в том, что всякий раз, когда мы хотим сохранить что-то
в состоянии, мы должны задуматься:

- можем ли мы вообще обойтись без состояния? Сделать глупый **stateless**
  компонент и предоставлять все управление компонентам-пользователям, вычислять
  необходимые значения "на ходу" или пойти каким-то альтернативным путем, чтобы
  решить поставленную задачу?

- не дублируются ли у нас одни и те же данные в разных переменных состояния?

- храним ли мы минимально неоходимую информацию в состоянии или присутствует
  некая избыточность?

Ведь очень часто, что за плохие решения мы расплачиваемя снижением
производительности и переусложнением кода - вещами немаловажными при разработке
хороших программ.

---
title: 'Как использовать React Context эффективно'
date: '2023-05-23T19:00:00.00Z'
tag: 'React'
description: 'React Context API - это хороший способ управления глобальным состоянием в
приложениях React, который позволяет передавать данные через дерево
компонентов без использования пропсов. Однако, как и любой другой инструмент,
Context нужно использовать грамотно, чтобы избежать потенциальных проблем с
производительностью и оптимизацией.'
---

**React Context API** - это хороший способ управления глобальным состоянием в
приложениях **React**, который позволяет передавать данные через дерево
компонентов без использования пропсов. Однако, как и любой другой инструмент,
**Context** нужно использовать грамотно, чтобы избежать потенциальных проблем с
производительностью и оптимизацией.

Кроме того, **Context** не всегда является идеальным решением для управления
сложным состоянием. При работе с большими объемами данных, частыми обновлениями
и зависимостями между частями состояния, **Context** может стать источником
проблем. В таких ситуациях стоит рассмотреть использование специализированных
**state** менеджеров, таких как **Redux**, **MobX**, **ApolloClient** и пр.

Эта статья поможет вам:

• Эффективно применять **Context**, избегая распространенных ошибок

• Понять, когда следует выбрать **Context**, а когда лучше подходят другие
решения

## Сложный пример

Давайте разберем чуть более сложный пример, чем обычно можно встретить в
обучающих статьях - попробуем хранить состояние проигрывателя музыки из
нескольких переменных и обеспечивать возможность его изменения:

```tsx
import { createContext, useState } from 'react';

type PlayerContextType = {...};

export const PlayerContext = createContext<PlayerContextType>({});

type PlayerProviderProps = {
  children: React.ReactNode;
};

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [currentTrackId, setCurrentTrackId] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSetCurrentTrackId = (id: string) => {
    // делаем что-нибудь... например:
    // logger.log(`Update Current track ID with value ${id}`);
    setCurrentTrackId(id);
  };

  const value = {
    currentTrackId,
    isPlaying,
    setCurrentTrackId: handleSetCurrentTrackId,
    setIsPlaying,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
```

### Какие проблемы можно заметить в этом коде?

1. Не предреднамеренное обновление `value`. Поскольку мы вынуждены объединять
   переменные состояния и их сеттеры в объекте, то сейчас обновление
   родительского компонента приведет к тому, что в `value` будет записан новый
   объект, а следовательно произойдет ререндер всех компонентов-консьюмеров,
   даже если значение контекста не изменилось.

2. Лишние ререндеры:

   ```tsx
   const Component1 = () => {
     const { setCurrentTrackId, setIsPlaying } = useContext(PlayerContext);

     ...
   }

   const Component2 = () => {
     const { currentTrackId, isPlaying } = useContext(PlayerContext);

     ...
   }

   const ParentComponent = () => {
     return (
       <PlayerProvider>
         <Component1 />
         <Component2 />
       </PlayerProvider>
     );
   };
   ```

   Если вы используете контекст как в примере выше, то следует учитывать, что
   при обновлении `currentTrackId` или `isPlaying`, **React** будет
   автоматически перерисовывать `Component1`. Это неэффективно, поскольку
   функции `setCurrentTrackId` и `setIsPlaying` фактически не должны меняться.

### Как исправить?

Также по пунктам:

1. Обернуть `value` в `useMemo`, это предотвратит нежелательное обновление:

   ```tsx
   const values = useMemo(
     () => ({
       currentTrackId,
       isPlaying,
     }),
     [currentTrackId, isPlaying],
   );
   ```

2. [Документация React](https://react.dev/learn/scaling-up-with-reducer-and-context)
   предлагает использовать два провайдера - один будет содержать значения, а
   другой сеттеры:

   ```tsx
   export const PlayerActionsContext = createContext<PlayerActionsContextType>({});

   export const PlayerProvider = ({ children }: PlayerProviderProps) => {
     ...

     // Как и для values сохраняем ссылку на объект, в случае обновления родителя
     const actions = useRef({
       setCurrentTrackId: handleSetCurrentTrackId,
       setIsPlaying,
     });

     // и просто актуализируем
     actions.current.setCurrentTrackId = handleSetCurrentTrackId;

     return (
       <PlayerContext.Provider value={values}>
         <PlayerActionsContext.Provider value={actions.current}>
           {children}
         </PlayerActionsContext.Provider>
       </PlayerContext.Provider>
     );
   };
   ```

   Хотя этот пример частично решает проблему, но такой вариант не сработает в
   случае, когда `currentTrackId` и `setIsPlaying` используются отдельно друг от
   друга.

### Какие еще варианты?

Если у вас ситуация чуть проще и `action` всего один - можно использовать
самописный
[useEvent](https://github.com/reactjs/rfcs/blob/useevent/text/0000-useevent.md):

```tsx
export const PlayerActionsContext = createContext<PlayerActionsContextType>({});

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  ...

  // обработчик c неменяющимся идентификатором функции
  const action = useEvent(handleSetCurrentTrackId);

  return (
    <PlayerContext.Provider value={value}>
      <PlayerActionsContext.Provider value={action}>
        {children}
      </PlayerActionsContext.Provider>
    </PlayerContext.Provider>
  );
};
```

Если вы уверены, что провайдер будет использован только один раз в приложении,
то вы можете оптимизировать получение сеттеров следующим образом:

```tsx
export let actions: PlayerActionsContextType = {};

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  ...

  actions = {
    setCurrentTrackId: handleSetCurrentTrackId,
    setIsPlaying,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// использование
import { PlayerContext, PlayerProvider, actions } from './contexts/PlayerProvider';

const Component1 = () => {
  const { setCurrentTrackId, setIsPlaying } = actions;

  ...
}
```

Также можно воспользоваться `useReducer`:

```tsx
import { createContext, useReducer } from 'react';

export let dispatch = () => {};

const reducer = (state, action) => {
  if (action.type === 'set_current_track') {
    return {
      ...state,
      currentTrackId: action.payload,
    };
  }

  if (action.type === 'set_is_playing') {
    return {
      ...state,
      isPlaying: action.payload,
    };
  }

  throw Error('Unknown action.');
};

export const PlayerProvider = ({ children }: PlayerProviderProps) => {
  const [state, dispathFn] = useReducer(reducer, {
    currentTrackId: undefined,
    isPlaying: false,
  });

  dispatch = (action) => {
    /**
     * делаем что-нибудь... например:
     * if (action.type === 'set_is_playing') {
     *   logger.log(`Update Current track ID with value ${id}`);
     * }
     */
    dispathFn(action);
  };

  return (
    <PlayerContext.Provider value={state}>{children}</PlayerContext.Provider>
  );
};
```

## Использовать Context API или нет?

Подводя итог по приведенному примеру, можно сказать следующее:

Хотя **Context Api** и предоставляет простой способ передачи данных между
компонентами **React**, однако при более сложном использовании требует
приложения определенных усилий для обеспечения правильной работы. В частности,
**Context Api** поощряет использование неизменяемых структур данных и строгого
сравнения значений контекста, что может быть затруднительно, учитывая, что
многие источники данных основаны на мутации. Поэтому, при выборе **state**
менеджера, необходимо учитывать сложность приложения и уровень опыта
разработчиков.

Также, нужно не забывать, что:

1. Вы можете добавить контекст к любой части вашего приложения, не обязательно
   делать его глобальным

2. Часто есть альтернативные пути решения проблемы, обычная
   [композиция компонентов](https://react.dev/learn/passing-data-deeply-with-context#before-you-use-context)
   может оказаться проще

3. Передача большого количества данных, делает код менее понятным и усложняет
   его сопровождение

В дополнение, важно отметить, что необходимо различать категории данных и
применять соответствующие подходы к их управлению. Например данные, получаемые с
сервера, являются серверным состоянием и лучше использовать специализированные
инструменты для работы с ними, такие как **React-Query** или **Apollo Client**.

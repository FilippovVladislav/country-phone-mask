# country-phone-mask

Лёгкий компонент для телефонного поля: выбор страны с флагами, маска номера и аккуратная работа с кареткой. Создаёт `input[type="tel"]` внутри указанного контейнера и не требует runtime-зависимостей.

👉 [Открыть пример в CodeSandbox](https://codesandbox.io/p/sandbox/263w57)

## Что умеет

- Форматирует номер по маске выбранной страны.
- Показывает страны и SVG-флаги в выпадающем списке.
- Защищает код страны от случайного удаления.
- Корректно обрабатывает ввод, удаление, вставку и положение каретки рядом со скобками, пробелами и дефисами.
- Принимает номер из буфера в международном, российском национальном или локальном формате.
- Определяет начальную страну по `defaultCountry`, начальному номеру или, при необходимости, через `ipinfo.io`.
- Позволяет добавить страны и корректно удалить экземпляр.
- Работает с ESM, CommonJS и TypeScript.

## Установка

```bash
npm install country-phone-mask
```

```bash
yarn add country-phone-mask
```

## Быстрый старт

```html
<div class="phone-input"></div>
```

```ts
import createPhoneInput, { countries } from 'country-phone-mask';
import 'country-phone-mask/dist/index.css';

const phone = createPhoneInput({
    container: document.querySelector<HTMLElement>('.phone-input')!,
    countries,
    defaultCountry: 'RU',
    spritePath: '/icons/sprite.svg',
});
```

`container` должен существовать к моменту вызова. Один вызов создаёт один элемент поля; перед повторной инициализацией контейнера вызовите `phone.destroy()`.

### Использование через CDN

```html
<link rel="stylesheet" href="https://unpkg.com/country-phone-mask/dist/index.css">

<div class="phone-input"></div>

<script type="module">
  import createPhoneInput, { countries } from 'https://unpkg.com/country-phone-mask/dist/index.esm.js';

  createPhoneInput({
    container: document.querySelector('.phone-input'),
    countries,
    defaultCountry: 'RU',
    spritePath: 'https://unpkg.com/country-phone-mask/dist/icons/sprite.svg',
  });
</script>
```

### CommonJS

```js
const phoneMask = require('country-phone-mask');

const phone = phoneMask.default({
    container: document.querySelector('.phone-input'),
    countries: phoneMask.countries,
    defaultCountry: 'RU',
});
```

## Настройка поля через HTML

Плагин считывает атрибуты `data-*` с контейнера.

```html
<div
  class="phone-input"
  data-name="phone"
  data-id="phone-field"
  data-value="+79612035444"
  data-clue="Введите номер телефона"
></div>
```

| Атрибут | Назначение |
| --- | --- |
| `data-name` | Атрибут `name` созданного `input`, необходимый для отправки формы. |
| `data-id` | Атрибут `id` созданного `input`. |
| `data-value` | Начальный номер в любом привычном формате. |
| `data-clue` | Текст подсказки над полем, отображаемой при фокусе. |

## Опции

```ts
interface Country {
    name: string;
    code: string;
    dialCode: string;
    mask: string;
}

interface PhoneInputOptions {
    container: HTMLElement;
    countries: Country[];
    spritePath?: string;
    apiKey?: string;
    defaultCountry?: string;
}
```

| Опция | Обязательна | Описание |
| --- | --- | --- |
| `container` | Да | Контейнер для интерфейса поля. |
| `countries` | Да | Массив стран; можно импортировать встроенный `countries`. |
| `spritePath` | Нет | Путь к SVG-спрайту. По умолчанию: `./icons/sprite.svg`. |
| `apiKey` | Нет | Токен `ipinfo.io` для геоопределения страны. |
| `defaultCountry` | Нет | Код начальной страны, например `RU`. Имеет приоритет над номером и геоопределением. |

Для предсказуемого результата рекомендуется указывать `defaultCountry`.

## Формат страны и свои страны

`_` в маске — место для одной цифры. Остальные символы считаются форматированием.

```ts
const myCountries = [
    {
        name: 'None Country',
        code: 'NONE',
        dialCode: '',
        mask: '',
    },
    {
        name: 'Russia',
        code: 'RU',
        dialCode: '+7',
        mask: '+7 (___) ___-__-__',
    },
    {
        name: 'Germany',
        code: 'DE',
        dialCode: '+49',
        mask: '+49 (___) ___-____',
    },
];

createPhoneInput({
    container: document.querySelector<HTMLElement>('.phone-input')!,
    countries: myCountries,
    defaultCountry: 'RU',
});
```

Встроенная страна `NONE` создаёт поле без флага, кода и маски. Значения `code` должны быть уникальны. У России и Казахстана общий код `+7`; если важно выбрать одну из них до ввода, задайте `defaultCountry`.

## Вставка номера

Ctrl+V заменяет номер в поле целиком и применяет маску выбранной страны. Для маски России или Казахстана следующие варианты равнозначны:

| Содержимое буфера | Результат |
| --- | --- |
| `+79612035444` | `+7 (961) 203-54-44` |
| `89612035444` | `+7 (961) 203-54-44` |
| `9612035444` | `+7 (961) 203-54-44` |

Международный код удаляется, если номер начинается с `+` и совпадает с кодом выбранной страны. Для `+7` также поддерживается российская/казахстанская национальная начальная `8` у полного номера.

## Методы экземпляра

```ts
const phone = createPhoneInput({ container, countries });

phone.addCountries([
    {
        name: 'Example',
        code: 'EX',
        dialCode: '+999',
        mask: '+999 ___ ___',
    },
]);

phone.destroy();
```

| Метод | Описание |
| --- | --- |
| `addCountries(newCountries)` | Добавляет страны без дубликатов по `code` и обновляет список. |
| `destroy()` | Удаляет интерфейс, созданный плагином, и обработчики событий. |

## Утилиты

```ts
import {
    digitsOnly,
    findCountryByDial,
    formatDigitsToMask,
} from 'country-phone-mask';
```

| Функция | Описание |
| --- | --- |
| `digitsOnly(value)` | Оставляет в строке только цифры. |
| `findCountryByDial(digits, countries)` | Ищет страну по самому длинному совпадающему телефонному коду. |
| `formatDigitsToMask(digits, mask)` | Подставляет цифры в маску; лишние цифры добавляет в конец. |

## Геоопределение

Если не задан `defaultCountry` и начальный номер не позволяет определить страну, плагин запрашивает `https://ipinfo.io/country`.

```ts
createPhoneInput({
    container,
    countries,
    apiKey: 'YOUR_IPINFO_TOKEN',
});
```

При ошибке запроса остаётся первая fallback-страна: `NONE`, затем `NA`, затем первый элемент массива. Если сетевой запрос не нужен, укажите `defaultCountry`.

## Стили и флаги

Импорт CSS обязателен для готового внешнего вида. SVG-флаг подключается как `${spritePath}#${code}`, поэтому в спрайте должен быть символ с id кода страны, например `RU`.

Основные CSS-классы для переопределения дизайна:

- `.phone-input-wrapper`
- `.current-country`
- `.country-options`
- `.country-option`
- `.phone-input-wrapper input[type="tel"]`

## Поведение и ограничения

- Смена страны очищает введённый номер и показывает её маску.
- Плагин форматирует ввод, но не валидирует номер и не сообщает о его полноте. Перед отправкой формы выполните нужную валидацию в приложении.
- Незавершённая маска содержит `_`; если в форму должно уходить только число, очистите значение через `digitsOnly(input.value)` в обработчике формы.
- Публичного API для получения/установки номера и событий смены страны сейчас нет.
- Выпадающий список не закрывается по клику вне поля или по клавише Esc.

## Сборка из исходников

```bash
npm install
npm run build
```

Результат публикуется в `dist/`: ESM, CommonJS, TypeScript-декларации, CSS и SVG-спрайт.

## Лицензия

ISC

# country-phone-mask

Легкий JavaScript/TypeScript-плагин для телефонного поля с выбором страны, маской номера, SVG-флагами и защитой кода страны.

Плагин сам создает `input[type="tel"]` внутри указанного контейнера, форматирует ввод по маске выбранной страны и не дает каретке уйти в защищенную часть кода страны. Например для России каретка не уйдет левее первой позиции ввода в маске:

```text
+7 (___) ___-__-__
    ^
```

## Возможности

- Маска телефона для каждой страны.
- Выпадающий список стран с флагами из SVG-спрайта.
- Автоматическое определение страны по уже переданному номеру.
- Опциональное определение страны через `ipinfo.io`.
- Защита кода страны от удаления и случайного ввода перед ним.
- Поддержка вставки номера из буфера.
- Поддержка дополнительных стран через `addCountries`.
- Метод `destroy` для удаления созданного поля и обработчиков.
- ESM, CommonJS и TypeScript-типы.

## Установка

```bash
npm install country-phone-mask
```

```bash
yarn add country-phone-mask
```

## Быстрый старт

Подключите CSS и инициализируйте плагин для каждого контейнера:

```ts
import createPhoneInput, { countries } from 'country-phone-mask';
import 'country-phone-mask/dist/index.css';

document.querySelectorAll<HTMLElement>('.phone-input').forEach((container) => {
    createPhoneInput({
        container,
        countries,
        spritePath: '/icons/sprite.svg',
        defaultCountry: 'RU',
    });
});
```

HTML:

```html
<div class="phone-input"></div>
```

## CDN

```html
<link rel="stylesheet" href="https://unpkg.com/country-phone-mask/dist/index.css" />

<div class="phone-input"></div>

<script type="module">
    import createPhoneInput, { countries } from 'https://unpkg.com/country-phone-mask/dist/index.esm.js';

    document.querySelectorAll('.phone-input').forEach((container) => {
        createPhoneInput({
            container,
            countries,
            spritePath: 'https://unpkg.com/country-phone-mask/dist/icons/sprite.svg',
            defaultCountry: 'RU',
        });
    });
</script>
```

## CommonJS

```js
const phoneMask = require('country-phone-mask');

phoneMask.default({
    container: document.querySelector('.phone-input'),
    countries: phoneMask.countries,
    spritePath: '/icons/sprite.svg',
});
```

## HTML-атрибуты

Плагин читает настройки из `data-*` атрибутов контейнера.

```html
<div
    class="phone-input"
    data-name="phone"
    data-id="phone-field"
    data-value="+79612035444"
    data-clue="Введите номер телефона"
></div>
```

| Атрибут | Описание |
| --- | --- |
| `data-name` | Значение для `name` созданного `input`. |
| `data-id` | Значение для `id` созданного `input`. |
| `data-value` | Начальное значение номера. Можно передавать полный номер с кодом страны. |
| `data-clue` | Подсказка, которая появляется при фокусе на поле. |

## Опции

```ts
interface PhoneInputOptions {
    container: HTMLElement;
    countries: Country[];
    spritePath?: string;
    apiKey?: string;
    defaultCountry?: string;
}
```

| Опция | Обязательная | Описание |
| --- | --- | --- |
| `container` | Да | DOM-элемент, внутрь которого будет добавлен телефонный input. |
| `countries` | Да | Массив стран и масок. Можно использовать встроенный `countries`. |
| `spritePath` | Нет | Путь к SVG-спрайту с флагами. По умолчанию `./icons/sprite.svg`. |
| `apiKey` | Нет | Токен ipinfo.io для автоопределения страны. |
| `defaultCountry` | Нет | Код страны по умолчанию, например `RU`. Имеет приоритет над геолокацией. |

## Формат Country

```ts
interface Country {
    name: string;
    code: string;
    dialCode: string;
    mask: string;
}
```

Пример:

```ts
const ru = {
    name: 'Russia',
    code: 'RU',
    dialCode: '+7',
    mask: '+7 (___) ___-__-__',
};
```

В маске символ `_` означает позицию, куда пользователь может вводить цифру. Все остальные символы считаются частью форматирования.

## Пустая страна

Во встроенном списке есть специальная страна без маски:

```ts
{
    name: 'None Country',
    code: 'NONE',
    dialCode: '',
    mask: '',
}
```

Используйте `NONE`, если хотите дать пользователю вариант без кода страны и без маски.

## Свой список стран

```ts
import createPhoneInput from 'country-phone-mask';

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
    container: document.querySelector('.phone-input')!,
    countries: myCountries,
    defaultCountry: 'RU',
});
```

## API экземпляра

`createPhoneInput` возвращает объект с методами:

```ts
const phone = createPhoneInput({
    container,
    countries,
});

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
| `addCountries(newCountries)` | Добавляет новые страны без дублей по `code` и перерисовывает список. |
| `destroy()` | Удаляет созданный DOM и снимает обработчики событий. |

## Экспортируемые утилиты

```ts
import {
    digitsOnly,
    findCountryByDial,
    formatDigitsToMask,
} from 'country-phone-mask';
```

| Утилита | Описание |
| --- | --- |
| `digitsOnly(value)` | Возвращает только цифры из строки. |
| `findCountryByDial(digits, countries)` | Находит страну по телефонному коду. |
| `formatDigitsToMask(digits, mask)` | Форматирует цифры по маске и оставляет дополнительные цифры в конце. |

## Поведение ввода

- Код страны считается защищенной частью значения.
- Каретка не уходит левее первой вводимой позиции маски.
- Для `+7 (___) ___-__-__` минимальная позиция каретки находится на первом `_`.
- Если цифр больше, чем позиций `_` в маске, лишние цифры добавляются в конец строки, а не отбрасываются.
- При смене страны значение сбрасывается на маску выбранной страны.

## Геоопределение

Если `defaultCountry` не задан и нет `data-value`, плагин пробует определить страну через `https://ipinfo.io/country`.

```ts
createPhoneInput({
    container,
    countries,
    apiKey: 'YOUR_IPINFO_TOKEN',
});
```

Если запрос не пройдет или страна не найдется, поле останется на fallback-стране.

## Флаги

Флаги берутся из SVG-спрайта. Код страны используется как id символа:

```html
<use href="/icons/sprite.svg#RU"></use>
```

При сборке пакет кладет спрайт в:

```text
dist/icons/sprite.svg
```

Для CDN можно использовать:

```ts
spritePath: 'https://unpkg.com/country-phone-mask/dist/icons/sprite.svg'
```

## Сборка из исходников

```bash
npm install
npm run build
```

Результат сборки:

```text
dist/index.esm.js
dist/index.cjs
dist/index.d.ts
dist/index.css
dist/icons/sprite.svg
```

## Примечания

- Для уникального выбора страны значения `code` должны быть уникальными.
- Если несколько стран имеют один `dialCode`, например `RU` и `KZ` с `+7`, используйте `defaultCountry`, чтобы выбрать нужную страну по умолчанию.
- `data-clue` вставляется как текст, HTML внутри подсказки не интерпретируется.

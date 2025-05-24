# 📞 country-phone-mask

Универсальный JavaScript-плагин для ввода телефонных номеров с поддержкой масок и выбора страны.  
Поддерживает флаги через SVG-спрайт, смену маски при выборе страны, защиту префикса и умную работу с курсором.

👉 [Открыть пример в CodeSandbox](https://codesandbox.io/p/sandbox/263w57)

## Установка

### NPM

```bash
npm install country-phone-mask
```

или

```bash
yarn add country-phone-mask
```

### CDN (если не используете сборщик)

```html
<link rel="stylesheet" href="https://unpkg.com/country-phone-mask/dist/style.css" />
<script type="module">
    import createPhoneInput, { countries } from 'https://unpkg.com/country-phone-mask/dist/index.esm.js';

    const container = document.getElementById('current-input');

    createPhoneInput({
        container,
        countries: countries,
        spritePath: '/icons/sprite.svg',
    });
</script>
```

## Быстрый старт

```ts
import createPhoneInput, { countries } from 'country-phone-mask';

const container = document.getElementById('current-input');
createPhoneInput({
  container,
  countries,
  spritePath: '/icons/sprite.svg',
});
```

## Структура объекта Country

```ts
interface Country {
  name: string;      // Название страны
  code: string;      // Код страны (например, 'ru', 'kz')
  dialCode: string;  // Телефонный код (например, '+7')
  mask: string;      // Маска для ввода (например, '+7 (___) ___-__-__')
}
```

## Вы можете легко заменить на свои страны, просто замените массив `countries`.
```ts
    const myCountries = [
        {
            name: 'None Country',
            code: 'NA',
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
            name: 'Kazakhstan',
            code: 'KZ',
            dialCode: '+7',
            mask: '+7 (___) ___-__-__',
        },
        {
            name: 'Belarus',
            code: 'BY',
            dialCode: '+375',
            mask: '+375 (__) ___-__-__'
        },
        {
            name: 'Uzbekistan',
            code: 'UZ',
            dialCode: '+998',
            mask: '+998 (__) ___-__-__'
        }
    ];
```

## Особенности

- 📱 Поддержка масок ввода по стране
- 🚩 Отображение флагов через SVG-спрайт
- 🔒 Защита префикса
- 🧠 Умное позиционирование курсора
- ✍️ Поддержка удаления и вставки номеров

## 💖 Поддержать автора

Если вам понравился этот плагин и вы хотите поддержать его развитие:

- 💳 Карта РФ: **5536 9139 9548 1773**
- ₿ Bitcoin: **18Ny4EDjZM2Y3xq6YoY9xmmjW8q3w9m6Eh**
- Tether USD: **TUMKgoGgtAPgrd7ra82RyeqyAipD1Aj16w**

Спасибо за вашу поддержку!
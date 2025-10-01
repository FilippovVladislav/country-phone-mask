# 📞 country-phone-mask

Универсальный JavaScript-плагин для ввода телефонных номеров с поддержкой масок и выбора страны.  
Поддерживает флаги через SVG-спрайт, смену маски при выборе страны, защиту префикса и умную работу с курсором.

![Демо](https://github.com/FilippovVladislav/country-phone-mask/blob/master/animation.gif)

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

    const container = document.querySelectorAll(".phone-input");

    container.forEach((item) => {
        createPhoneInput({
            container: item,
            countries: countries,
            spritePath: "public/sprite.svg", // можно переопределить путь
            apiKey: "", //https://ipinfo.io/
        });
    });
</script>
```

## Быстрый старт

```ts
import createPhoneInput, { countries } from 'country-phone-mask';

const container = document.querySelectorAll(".phone-input");

container.forEach((item) => {
    createPhoneInput({
        container: item,
        countries: countries,
        spritePath: "public/sprite.svg", // можно переопределить путь
        apiKey: "", //https://ipinfo.io/
    });
});
```

## Вы можете легко заменить на свои страны, просто замените массив `countries`.
```ts
import createPhoneInput, {
  countries as defaultCountries,
} from "country-phone-mask";

const container = document.querySelectorAll(".phone-input");

const myCountries = [
  {
    name: "None Country",
    code: "NA",
    dialCode: "",
    mask: "",
  },
  {
    name: "Russia",
    code: "RU",
    dialCode: "+7",
    mask: "+7 (___) ___-__-__",
  },
    {name: "other"}
 ]
container.forEach((item) => {
    createPhoneInput({
        container: item,
        countries: myCountries,
        spritePath: "public/sprite.svg", // переопределить путь
        apiKey: "", //https://ipinfo.io/
    });
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

## Особенности

- 📱 Поддержка масок ввода по стране
- 🚩 Отображение флагов через SVG-спрайт
- 🔒 Защита префикса
- 🧠 Умное позиционирование курсора
- ✍️ Поддержка удаления и вставки номеров
- Добавление уникального id
- Добавление подсказки при фокусировке
- Добавление уже вставленого номера

## 💖 Поддержать автора

Если вам понравился этот плагин и вы хотите поддержать его развитие:

- 💳 Карта РФ: **5536 9139 9548 1773**
- ₿ Bitcoin: **18Ny4EDjZM2Y3xq6YoY9xmmjW8q3w9m6Eh**
- Tether USD: **TUMKgoGgtAPgrd7ra82RyeqyAipD1Aj16w**

Спасибо за вашу поддержку!
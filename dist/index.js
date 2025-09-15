import './styles/index.css';
export { countries } from './countries-data';
export default function createPhoneInput({ container, countries, spritePath = './icons/sprite.svg', apiKey, }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'phone-input-wrapper';
    const dropdown = document.createElement('div');
    dropdown.className = 'country-dropdown';
    const current = document.createElement('button');
    current.className = 'current-country';
    current.type = 'button';
    const options = document.createElement('div');
    options.className = 'country-options';
    const nameAttr = container.dataset.name;
    const idAttr = container.dataset.id;
    const clueAttr = container.dataset.clue;
    let currentCountry = countries.find(c => c.code === 'na') || countries[0];
    let currentMask = currentCountry.mask;
    let prefixValue = currentCountry.dialCode;
    let maskEnabled = currentMask !== '';
    function renderOptions() {
        options.innerHTML = '';
        countries.forEach(country => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'country-option';
            if (country.code === currentCountry.code) {
                option.classList.add('selected');
            }
            option.dataset.code = country.code;
            option.dataset.mask = country.mask;
            option.dataset.dialCode = country.dialCode;
            option.innerHTML = `
          <svg><use href="${spritePath}#${country.code}" /></svg>
          <span>${country.name}</span>
        `;
            options.appendChild(option);
        });
    }
    renderOptions();
    function renderCurrentCountry() {
        current.innerHTML = `
          <svg><use href="${spritePath}#${currentCountry.code}" /></svg>
          <span>${currentCountry.code}</span>
        `;
    }
    renderCurrentCountry();
    dropdown.appendChild(current);
    dropdown.appendChild(options);
    const input = document.createElement('input');
    input.type = 'tel';
    input.placeholder = currentMask;
    input.value = maskEnabled ? currentMask : '';
    if (nameAttr)
        input.name = nameAttr;
    if (idAttr)
        input.id = idAttr;
    let newClue;
    if (clueAttr) {
        newClue = document.createElement('div');
        newClue.classList.add('clue-input');
        newClue.innerHTML = clueAttr;
        wrapper.appendChild(newClue);
    }
    wrapper.appendChild(dropdown);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
    let previousValue = input.value;
    current.addEventListener('click', () => {
        options.classList.toggle('visible');
    });
    options.addEventListener('click', (e) => {
        const btn = e.target.closest('.country-option');
        if (!btn)
            return;
        // Обновляем подсветку
        options.querySelectorAll('.country-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        btn.classList.add('selected');
        const code = btn.dataset.code;
        const mask = btn.dataset.mask;
        const dialCode = btn.dataset.dialCode;
        currentCountry = countries.find(c => c.code === code);
        currentMask = mask;
        prefixValue = dialCode;
        maskEnabled = mask !== '';
        input.placeholder = maskEnabled ? mask : '';
        input.value = maskEnabled ? mask : '';
        previousValue = input.value;
        renderCurrentCountry();
        options.classList.remove('visible');
        if (maskEnabled) {
            const pos = input.value.indexOf('_', prefixValue.length);
            setCaretPosition(input, pos === -1 ? input.value.length : pos);
        }
    });
    async function detectUserCountry(apiKey) {
        try {
            let url = 'https://ipinfo.io/country';
            if (apiKey) {
                url += `?token=${apiKey}`;
            }
            const res = await fetch(url);
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            const userCode = (await res.text()).trim().toUpperCase();
            const matched = countries.find(c => c.code === userCode);
            if (matched) {
                currentCountry = matched;
                currentMask = matched.mask;
                prefixValue = matched.dialCode;
                maskEnabled = matched.mask !== '';
            }
            else {
                const fallback = countries.find(c => c.code === 'NA');
                if (fallback) {
                    currentCountry = fallback;
                    currentMask = '';
                    prefixValue = '';
                    maskEnabled = false;
                }
            }
            input.placeholder = currentMask;
            input.value = maskEnabled ? currentMask : '';
            previousValue = input.value;
            renderCurrentCountry();
            renderOptions();
            if (maskEnabled) {
                const pos = input.value.indexOf('_', prefixValue.length);
                setCaretPosition(input, pos === -1 ? input.value.length : pos, true);
            }
        }
        catch (err) {
            console.error('Geo detection failed:', err);
            const fallback = countries.find(c => c.code === 'NA');
            if (fallback) {
                currentCountry = fallback;
                currentMask = '';
                prefixValue = '';
                maskEnabled = false;
                input.placeholder = '';
                input.value = '';
                previousValue = '';
                renderCurrentCountry();
                renderOptions();
            }
        }
    }
    // Запускаем определение гео после инициализации базовых элементов
    detectUserCountry(apiKey);
    function addCountries(newCountries) {
        const existingCodes = new Set(countries.map(c => c.code));
        newCountries.forEach(nc => {
            if (!existingCodes.has(nc.code)) {
                countries.push(nc);
            }
        });
        renderOptions();
    }
    function setCaretPosition(elem, pos, preventFocus = false) {
        if (elem.setSelectionRange) {
            if (!preventFocus)
                elem.focus();
            elem.setSelectionRange(pos, pos);
        }
    }
    function isMaskPlaceholder(char) {
        return char === '_';
    }
    function insertDigitAt(value, pos, digit, mask) {
        const valArr = value.split('');
        let insertPos = pos;
        while (insertPos < mask.length && !isMaskPlaceholder(mask[insertPos])) {
            insertPos++;
        }
        if (insertPos >= mask.length)
            return { newValue: value, newPos: pos };
        valArr[insertPos] = digit;
        let newPos = insertPos + 1;
        while (newPos < mask.length && !isMaskPlaceholder(mask[newPos])) {
            newPos++;
        }
        if (newPos > mask.length)
            newPos = mask.length;
        return { newValue: valArr.join(''), newPos };
    }
    function removeDigitSkipSeparators(value, pos, prefixLength, direction) {
        const val = value.split('');
        if (direction === 'backspace') {
            if (pos <= prefixLength)
                return { newValue: value, newPos: prefixLength };
            let index = pos - 1;
            while (index >= prefixLength && !/\d/.test(val[index])) {
                index--;
            }
            if (index < prefixLength)
                return { newValue: value, newPos: prefixLength };
            val[index] = '_';
            return { newValue: val.join(''), newPos: index };
        }
        else {
            if (pos < prefixLength)
                return { newValue: value, newPos: prefixLength };
            let index = pos;
            while (index < val.length && !/\d/.test(val[index])) {
                index++;
            }
            if (index >= val.length)
                return { newValue: value, newPos: val.length };
            val[index] = '_';
            return { newValue: val.join(''), newPos: index };
        }
    }
    input.addEventListener('focus', () => {
        if (!maskEnabled)
            return;
        if (clueAttr) {
            newClue.classList.add('active');
        }
        setTimeout(function () {
            if (clueAttr) {
                newClue.classList.remove('active');
            }
        }, 3000);
        if (input.value === '' || input.value === prefixValue + ' ') {
            input.value = currentMask;
            const firstInputPos = currentMask.indexOf('_', prefixValue.length);
            setCaretPosition(input, firstInputPos === -1 ? currentMask.length : firstInputPos);
            previousValue = input.value;
        }
    });
    input.addEventListener('keydown', (e) => {
        if (!maskEnabled)
            return;
        const pos = input.selectionStart || 0;
        const key = e.key;
        if (key === 'Backspace' || key === 'Delete') {
            e.preventDefault();
            const direction = key === 'Backspace' ? 'backspace' : 'delete';
            const { newValue, newPos } = removeDigitSkipSeparators(input.value, pos, prefixValue.length, direction);
            input.value = newValue;
            setCaretPosition(input, newPos);
            previousValue = newValue;
        }
    });
    input.addEventListener('input', () => {
        if (!maskEnabled) {
            // Очищаем всё кроме цифр
            input.value = input.value.replace(/\D/g, '');
            return;
        }
        if (!input.value.startsWith(prefixValue)) {
            const digits = input.value.replace(/\D/g, '');
            input.value = prefixValue + ' ' + digits.slice(prefixValue.replace(/\D/g, '').length);
            setCaretPosition(input, input.value.length);
            previousValue = input.value;
            return;
        }
        const pos = input.selectionStart || 0;
        const lastChar = input.value[pos - 1];
        if (!/\d/.test(lastChar)) {
            input.value = previousValue;
            setCaretPosition(input, pos - 1);
            return;
        }
        const { newValue, newPos } = insertDigitAt(previousValue, pos - 1, lastChar, currentMask);
        input.value = newValue;
        setCaretPosition(input, newPos);
        previousValue = newValue;
    });
    input.addEventListener('mousedown', (e) => {
        if (!maskEnabled)
            return;
        if (input.value === currentMask) {
            e.preventDefault();
            const firstInputPos = currentMask.indexOf('_', prefixValue.length);
            setTimeout(() => setCaretPosition(input, firstInputPos === -1 ? currentMask.length : firstInputPos), 0);
        }
    });
    input.addEventListener('paste', (e) => {
        var _a;
        if (!maskEnabled)
            return;
        e.preventDefault();
        const pastedData = ((_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.getData('text')) || '';
        const digits = pastedData.replace(/\D/g, '');
        let valArr = input.value.split('');
        let mask = currentMask;
        let insertPos = prefixValue.length;
        // Вставляем цифры по маске, заменяя плейсхолдеры
        for (let digit of digits) {
            // Найти следующий плейсхолдер
            while (insertPos < mask.length && mask[insertPos] !== '_') {
                insertPos++;
            }
            if (insertPos >= mask.length)
                break;
            valArr[insertPos] = digit;
            insertPos++;
        }
        const newValue = valArr.join('');
        input.value = newValue;
        // Устанавливаем курсор в следующую позицию для ввода
        let caretPos = newValue.indexOf('_');
        if (caretPos === -1)
            caretPos = newValue.length;
        setCaretPosition(input, caretPos);
        previousValue = newValue;
    });
    // Закрытие выпадающего списка при клике вне
    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            options.classList.remove('visible');
        }
    });
    return {
        addCountries,
    };
}

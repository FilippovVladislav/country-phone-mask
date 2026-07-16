import './styles/index.css';
export { countries } from './countries-data';

export interface Country {
    name: string;
    code: string;
    dialCode: string;
    mask: string;
}

export interface PhoneInputOptions {
    container: HTMLElement;
    countries: Country[];
    spritePath?: string;
    apiKey?: string;
    defaultCountry?: string;
}

export function digitsOnly(s: string) {
    return (s || "").replace(/\D/g, "");
}

export function findCountryByDial(digits: string, countries: Country[]): Country | undefined {
    let best: Country | undefined;
    let bestLen = 0;

    for (const c of countries) {
        const cd = digitsOnly(c.dialCode);
        if (!cd) continue;

        if (digits.startsWith(cd) && cd.length > bestLen) {
            best = c;
            bestLen = cd.length;
        }
    }

    return best;
}

export function formatDigitsToMask(digits: string, mask: string) {
    let formatted = "";
    let di = 0;

    for (let i = 0; i < mask.length; i++) {
        if (mask[i] === "_") {
            if (di < digits.length) {
                formatted += digits[di++];
            } else {
                formatted += "_";
            }
        } else {
            formatted += mask[i];
        }
    }

    return formatted + digits.slice(di);
}

function appendCountryIcon(parent: HTMLElement, spritePath: string, code: string) {
    if (code === 'NONE') return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `${spritePath}#${code}`);
    svg.appendChild(use);
    parent.appendChild(svg);
}

export default function createPhoneInput({
                                             container,
                                             countries,
                                             spritePath = './icons/sprite.svg',
                                             apiKey,
                                             defaultCountry,
                                         }: PhoneInputOptions) {
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
    const valueAttr = (container.dataset.value || "").trim();

    let newClue: HTMLDivElement | undefined;
    if (clueAttr) {
        newClue = document.createElement('div');
        newClue.classList.add('clue-input');
        newClue.textContent = clueAttr;
        wrapper.appendChild(newClue);
    }

    const valueDigits = digitsOnly(valueAttr);

    function resolveInitialCountry(): { country: Country; source: "default" | "value" | "fallback" } {
        if (defaultCountry) {
            const c = countries.find(c => c.code.toUpperCase() === defaultCountry.toUpperCase());
            if (c) return { country: c, source: "default" };
        }

        if (valueDigits) {
            const byDial = findCountryByDial(valueDigits, countries);
            if (byDial) return { country: byDial, source: "value" };
        }

        return {
            country: countries.find(c => c.code === 'NONE') || countries.find(c => c.code === 'NA') || countries[0],
            source: "fallback"
        };
    }

    const initial = resolveInitialCountry();

    let currentCountry: Country = initial.country;
    let currentMask = currentCountry.mask;
    let prefixValue = currentCountry.dialCode;
    let maskEnabled = currentMask !== '';

    function renderOptions() {
        options.textContent = '';

        countries.forEach(country => {
            const option = document.createElement('button');
            option.type = 'button';
            option.className = 'country-option';
            option.dataset.code = country.code;
            option.dataset.mask = country.mask;
            option.dataset.dialCode = country.dialCode;

            appendCountryIcon(option, spritePath, country.code);

            const label = document.createElement('span');
            label.textContent = country.name;
            option.appendChild(label);

            option.classList.toggle('selected', country.code === currentCountry.code);
            options.appendChild(option);
        });
    }

    function renderCurrentCountry() {
        current.textContent = '';

        appendCountryIcon(current, spritePath, currentCountry.code);

        const label = document.createElement('span');
        label.textContent = currentCountry.code === 'NONE' ? '' : currentCountry.code;
        current.appendChild(label);
    }

    dropdown.appendChild(current);
    dropdown.appendChild(options);
    wrapper.appendChild(dropdown);

    const input = document.createElement('input');
    input.type = 'tel';
    input.placeholder = currentMask;

    if (nameAttr) input.name = nameAttr;
    if (idAttr) input.id = idAttr;

    if (valueAttr) {
        let digits = valueDigits;

        if (initial.source === "value") {
            const pref = digitsOnly(prefixValue);
            if (pref && digits.startsWith(pref)) {
                digits = digits.slice(pref.length);
            }
        }

        input.value = currentMask
            ? formatDigitsToMask(digits, currentMask)
            : digits;
    } else {
        input.value = maskEnabled ? currentMask : '';
    }

    wrapper.appendChild(input);
    container.appendChild(wrapper);

    let currentMaskLocal = currentMask;
    let prefixLocal = prefixValue;

    function getPrefixEndPosition() {
        if (!currentMaskLocal || !prefixLocal) return 0;

        const firstInputPosition = currentMaskLocal.indexOf("_", digitsOnly(prefixLocal).length);
        if (firstInputPosition !== -1) {
            return firstInputPosition;
        }

        if (currentMaskLocal.startsWith(prefixLocal)) {
            return prefixLocal.length;
        }

        const prefixDigits = digitsOnly(prefixLocal);
        if (!prefixDigits) return 0;

        let digitCount = 0;
        for (let i = 0; i < currentMaskLocal.length; i++) {
            if (/\d/.test(currentMaskLocal[i])) {
                digitCount++;
                if (digitCount === prefixDigits.length) {
                    return i + 1;
                }
            }
        }

        return 0;
    }

    function setCaretPosition(elem: HTMLInputElement, pos: number, focus = true) {
        if (elem.setSelectionRange) {
            if (focus) elem.focus();
            elem.setSelectionRange(pos, pos);
        }
    }

    let lastKey: string | null = null;

    const handleKeydown = (e: KeyboardEvent) => {
        lastKey = e.key;

        const prefixEnd = getPrefixEndPosition();
        if (!prefixEnd) return;

        const selectionStart = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? selectionStart;
        const isPrintableKey = e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;

        if (isPrintableKey && selectionStart < prefixEnd) {
            input.setSelectionRange(prefixEnd, Math.max(prefixEnd, selectionEnd));
            return;
        }

        if (e.key === "Home") {
            e.preventDefault();
            setCaretPosition(input, prefixEnd);
            return;
        }

        if (e.key === "ArrowLeft" && selectionStart <= prefixEnd) {
            e.preventDefault();
            setCaretPosition(input, prefixEnd);
            return;
        }

        if (e.key === "Backspace" && selectionStart <= prefixEnd) {
            e.preventDefault();
            setCaretPosition(input, prefixEnd);
            return;
        }

        if (e.key === "Delete" && selectionStart < prefixEnd) {
            e.preventDefault();
            setCaretPosition(input, prefixEnd);
            return;
        }

        if ((e.key === "Backspace" || e.key === "Delete") && selectionStart < prefixEnd && selectionEnd > selectionStart) {
            e.preventDefault();
            setCaretPosition(input, prefixEnd);
        }
    };

    const handleInput = () => {
        const selectionStart = input.selectionStart || 0;
        let digits = digitsOnly(input.value);

        const prefDigits = digitsOnly(prefixLocal);
        if (prefDigits && digits.startsWith(prefDigits)) {
            digits = digits.slice(prefDigits.length);
        }

        const formatted = currentMaskLocal
            ? formatDigitsToMask(digits, currentMaskLocal)
            : digits;

        input.value = formatted;

        let newPos = selectionStart;

        if (lastKey === "Backspace") {
            while (
                newPos > 0 &&
                formatted[newPos - 1] !== "_" &&
                /\D/.test(formatted[newPos - 1])
                ) {
                newPos--;
            }
        } else {
            while (
                newPos < formatted.length &&
                formatted[newPos] !== "_" &&
                /\D/.test(formatted[newPos])
                ) {
                newPos++;
            }
        }

        setCaretPosition(input, Math.max(newPos, getPrefixEndPosition()));
    };

    const keepCaretAfterPrefix = () => {
        const prefixEnd = getPrefixEndPosition();
        const selectionStart = input.selectionStart ?? 0;
        if (prefixEnd && selectionStart < prefixEnd) {
            setCaretPosition(input, prefixEnd, false);
        }
    };

    const showClue = () => newClue?.classList.add('active');
    const hideClue = () => newClue?.classList.remove('active');

    input.addEventListener("keydown", handleKeydown);
    input.addEventListener("input", handleInput);
    input.addEventListener("click", keepCaretAfterPrefix);
    input.addEventListener("keyup", keepCaretAfterPrefix);
    input.addEventListener("focus", showClue);
    input.addEventListener("blur", hideClue);

    const handleCurrentClick = () => {
        options.classList.toggle('visible');
    };

    const handleOptionsClick = (e: MouseEvent) => {
        const btn = (e.target as HTMLElement).closest('.country-option') as HTMLButtonElement;
        if (!btn) return;

        const code = btn.dataset.code!;
        const mask = btn.dataset.mask!;
        const dialCode = btn.dataset.dialCode!;
        const selectedCountry = countries.find(c => c.code === code);
        if (!selectedCountry) return;

        options.querySelectorAll('.country-option').forEach(opt => opt.classList.remove('selected'));
        btn.classList.add('selected');

        currentCountry = selectedCountry;
        currentMask = mask;
        prefixValue = dialCode;
        maskEnabled = mask !== '';

        currentMaskLocal = currentMask;
        prefixLocal = prefixValue;

        input.placeholder = maskEnabled ? mask : '';
        input.value = maskEnabled ? currentMask : '';

        renderCurrentCountry();
        options.classList.remove('visible');

        const pos = input.value.indexOf("_", digitsOnly(prefixLocal).length);
        setCaretPosition(input, pos === -1 ? input.value.length : pos, true);
    };

    current.addEventListener('click', handleCurrentClick);
    options.addEventListener('click', handleOptionsClick);

    async function detectUserCountry(apiKey?: string) {
        try {
            let url = 'https://ipinfo.io/country';
            if (apiKey) url += `?token=${apiKey}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const userCode = (await res.text()).trim().toUpperCase();
            const matched = countries.find(c => c.code === userCode);
            if (!matched) return;

            currentCountry = matched;
            currentMask = matched.mask;
            prefixValue = matched.dialCode;
            maskEnabled = matched.mask !== '';

            currentMaskLocal = currentMask;
            prefixLocal = prefixValue;

            if (!valueAttr) {
                input.placeholder = currentMask;
                input.value = maskEnabled ? currentMask : '';
            }

            renderCurrentCountry();
            renderOptions();

            const pos = input.value.indexOf("_", digitsOnly(prefixLocal).length);
            setCaretPosition(input, pos === -1 ? input.value.length : pos, false);
        } catch (err) {
            console.error('Geo detection failed:', err);
        }
    }

    renderOptions();
    renderCurrentCountry();

    if (initial.source === "fallback") {
        detectUserCountry(apiKey);
    }

    function addCountries(newCountries: Country[]) {
        const existingCodes = new Set(countries.map(c => c.code));

        newCountries.forEach(nc => {
            if (!existingCodes.has(nc.code)) {
                countries.push(nc);
                existingCodes.add(nc.code);
            }
        });

        renderOptions();
    }

    function destroy() {
        input.removeEventListener("keydown", handleKeydown);
        input.removeEventListener("input", handleInput);
        input.removeEventListener("click", keepCaretAfterPrefix);
        input.removeEventListener("keyup", keepCaretAfterPrefix);
        input.removeEventListener("focus", showClue);
        input.removeEventListener("blur", hideClue);
        current.removeEventListener('click', handleCurrentClick);
        options.removeEventListener('click', handleOptionsClick);
        wrapper.remove();
    }

    return { addCountries, destroy };
}

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

    function getEditableDigits(value: string, sourceText: string) {
        let digits = value;
        const prefixDigits = digitsOnly(prefixValue);
        const maskLength = (currentMask.match(/_/g) || []).length;
        const hasInternationalPrefix = /^\s*\+/.test(sourceText);

        // A plus sign unambiguously denotes an international number. A leading 8 is
        // the Russian/Kazakh national trunk prefix and is only removed for a full number.
        if (
            prefixDigits &&
            digits.startsWith(prefixDigits) &&
            (hasInternationalPrefix || digits.length > maskLength)
        ) {
            digits = digits.slice(prefixDigits.length);
        } else if (
            prefixDigits === '7' &&
            digits.startsWith('8') &&
            digits.length > maskLength
        ) {
            digits = digits.slice(1);
        }

        return digits;
    }

    if (valueAttr) {
        const digits = getEditableDigits(valueDigits, valueAttr);

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

    const handleKeydown = (e: KeyboardEvent) => {
        const prefixEnd = getPrefixEndPosition();
        if (!prefixEnd) return;

        const selectionStart = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? selectionStart;

        // Keep the country code immutable while allowing the user to select and
        // clear the entire entered number with Ctrl/Cmd+A then Delete/Backspace.
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "a") {
            e.preventDefault();
            input.setSelectionRange(prefixEnd, input.value.length);
            return;
        }

        const selectsEntireEditableNumber =
            selectionStart === prefixEnd && selectionEnd === input.value.length;
        if (
            selectsEntireEditableNumber &&
            (e.key === "Backspace" || e.key === "Delete")
        ) {
            e.preventDefault();
            input.value = currentMaskLocal || "";
            setCaretPosition(input, prefixEnd);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            return;
        }

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

    function getCaretPositionAfterEditableDigits(formatted: string, editableDigits: number) {
        const prefixEnd = getPrefixEndPosition();
        if (!currentMaskLocal) {
            return Math.min(editableDigits, formatted.length);
        }

        if (editableDigits === 0) {
            return prefixEnd;
        }

        let filledPositions = 0;
        for (let i = 0; i < currentMaskLocal.length; i++) {
            if (currentMaskLocal[i] !== "_" || !/\d/.test(formatted[i])) continue;

            filledPositions++;
            if (filledPositions !== editableDigits) continue;

            let newPos = i + 1;
            while (newPos < currentMaskLocal.length && currentMaskLocal[newPos] !== "_") {
                newPos++;
            }

            return newPos;
        }

        // If a number is longer than the mask, its extra digits are appended after it.
        return formatted.length;
    }

    const handleInput = () => {
        const selectionStart = input.selectionStart || 0;
        const prefixEnd = getPrefixEndPosition();
        const digitsBeforeCaret = digitsOnly(input.value.slice(0, selectionStart)).length;
        const prefixDigitsBeforeCaret = digitsOnly(
            input.value.slice(0, Math.min(selectionStart, prefixEnd))
        ).length;
        const editableDigitsBeforeCaret = Math.max(0, digitsBeforeCaret - prefixDigitsBeforeCaret);
        let digits = digitsOnly(input.value);

        const prefDigits = digitsOnly(prefixLocal);
        if (prefDigits && digits.startsWith(prefDigits)) {
            digits = digits.slice(prefDigits.length);
        }

        const formatted = currentMaskLocal
            ? formatDigitsToMask(digits, currentMaskLocal)
            : digits;

        input.value = formatted;
        setCaretPosition(input, getCaretPositionAfterEditableDigits(formatted, editableDigitsBeforeCaret));
    };

    const handlePaste = (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text');
        if (pastedText === undefined) return;

        e.preventDefault();

        const pastedDigits = getEditableDigits(digitsOnly(pastedText), pastedText);

        const formatted = currentMaskLocal
            ? formatDigitsToMask(pastedDigits, currentMaskLocal)
            : pastedDigits;

        input.value = formatted;
        setCaretPosition(input, getCaretPositionAfterEditableDigits(formatted, pastedDigits.length));
    };

    const keepCaretAfterPrefix = () => {
        const prefixEnd = getPrefixEndPosition();
        const selectionStart = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? selectionStart;
        if (prefixEnd && selectionStart < prefixEnd && selectionStart === selectionEnd) {
            setCaretPosition(input, prefixEnd, false);
        }
    };

    const showClue = () => newClue?.classList.add('active');
    const hideClue = () => newClue?.classList.remove('active');

    input.addEventListener("keydown", handleKeydown);
    input.addEventListener("input", handleInput);
    input.addEventListener("paste", handlePaste);
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
        input.removeEventListener("paste", handlePaste);
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

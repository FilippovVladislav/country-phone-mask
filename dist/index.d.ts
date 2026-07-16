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
export declare function digitsOnly(s: string): string;
export declare function findCountryByDial(digits: string, countries: Country[]): Country | undefined;
export declare function formatDigitsToMask(digits: string, mask: string): string;
export default function createPhoneInput({ container, countries, spritePath, apiKey, defaultCountry, }: PhoneInputOptions): {
    addCountries: (newCountries: Country[]) => void;
    destroy: () => void;
};

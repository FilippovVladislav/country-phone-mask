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
}
export default function createPhoneInput({ container, countries, spritePath, }: PhoneInputOptions): {
    addCountries: (newCountries: Country[]) => void;
};

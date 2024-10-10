export declare type IDate = number | string | Date;
declare type DateFormats = {
    [p: string]: string;
};
interface TimeLocale {
    weekdays: string[];
    formats: DateFormats;
}
declare function formatDate(date: IDate, locale: TimeLocale): string;
export default formatDate;

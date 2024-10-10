import React from 'react';
declare type ILocales = {
    [k: string]: any;
};
declare type ILocaleContext = {
    locale?: string;
    locales?: ILocales;
};
declare const LocaleContext: React.Context<ILocaleContext>;
declare const LocaleProvider: React.FC<ILocaleContext>;
declare const useLocale: (comp?: string, fallback?: any) => {
    locale: string | undefined;
    trans: (key?: string) => any;
};
export { LocaleProvider, LocaleContext, useLocale };

import Theme from '@swup/theme';
type Options = {
    mainElement: string;
};
export default class SwupFadeTheme extends Theme {
    name: string;
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
}
export {};

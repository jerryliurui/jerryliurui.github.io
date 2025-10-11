import Theme from '@swup/theme';
type Options = {
    mainElement: string;
    reversed: boolean;
};
export default class SwupSlideTheme extends Theme {
    name: string;
    defaults: Options;
    options: Options;
    constructor(options?: Partial<Options>);
    mount(): void;
    unmount(): void;
}
export {};

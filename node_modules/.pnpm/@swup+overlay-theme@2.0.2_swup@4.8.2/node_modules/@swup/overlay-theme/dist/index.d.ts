import Theme from '@swup/theme';
type Direction = 'to-left' | 'to-right' | 'to-top' | 'to-bottom';
type Options = {
    direction: Direction;
    color?: string;
    duration?: number;
};
export default class SwupOverlayTheme extends Theme {
    name: string;
    defaults: Options;
    options: Options;
    directions: Direction[];
    constructor(options?: Partial<Options>);
    mount(): void;
    createOverlay(): string;
}
export {};

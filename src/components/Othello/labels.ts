import type { Translations } from '../../i18n/utils';

// The game's strings: every `othello.*` key of src/i18n/ui.ts, without the
// prefix (e.g. labels['your-turn']). Type-only, so ui.ts isn't bundled.
export type OthelloLabels = Translations<'othello.'>;

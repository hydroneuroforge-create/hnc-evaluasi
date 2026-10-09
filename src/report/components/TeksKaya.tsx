// Rich text: maps generator runs (D11) to nested <Text> with bold/italic preserved.
import { Text } from '@react-pdf/renderer';
import type { Paragraf, Run } from '../../core/index.ts';
import { keRuns } from '../../core/index.ts';
import type { Gaya as Style } from '../theme.ts';

const gayaRun = (r: Run): Style => ({
  ...(r.tebal ? { fontWeight: 700 } : {}),
  ...(r.miring ? { fontStyle: 'italic' } : {}),
});

export interface TeksKayaProps {
  /** Runs, a generated paragraph, or a markup string ('**b**', '_i_'). */
  isi: Run[] | Paragraf | string;
  style?: Style | Style[];
  /** Weight used for bold runs (default 700). */
  tebal?: number;
  orphans?: number;
  widows?: number;
}

export function runsDari(isi: Run[] | Paragraf | string): Run[] {
  if (typeof isi === 'string') return keRuns(isi);
  if (Array.isArray(isi)) return isi;
  return isi.runs;
}

export function TeksKaya({ isi, style, tebal = 700, orphans = 2, widows = 2 }: TeksKayaProps) {
  const runs = runsDari(isi);
  return (
    <Text style={style} orphans={orphans} widows={widows}>
      {runs.map((r, i) => (
        <Text key={i} style={{ ...gayaRun(r), ...(r.tebal ? { fontWeight: tebal } : {}) }}>{r.teks}</Text>
      ))}
    </Text>
  );
}

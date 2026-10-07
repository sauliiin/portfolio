/** A run of source text with an optional syntax class. */
export interface Token {
  readonly text: string;
  readonly kind?: 'kw' | 'str' | 'com' | 'num' | 'fn' | 'op' | 'self';
}

const PYTHON =
  /(?<com>#.*)|(?<str>[fr]?"""[\s\S]*?"""|[fr]?"(?:\\.|[^"\\])*"|[fr]?'(?:\\.|[^'\\])*')|(?<kw>\b(?:def|class|return|for|in|if|elif|else|not|and|or|is|None|True|False|continue|break|import|from|as|with|lambda|while|yield|try|except|raise)\b)|(?<self>\b(?:self|np|sp)\b)|(?<num>\b\d[\d_]*(?:\.\d+)?(?:e-?\d+)?\b)|(?<fn>\b[A-Za-z_]\w*(?=\())|(?<op>\*\*|[-+*/@%=<>!]=?)/g;

/**
 * Tiny regex-based Python highlighter — enough for short, curated snippets,
 * and it keeps the bundle free of a 100 kB syntax-highlighting library.
 * Returns one token list per source line so lines can be numbered in CSS.
 */
export function highlightPython(source: string): Token[][] {
  return source.split('\n').map((line) => {
    const tokens: Token[] = [];
    let last = 0;
    for (const match of line.matchAll(PYTHON)) {
      const index = match.index ?? 0;
      if (index > last) tokens.push({ text: line.slice(last, index) });
      const kind = Object.entries(match.groups ?? {}).find(([, v]) => v !== undefined)?.[0] as Token['kind'];
      tokens.push({ text: match[0], kind });
      last = index + match[0].length;
    }
    if (last < line.length) tokens.push({ text: line.slice(last) });
    return tokens;
  });
}

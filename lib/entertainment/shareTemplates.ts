export const SHARE_TEMPLATES: Record<string, string> = {
  diagnosis: 'わたしは「{{result_title}}」タイプでした！\n{{quiz_title}}\n#エンタメ診断',
  fortune: '{{quiz_title}}の結果は「{{result_title}}」！\n#占い #エンタメ診断',
};

export function buildShareText(
  template: string,
  resultTitle: string,
  quizTitle: string,
): string {
  return template
    .replace(/\{\{result_title\}\}/g, resultTitle)
    .replace(/\{\{quiz_title\}\}/g, quizTitle);
}

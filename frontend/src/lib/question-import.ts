import * as XLSX from 'xlsx';

export type ImportedQuestionType = 'MCQ' | 'THEORY' | 'CODING';
export type ImportedQuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ImportedQuestion = {
  type: ImportedQuestionType;
  prompt: string;
  explanation?: string;
  marks: number;
  difficulty: ImportedQuestionDifficulty;
  language?: string;
  correctAnswerText?: string;
  options: Array<{
    label: string;
    value: string;
    isCorrect: boolean;
  }>;
};

export type QuestionImportResult = {
  fileName: string;
  formatLabel: 'CSV' | 'JSON' | 'Spreadsheet' | 'PDF';
  questions: ImportedQuestion[];
  issues: string[];
};

type RowRecord = Record<string, unknown>;

function normalizeKey(value: string) {
  return value.toLowerCase().trim().replace(/[\s-]+/g, '_');
}

function normalizeType(value: unknown): ImportedQuestionType {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (normalized.includes('code')) return 'CODING';
  if (normalized.includes('theory') || normalized.includes('essay') || normalized.includes('long')) return 'THEORY';
  return 'MCQ';
}

function normalizeDifficulty(value: unknown): ImportedQuestionDifficulty {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (normalized.startsWith('adv')) return 'Advanced';
  if (normalized.startsWith('beg')) return 'Beginner';
  return 'Intermediate';
}

function normalizeMarks(value: unknown) {
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric;
  }

  return 5;
}

function getValue(row: RowRecord, ...keys: string[]) {
  const entries = Object.entries(row).map(([key, value]) => [normalizeKey(key), value] as const);
  const map = new Map(entries);

  for (const key of keys) {
    if (map.has(normalizeKey(key))) {
      return map.get(normalizeKey(key));
    }
  }

  return undefined;
}

function parseBoolean(value: unknown) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  return ['true', 'yes', '1', 'correct'].includes(normalized);
}

function buildMcqOptionsFromRow(row: RowRecord, answerValue: string) {
  const letterKeys = ['a', 'b', 'c', 'd', 'e', 'f'];
  const options = letterKeys
    .map((letter, index) => {
      const value =
        getValue(row, `option_${letter}`, `option${letter}`, `choice_${letter}`, `choice${letter}`) ??
        undefined;

      if (!value || !String(value).trim()) {
        return null;
      }

      const optionLabel = `Option ${String.fromCharCode(65 + index)}`;
      const textValue = String(value).trim();

      return {
        label: optionLabel,
        value: textValue,
        isCorrect:
          answerValue.toLowerCase() === letter ||
          answerValue.toLowerCase() === optionLabel.toLowerCase() ||
          answerValue.toLowerCase() === textValue.toLowerCase(),
      };
    })
    .filter(Boolean) as ImportedQuestion['options'];

  if (options.length > 0) {
    return options;
  }

  const combined = String(getValue(row, 'options') ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

  return combined.map((value, index) => ({
    label: `Option ${String.fromCharCode(65 + index)}`,
    value,
    isCorrect: answerValue.toLowerCase() === value.toLowerCase(),
  }));
}

function mapRowToQuestion(row: RowRecord, rowIndex: number, issues: string[]): ImportedQuestion | null {
  const prompt = String(getValue(row, 'prompt', 'question', 'question_text', 'title') ?? '').trim();
  if (!prompt) {
    issues.push(`Row ${rowIndex + 1}: missing prompt/question text and was skipped.`);
    return null;
  }

  const type = normalizeType(getValue(row, 'type', 'question_type', 'format'));
  const answerValue = String(
    getValue(row, 'correct_answer', 'answer', 'model_answer', 'ideal_answer') ?? '',
  ).trim();

  const question: ImportedQuestion = {
    type,
    prompt,
    explanation: String(getValue(row, 'explanation', 'feedback', 'note') ?? '').trim() || undefined,
    marks: normalizeMarks(getValue(row, 'marks', 'score', 'weight')),
    difficulty: normalizeDifficulty(getValue(row, 'difficulty', 'level')),
    language: String(getValue(row, 'language', 'coding_language') ?? '').trim() || undefined,
    correctAnswerText: answerValue || undefined,
    options: [],
  };

  if (type === 'MCQ') {
    const options = buildMcqOptionsFromRow(row, answerValue);
    if (options.length < 2) {
      issues.push(`Row ${rowIndex + 1}: MCQ needs at least two options and was skipped.`);
      return null;
    }

    if (!options.some((option) => option.isCorrect) && answerValue) {
      const firstOption = options.find((option) => option.value.toLowerCase() === answerValue.toLowerCase());
      if (firstOption) {
        firstOption.isCorrect = true;
      }
    }

    if (!options.some((option) => option.isCorrect)) {
      options[0].isCorrect = true;
      issues.push(`Row ${rowIndex + 1}: no correct MCQ answer matched, so the first option was marked correct.`);
    }

    question.options = options;
  }

  if (type !== 'MCQ' && !question.correctAnswerText) {
    question.correctAnswerText = String(getValue(row, 'rubric', 'expected_response') ?? '').trim() || undefined;
  }

  return question;
}

function mapJsonItemToRow(item: unknown): RowRecord {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) {
    return {};
  }

  return item as RowRecord;
}

async function parseSpreadsheet(file: File, issues: string[]) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RowRecord>(worksheet, { defval: '' });

  return rows
    .map((row, index) => mapRowToQuestion(row, index, issues))
    .filter(Boolean) as ImportedQuestion[];
}

async function parseJson(file: File, issues: string[]) {
  const raw = JSON.parse(await file.text()) as unknown;
  const items = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && raw !== null && Array.isArray((raw as { questions?: unknown[] }).questions)
      ? (raw as { questions: unknown[] }).questions
      : [];

  if (!items.length) {
    issues.push('No importable questions array was found in the JSON file.');
  }

  return items
    .map((item, index) => mapRowToQuestion(mapJsonItemToRow(item), index, issues))
    .filter(Boolean) as ImportedQuestion[];
}

function buildPdfQuestion(lines: string[], blockIndex: number, issues: string[]) {
  const trimmedLines = lines.map((line) => line.trim()).filter(Boolean);
  if (!trimmedLines.length) {
    return null;
  }

  const metadata = new Map<string, string>();
  const promptLines: string[] = [];
  const options: ImportedQuestion['options'] = [];

  for (const line of trimmedLines) {
    const metaMatch = line.match(/^(type|difficulty|marks|answer|correct answer|explanation|language)\s*[:\-]\s*(.+)$/i);
    if (metaMatch) {
      metadata.set(normalizeKey(metaMatch[1]), metaMatch[2].trim());
      continue;
    }

    const optionMatch = line.match(/^([A-F])[\).:\-]\s*(.+)$/i);
    if (optionMatch) {
      options.push({
        label: `Option ${optionMatch[1].toUpperCase()}`,
        value: optionMatch[2].trim(),
        isCorrect: false,
      });
      continue;
    }

    promptLines.push(line.replace(/^question\s*\d+[\).:\-]?\s*/i, ''));
  }

  const prompt = promptLines.join(' ').trim();
  if (!prompt) {
    issues.push(`PDF block ${blockIndex + 1}: missing prompt/question text and was skipped.`);
    return null;
  }

  const answerValue = metadata.get('answer') ?? metadata.get('correct_answer') ?? '';
  if (options.length) {
    const answerKey = answerValue.toLowerCase();
    const matchedOption = options.find((option) => {
      const suffix = option.label.split(' ').at(-1)?.toLowerCase();
      return (
        suffix === answerKey ||
        option.value.toLowerCase() === answerKey ||
        option.label.toLowerCase() === answerKey
      );
    });

    if (matchedOption) {
      matchedOption.isCorrect = true;
    } else {
      options[0].isCorrect = true;
      if (answerValue) {
        issues.push(`PDF block ${blockIndex + 1}: answer key did not match any option, so the first option was marked correct.`);
      }
    }
  }

  return {
    type: normalizeType(metadata.get('type')),
    prompt,
    explanation: metadata.get('explanation') || undefined,
    marks: normalizeMarks(metadata.get('marks')),
    difficulty: normalizeDifficulty(metadata.get('difficulty')),
    language: metadata.get('language') || undefined,
    correctAnswerText: answerValue || undefined,
    options,
  } satisfies ImportedQuestion;
}

async function parsePdf(file: File, issues: string[]) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const pdfDocument = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pageTexts: string[] = [];

  for (let index = 1; index <= pdfDocument.numPages; index += 1) {
    const page = await pdfDocument.getPage(index);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pageTexts.push(text);
  }

  const blocks = pageTexts
    .join('\n\n')
    .split(/(?:Question\s+\d+[\).:\-]?\s*)/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsedBlocks = (blocks.length ? blocks : pageTexts)
    .map((block) => block.split(/\n+/))
    .map((blockLines, index) => buildPdfQuestion(blockLines, index, issues))
    .filter(Boolean) as ImportedQuestion[];

  if (!parsedBlocks.length) {
    issues.push('The PDF could not be confidently parsed. Use CSV, JSON, or spreadsheet format for the most reliable import.');
  }

  return parsedBlocks;
}

export async function importQuestionsFromFile(file: File): Promise<QuestionImportResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const issues: string[] = [];

  let questions: ImportedQuestion[] = [];
  let formatLabel: QuestionImportResult['formatLabel'];

  if (extension === 'json') {
    formatLabel = 'JSON';
    questions = await parseJson(file, issues);
  } else if (extension === 'csv') {
    formatLabel = 'CSV';
    questions = await parseSpreadsheet(file, issues);
  } else if (extension === 'xlsx' || extension === 'xls') {
    formatLabel = 'Spreadsheet';
    questions = await parseSpreadsheet(file, issues);
  } else if (extension === 'pdf') {
    formatLabel = 'PDF';
    questions = await parsePdf(file, issues);
  } else {
    throw new Error('Unsupported file format. Upload a PDF, CSV, spreadsheet, or JSON file.');
  }

  if (!questions.length) {
    throw new Error(issues[0] ?? 'No valid questions were found in the uploaded file.');
  }

  return {
    fileName: file.name,
    formatLabel,
    questions,
    issues,
  };
}

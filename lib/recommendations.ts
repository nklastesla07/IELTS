export interface RecommendationTask {
  id: string;
  category: string;
  title: string;
  description: string;
  suggestedAction: string;
  tagCodes: string[];
}

export const ACTION_RECOMMENDATION_MATRIX: RecommendationTask[] = [
  {
    id: 'REC_AUDIO_SPEED',
    category: 'Listening — Âm thanh & Tốc độ',
    title: 'Luyện nghe phản xạ & Chép chính tả (Dictation)',
    description: 'Phát hiện lỗi do không kịp tốc độ, bị nuốt âm, nối âm hoặc trọng âm.',
    suggestedAction: '1. Bật audio tốc độ 0.8x nghe lại đoạn sai.\n2. Thực hiện bài tập Dictation (nghe chép chính tả) đúng 100% đoạn 15–30s chứa đáp án.',
    tagCodes: ['LIS_PRON_LINKING', 'LIS_PRON_ELISION', 'LIS_PRON_STRESS', 'LIS_FOCUS_SPEED'],
  },
  {
    id: 'REC_TRAPS_PSYCHOLOGY',
    category: 'Listening — Bẫy & Tâm lý',
    title: 'Gạch chân Signal Words & Luyện buông bỏ câu đã lỡ',
    description: 'Phát hiện lỗi do người nói đổi ý, đính chính thông tin hoặc mải suy nghĩ câu trước.',
    suggestedAction: '1. Liệt kê lại các từ nối bẫy (However, Actually, Wait, Sorry...).\n2. Tập thói quen dứt khoát chuyển sang câu tiếp theo ngay khi lỡ 1 câu để bảo vệ chuỗi làm bài.',
    tagCodes: ['LIS_TRAP_CHANGED_MIND', 'LIS_TRAP_CORRECTION', 'LIS_TRAP_MULTIPLE_MENTIONS', 'LIS_FOCUS_STUCK'],
  },
  {
    id: 'REC_VOCAB_PARAPHRASE',
    category: 'Từ vựng & Paraphrase (Listening & Reading)',
    title: 'Lập Keyword Table & Lưu Flashcard',
    description: 'Phát hiện lỗi thiếu từ vựng, không nhận ra từ đồng nghĩa (synonyms) hoặc collocation.',
    suggestedAction: '1. Tạo bảng Keyword Table (Từ trong câu hỏi ↔ Từ đồng nghĩa tương ứng trong bài nghe/đọc).\n2. Lưu các từ mới vào bộ Flashcard cá nhân để ôn tập hàng ngày.',
    tagCodes: [
      'LIS_VOCAB_UNKNOWN',
      'LIS_VOCAB_MEANING',
      'LIS_PARA_SYNONYM',
      'LIS_PARA_REPHRASE',
      'READ_VOCAB_UNKNOWN',
      'READ_PARA_NOT_FOUND',
      'READ_COLLOCATION_MISUNDERSTOOD',
      'READ_PRONOUN_MISUNDERSTOOD',
    ],
  },
  {
    id: 'REC_LOGIC_READING',
    category: 'Reading — Logic & Overthinking',
    title: 'Xác định Proof Statement & Loại bỏ kiến thức cá nhân',
    description: 'Phát hiện lỗi suy luận quá đà (overthinking), bỏ qua từ phủ định hoặc đọc quá nhanh.',
    suggestedAction: '1. Đọc lại kỹ nguyên văn câu chứa đáp án.\n2. Gạch chân chính xác Proof Statement trong bài đọc — chỉ chọn đáp án khi có minh chứng 100% trong bài.',
    tagCodes: [
      'READ_LOGIC_OVERTHINKING',
      'READ_LOGIC_MISSED_NEGATION',
      'READ_STRAT_TOO_FAST',
      'READ_LOGIC_INCOMPLETE_SENTENCE',
      'READ_LOGIC_MISSED_DETAIL',
    ],
  },
  {
    id: 'REC_SPELLING_PREPARATION',
    category: 'Chính tả & Đọc đề',
    title: 'Luyện cơ tay chính tả & Gạch chân Keyword',
    description: 'Phát hiện lỗi bất cẩn: sai số ít/số nhiều, sai chính tả hoặc không phân tích loại từ.',
    suggestedAction: '1. Cảnh báo lỗi bất cẩn.\n2. Gõ lại từ đúng chính tả 3 lần để khắc sâu vào bộ nhớ cơ tay (typing memory).',
    tagCodes: ['LIS_PRE_WRONG_POS', 'LIS_PLURAL_ERROR', 'LIS_SPELL_ERROR', 'LIS_WORD_FORM', 'LIS_GRAMMAR_ERROR'],
  },
];

/**
 * Generates today's checklist based on a list of ticked error tag codes.
 */
export function generateRecommendations(tickedTagCodes: string[]): RecommendationTask[] {
  if (!tickedTagCodes || tickedTagCodes.length === 0) return [];

  const matched = ACTION_RECOMMENDATION_MATRIX.filter((rec) =>
    rec.tagCodes.some((code) => tickedTagCodes.includes(code))
  );

  return matched;
}

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const Skill = {
  LISTENING: 'LISTENING',
  READING: 'READING',
} as const;

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Seed Default Admin
  const adminEmail = 'vanhpham8117@gmail.com';
  const plainPassword = process.env.ADMIN_SEED_PASSWORD || 'Nikolatesla2007#';
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: 'Vanh Pham (Admin)',
      passwordHash,
    },
  });
  console.log(`✅ Admin seeded: ${adminEmail}`);

  // 2. Seed Default Demo Student for testing
  const demoStudentEmail = 'student@example.com';
  const demoInviteCode = 'IELTS999';
  await prisma.student.upsert({
    where: { email: demoStudentEmail },
    update: { inviteCode: demoInviteCode },
    create: {
      email: demoStudentEmail,
      fullName: 'Học sinh Demo',
      inviteCode: demoInviteCode,
      currentStreak: 5,
      longestStreak: 7,
      lastActiveDate: new Date(),
    },
  });
  console.log(`✅ Demo Student seeded: ${demoStudentEmail} | Code: ${demoInviteCode}`);

  // 3. Seed Band Conversion Table (Section 6.3)
  const bandMappings = [
    { min: 39, max: 40, band: 9.0 },
    { min: 37, max: 38, band: 8.5 },
    { min: 35, max: 36, band: 8.0 },
    { min: 32, max: 34, band: 7.5 },
    { min: 30, max: 31, band: 7.0 },
    { min: 26, max: 29, band: 6.5 },
    { min: 23, max: 25, band: 6.0 },
    { min: 18, max: 22, band: 5.5 },
    { min: 16, max: 17, band: 5.0 },
    { min: 13, max: 15, band: 4.5 },
    { min: 10, max: 12, band: 4.0 },
    { min: 0, max: 9, band: 3.5 },
  ];

  for (const skill of [Skill.LISTENING, Skill.READING]) {
    for (const b of bandMappings) {
      const existing = await prisma.bandConversionTable.findFirst({
        where: { skill, rawScoreMin: b.min, rawScoreMax: b.max },
      });
      if (!existing) {
        await prisma.bandConversionTable.create({
          data: {
            skill,
            rawScoreMin: b.min,
            rawScoreMax: b.max,
            band: b.band,
          },
        });
      }
    }
  }
  console.log('✅ Band conversion table seeded.');

  // 4. Seed Error Taxonomy Tags (Section 7)
  const errorTagsData = [
    // --- LISTENING ---
    { skill: Skill.LISTENING, groupName: 'Đọc đề trước', label: 'Không đọc trước câu hỏi', code: 'LIS_PRE_NO_READ' },
    { skill: Skill.LISTENING, groupName: 'Đọc đề trước', label: 'Không gạch chân keyword', code: 'LIS_PRE_NO_KEYWORD' },
    { skill: Skill.LISTENING, groupName: 'Đọc đề trước', label: 'Đoán sai loại từ cần điền', code: 'LIS_PRE_WRONG_POS' },

    { skill: Skill.LISTENING, groupName: 'Chính tả / Ngữ pháp', label: 'Sai chính tả', code: 'LIS_SPELL_ERROR' },
    { skill: Skill.LISTENING, groupName: 'Chính tả / Ngữ pháp', label: 'Sai số ít/số nhiều', code: 'LIS_PLURAL_ERROR' },
    { skill: Skill.LISTENING, groupName: 'Chính tả / Ngữ pháp', label: 'Sai dạng từ', code: 'LIS_WORD_FORM' },
    { skill: Skill.LISTENING, groupName: 'Chính tả / Ngữ pháp', label: 'Sai ngữ pháp', code: 'LIS_GRAMMAR_ERROR' },

    { skill: Skill.LISTENING, groupName: 'Từ vựng', label: 'Không biết từ', code: 'LIS_VOCAB_UNKNOWN' },
    { skill: Skill.LISTENING, groupName: 'Từ vựng', label: 'Không hiểu nghĩa', code: 'LIS_VOCAB_MEANING' },

    { skill: Skill.LISTENING, groupName: 'Phát âm', label: 'Không nhận ra từ khi nghe', code: 'LIS_PRON_UNRECOGNIZED' },
    { skill: Skill.LISTENING, groupName: 'Phát âm', label: 'Không nghe được vì nối âm', code: 'LIS_PRON_LINKING' },
    { skill: Skill.LISTENING, groupName: 'Phát âm', label: 'Không nghe được vì nuốt âm', code: 'LIS_PRON_ELISION' },
    { skill: Skill.LISTENING, groupName: 'Phát âm', label: 'Không nhận ra trọng âm', code: 'LIS_PRON_STRESS' },
    { skill: Skill.LISTENING, groupName: 'Phát âm', label: 'Không quen phát âm này', code: 'LIS_PRON_ACCENT' },

    { skill: Skill.LISTENING, groupName: 'Paraphrase', label: 'Không nhận ra từ đồng nghĩa', code: 'LIS_PARA_SYNONYM' },
    { skill: Skill.LISTENING, groupName: 'Paraphrase', label: 'Không nhận ra cách diễn đạt khác', code: 'LIS_PARA_REPHRASE' },

    { skill: Skill.LISTENING, groupName: 'Mất tập trung / Không theo kịp', label: 'Bỏ lỡ thông tin', code: 'LIS_FOCUS_MISSED' },
    { skill: Skill.LISTENING, groupName: 'Mất tập trung / Không theo kịp', label: 'Không theo kịp tốc độ', code: 'LIS_FOCUS_SPEED' },
    { skill: Skill.LISTENING, groupName: 'Mất tập trung / Không theo kịp', label: 'Mải nghĩ câu trước', code: 'LIS_FOCUS_STUCK' },

    { skill: Skill.LISTENING, groupName: 'Bẫy', label: 'Người nói đổi ý', code: 'LIS_TRAP_CHANGED_MIND' },
    { skill: Skill.LISTENING, groupName: 'Bẫy', label: 'Người nói sửa thông tin', code: 'LIS_TRAP_CORRECTION' },
    { skill: Skill.LISTENING, groupName: 'Bẫy', label: 'Người nói nhắc đến nhiều đáp án', code: 'LIS_TRAP_MULTIPLE_MENTIONS' },

    // --- READING ---
    { skill: Skill.READING, groupName: 'Từ vựng & Ngôn ngữ', label: 'Không biết từ', code: 'READ_VOCAB_UNKNOWN' },
    { skill: Skill.READING, groupName: 'Từ vựng & Ngôn ngữ', label: 'Không nhận ra paraphrase', code: 'READ_PARA_NOT_FOUND' },
    { skill: Skill.READING, groupName: 'Từ vựng & Ngôn ngữ', label: 'Hiểu sai collocation', code: 'READ_COLLOCATION_MISUNDERSTOOD' },
    { skill: Skill.READING, groupName: 'Từ vựng & Ngôn ngữ', label: 'Hiểu sai đại từ', code: 'READ_PRONOUN_MISUNDERSTOOD' },

    { skill: Skill.READING, groupName: 'Đọc hiểu & Logic', label: 'Đọc sót thông tin', code: 'READ_LOGIC_MISSED_DETAIL' },
    { skill: Skill.READING, groupName: 'Đọc hiểu & Logic', label: 'Tự suy luận (overthinking)', code: 'READ_LOGIC_OVERTHINKING' },
    { skill: Skill.READING, groupName: 'Đọc hiểu & Logic', label: 'Không đọc hết câu', code: 'READ_LOGIC_INCOMPLETE_SENTENCE' },
    { skill: Skill.READING, groupName: 'Đọc hiểu & Logic', label: 'Bỏ qua từ phủ định', code: 'READ_LOGIC_MISSED_NEGATION' },

    { skill: Skill.READING, groupName: 'Chiến thuật & Scan', label: 'Scan sai đoạn', code: 'READ_STRAT_WRONG_PARAGRAPH' },
    { skill: Skill.READING, groupName: 'Chiến thuật & Scan', label: 'Chọn keyword sai', code: 'READ_STRAT_WRONG_KEYWORD' },
    { skill: Skill.READING, groupName: 'Chiến thuật & Scan', label: 'Không đọc câu trước/sau', code: 'READ_STRAT_NO_CONTEXT' },
    { skill: Skill.READING, groupName: 'Chiến thuật & Scan', label: 'Đọc quá nhanh', code: 'READ_STRAT_TOO_FAST' },

    { skill: Skill.READING, groupName: 'Thời gian & Tâm lý', label: 'Quá lâu', code: 'READ_TIME_SLOW' },
    { skill: Skill.READING, groupName: 'Thời gian & Tâm lý', label: 'Đổi đáp án đúng', code: 'READ_TIME_SECOND_GUESS' },
    { skill: Skill.READING, groupName: 'Thời gian & Tâm lý', label: 'Không kịp làm', code: 'READ_TIME_OUT' },
  ];

  for (const tag of errorTagsData) {
    await prisma.errorTag.upsert({
      where: { code: tag.code },
      update: { groupName: tag.groupName, label: tag.label, skill: tag.skill },
      create: tag,
    });
  }

  console.log('✅ Error taxonomy tags seeded successfully.');
  console.log('🎉 Seed process finished cleanly!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        loginType: { label: 'Login Type', type: 'text' }, // "ADMIN" or "STUDENT"
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        inviteCode: { label: 'Invite Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Vui lòng nhập Email');
        }

        const email = credentials.email.trim().toLowerCase();
        const loginType = credentials.loginType || 'STUDENT';

        if (loginType === 'ADMIN') {
          if (!credentials.password) {
            throw new Error('Vui lòng nhập Mật khẩu Admin');
          }

          const admin = await prisma.admin.findUnique({
            where: { email },
          });

          if (!admin) {
            throw new Error('Tài khoản Admin không tồn tại');
          }

          const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
          if (!isValid) {
            throw new Error('Mật khẩu Admin không chính xác');
          }

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name || 'Admin',
            role: 'ADMIN',
          };
        } else {
          // STUDENT login
          if (!credentials.inviteCode) {
            throw new Error('Vui lòng nhập Mã mời (Invite Code)');
          }

          const inviteCode = credentials.inviteCode.trim().toUpperCase();

          const student = await prisma.student.findUnique({
            where: { email },
          });

          if (!student) {
            throw new Error('Email học sinh chưa được đăng ký trong hệ thống');
          }

          if (!student.isActive) {
            throw new Error('Tài khoản học sinh này đã bị vô hiệu hóa');
          }

          if (student.inviteCode !== inviteCode) {
            throw new Error('Mã mời không đúng hoặc đã bị thay đổi bởi Admin');
          }

          return {
            id: student.id,
            email: student.email,
            name: student.fullName,
            role: 'STUDENT',
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'ielts-tracker-default-secret-key-2026',
};

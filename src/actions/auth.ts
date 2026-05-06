'use server';

import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { SignupFormSchema, LoginFormSchema } from '@/lib/definitions';
import { createSession, deleteSession } from '@/lib/session';

export type FormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

function isUniqueEmailError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

export async function signup(state: FormState | undefined, formData: FormData): Promise<FormState | undefined> {
  // 1. Validate form fields
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Vui lòng kiểm tra các lỗi trước khi tiếp tục.',
    };
  }

  const { name, email, password } = validatedFields.data;

  // 2. Prepare data for insertion into database
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // 3. Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        role: true,
      }
    });

    // 4. Create session
    await createSession(user.id, user.role);
    
  } catch (error) {
    // Handle unique constraint violation for email
    if (isUniqueEmailError(error)) {
      return {
        message: 'Email này đã được đăng ký.',
      };
    }
    return {
      message: 'Không thể tạo tài khoản. Vui lòng thử lại.',
    };
  }
  
  redirect('/dashboard'); // Or another protected route
}

export async function login(state: FormState | undefined, formData: FormData): Promise<FormState | undefined> {
  // 1. Validate form fields
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Vui lòng kiểm tra thông tin đăng nhập.',
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Fetch user from database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: 'Email hoặc mật khẩu không đúng.',
    };
  }

  // 3. Verify password
  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return {
      message: 'Email hoặc mật khẩu không đúng.',
    };
  }

  // 4. Create session
  await createSession(user.id, user.role);

  redirect('/dashboard'); // Or another protected route
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

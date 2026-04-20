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
      message: 'Please resolve errors to continue.',
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
    
  } catch (error: any) {
    // Handle unique constraint violation for email
    if (error.code === 'P2002') {
      return {
        message: 'Account with this email already exists.',
      };
    }
    return {
      message: 'Failed to create user. Please try again.',
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
      message: 'Missing or invalid fields.',
    };
  }

  const { email, password } = validatedFields.data;

  // 2. Fetch user from database
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      message: 'Invalid credentials.',
    };
  }

  // 3. Verify password
  const passwordsMatch = await bcrypt.compare(password, user.password);

  if (!passwordsMatch) {
    return {
      message: 'Invalid credentials.',
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

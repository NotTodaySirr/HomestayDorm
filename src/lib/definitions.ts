import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Họ và tên phải có ít nhất 2 ký tự.' })
    .trim(),
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
    .regex(/[a-zA-Z]/, { message: 'Mật khẩu phải chứa ít nhất một chữ cái.' })
    .regex(/[0-9]/, { message: 'Mật khẩu phải chứa ít nhất một chữ số.' })
    .trim(),
});

export const LoginFormSchema = z.object({
  email: z.string().email({ message: 'Vui lòng nhập địa chỉ email hợp lệ.' }).trim(),
  password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu.' }),
});

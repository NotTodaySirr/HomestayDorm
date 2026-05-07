"use client";

import {
  AuthField,
  AuthFormAlert,
  AuthPanel,
  AuthSubmitButton,
} from "@/components/auth/AuthForm";
import { signup } from "@/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signup, undefined);

  return (
    <AuthPanel
      title="Tạo tài khoản"
      titleId="signup-title"
      description="Nhập thông tin để bắt đầu"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          >
            Đăng nhập
          </Link>
        </>
      }
    >
      <form action={action} className="space-y-4">
        <AuthField
          id="name"
          name="name"
          type="text"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          errors={state?.errors?.name}
        />

        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="ten@example.com"
          autoComplete="email"
          errors={state?.errors?.email}
        />

        <AuthField
          id="password"
          name="password"
          type="password"
          label="Mật khẩu"
          placeholder="Tối thiểu 8 ký tự"
          autoComplete="new-password"
          errors={state?.errors?.password}
        />

        {!state?.errors ? <AuthFormAlert message={state?.message} /> : null}

        <AuthSubmitButton
          isPending={isPending}
          label="Tạo tài khoản"
          pendingLabel="Đang tạo tài khoản..."
        />
      </form>
    </AuthPanel>
  );
}

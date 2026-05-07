"use client";

import {
  AuthField,
  AuthFormAlert,
  AuthPanel,
  AuthSubmitButton,
} from "@/components/auth/AuthForm";
import { login } from "@/actions/auth";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(login, undefined);

  return (
    <AuthPanel
      title="Đăng nhập"
      titleId="login-title"
      description="Đăng nhập vào tài khoản để tiếp tục"
      footer={
        <span>
          Quên mật khẩu?{" "}
          <span className="font-semibold text-[var(--color-primary)]">
            Lấy lại mật khẩu
          </span>
        </span>
      }
    >
      <form action={action} className="space-y-4">
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
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          errors={state?.errors?.password}
        />

        {!state?.errors ? <AuthFormAlert message={state?.message} /> : null}

        <AuthSubmitButton
          isPending={isPending}
          label="Đăng nhập"
          pendingLabel="Đang đăng nhập..."
        />
      </form>
    </AuthPanel>
  );
}

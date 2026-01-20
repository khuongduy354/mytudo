import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useAuth } from "../hooks/useAuth";

type AuthMode = "login" | "register" | "magic-link";

const TEST_USERS = [
  { email: "minhanh@test.com", password: "Test@123", name: "Minh Anh" },
  { email: "thuha@test.com", password: "Test@123", name: "Thu Hà" },
  { email: "lanphuong@test.com", password: "Test@123", name: "Lan Phương" },
];

const isDev = import.meta.env.DEV;

export function LoginPage() {
  const navigate = useNavigate();
  const {
    loginWithEmail,
    registerWithEmail,
    sendMagicLink,
    isLoginWithEmailPending,
    isRegisterWithEmailPending,
    isSendMagicLinkPending,
    isAuthenticated,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await loginWithEmail({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Đăng nhập thất bại");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await registerWithEmail({
        email,
        password,
        fullName: fullName || undefined,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Đăng ký thất bại");
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await sendMagicLink({ email });
      setMagicLinkSent(true);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || "Không thể gửi magic link",
      );
    }
  };

  const handleTestUserSelect = (testUser: (typeof TEST_USERS)[0]) => {
    setEmail(testUser.email);
    setPassword(testUser.password);
    setMode("login");
  };

  const isPending =
    isLoginWithEmailPending ||
    isRegisterWithEmailPending ||
    isSendMagicLinkPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-linear-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and brand */}
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-2xl mb-4 shadow-lg shadow-primary/50 hover:scale-110 transition-transform duration-300">
            <span className="text-2xl sm:text-3xl font-bold text-primary-foreground">
              MT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
            MYTuDo
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tủ đồ số & Chợ thời trang bền vững
          </p>
        </div>

        {/* Main card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-primary/20 animate-scale-in">
          {isDev && mode === "login" && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl animate-fade-in">
              <label className="block text-sm font-semibold text-primary mb-2">
                Test Users (Dev Only):
              </label>
              <select
                onChange={(e) => {
                  const user = TEST_USERS[parseInt(e.target.value)];
                  if (user) handleTestUserSelect(user);
                }}
                defaultValue=""
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="" disabled>
                  Select test user...
                </option>
                {TEST_USERS.map((user, idx) => (
                  <option key={user.email} value={idx}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "login" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Đăng nhập
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50"
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50"
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm animate-shake">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  Đăng nhập
                </Button>

                <div className="flex flex-col gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Chưa có tài khoản? Đăng ký
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("magic-link")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Đăng nhập không mật khẩu
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === "register" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Đăng ký
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50"
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50"
                />
                <Input
                  type="text"
                  placeholder="Họ và tên (tùy chọn)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="transition-all hover:border-primary/50"
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm animate-shake">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                >
                  Đăng ký
                </Button>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                  >
                    Đã có tài khoản? Đăng nhập
                  </button>
                </div>
              </form>
            </div>
          )}

          {mode === "magic-link" && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Magic Link
              </h2>
              {magicLinkSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Link đã được gửi đến {email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng kiểm tra email và click vào link để đăng nhập
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setMagicLinkSent(false);
                      setMode("login");
                    }}
                    className="w-full"
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Nhập email để nhận link đăng nhập không cần mật khẩu
                  </p>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all hover:border-primary/50"
                  />

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm animate-shake">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isPending}
                    className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    Gửi Magic Link
                  </Button>

                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                      Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground animate-fade-in delay-300">
          <p>© 2026 MYTuDo. Thời trang bền vững</p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-4px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(4px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .delay-300 {
          animation-delay: 300ms;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

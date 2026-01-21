import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useAuth } from "../hooks/useAuth";
import logoImage from "../../../../mytudo-logo-removebg-preview.png";

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-gradient-to-br from-[#F5F9F8] via-[#E8F5F3] to-[#D4EDE8]">
      {/* Organic background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(77, 208, 200, 0.15) 0%, transparent 50%),
                           radial-gradient(circle at 80% 70%, rgba(77, 208, 200, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 40% 80%, rgba(95, 227, 219, 0.12) 0%, transparent 50%)`
        }} />
      </div>

      {/* Floating leaf decorations */}
      <div className="absolute top-20 left-10 text-6xl opacity-20 animate-float">🌿</div>
      <div className="absolute bottom-20 right-10 text-5xl opacity-20 animate-float-delayed">🍃</div>
      <div className="absolute top-1/2 right-20 text-4xl opacity-15 animate-float-slow">♻️</div>

      <div className="w-full max-w-md relative z-10 animate-scale-in">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform duration-500">
            <img 
              src={logoImage} 
              alt="MYTuDo" 
              className="h-24 sm:h-28 w-auto drop-shadow-xl" 
            />
          </div>
          <p className="text-base sm:text-lg text-foreground/70 font-medium">
            Tủ đồ số & Chợ thời trang bền vững 🌱
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white/95 backdrop-blur-sm shadow-xl rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl border border-primary/10">
          {isDev && mode === "login" && (
            <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
              <label className="block text-sm font-semibold text-primary mb-2">
                Test Users (Dev Only):
              </label>
              <select
                onChange={(e) => {
                  const user = TEST_USERS[parseInt(e.target.value)];
                  if (user) handleTestUserSelect(user);
                }}
                defaultValue=""
                className="w-full px-3 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Đăng nhập
              </h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-2xl text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Đăng ký
              </h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />
                <Input
                  type="text"
                  placeholder="Họ và tên (tùy chọn)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />

                {error && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-2xl text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  isLoading={isPending}
                  className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Magic Link
              </h2>
              {magicLinkSent ? (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    className="transition-all hover:border-primary/50 focus:border-primary"
                  />

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-2xl text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isPending}
                    className="w-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="text-center mt-6 text-sm text-foreground/50">
          <p>© 2026 MYTuDo. Thời trang bền vững 🌍</p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

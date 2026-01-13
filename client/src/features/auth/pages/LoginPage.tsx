import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useAuth } from "../hooks/useAuth";
import styles from "./LoginPage.module.css";

type AuthMode = "login" | "register" | "magic-link";

// Test users for development
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

  // Redirect if already authenticated
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
        err.response?.data?.error?.message || "Không thể gửi magic link"
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
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.logo}>👗 MYTuDo</h1>
        <p className={styles.tagline}>Tủ đồ số & Chợ thời trang bền vững</p>

        {isDev && mode === "login" && (
          <div className={styles.testUsers}>
            <label>Test Users (Dev Only):</label>
            <select
              onChange={(e) => {
                const user = TEST_USERS[parseInt(e.target.value)];
                if (user) handleTestUserSelect(user);
              }}
              defaultValue=""
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
          <>
            <h2 className={styles.title}>Đăng nhập</h2>
            <form onSubmit={handleLogin} className={styles.form}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <div className={styles.error}>{error}</div>}

              <Button type="submit" isLoading={isPending}>
                Đăng nhập
              </Button>

              <div className={styles.links}>
                <button type="button" onClick={() => setMode("register")}>
                  Chưa có tài khoản? Đăng ký
                </button>
                <button type="button" onClick={() => setMode("magic-link")}>
                  Đăng nhập không mật khẩu
                </button>
              </div>
            </form>
          </>
        )}

        {mode === "register" && (
          <>
            <h2 className={styles.title}>Đăng ký</h2>
            <form onSubmit={handleRegister} className={styles.form}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                type="text"
                placeholder="Họ và tên (tùy chọn)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              {error && <div className={styles.error}>{error}</div>}

              <Button type="submit" isLoading={isPending}>
                Đăng ký
              </Button>

              <div className={styles.links}>
                <button type="button" onClick={() => setMode("login")}>
                  Đã có tài khoản? Đăng nhập
                </button>
              </div>
            </form>
          </>
        )}

        {mode === "magic-link" && (
          <>
            <h2 className={styles.title}>Magic Link</h2>
            {magicLinkSent ? (
              <div className={styles.success}>
                <p>✓ Link đăng nhập đã được gửi đến {email}</p>
                <p className={styles.infoText}>
                  Vui lòng kiểm tra email và click vào link để đăng nhập
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMagicLinkSent(false);
                    setMode("login");
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className={styles.form}>
                <p className={styles.infoText}>
                  Nhập email để nhận link đăng nhập không cần mật khẩu
                </p>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {error && <div className={styles.error}>{error}</div>}

                <Button type="submit" isLoading={isPending}>
                  Gửi Magic Link
                </Button>

                <div className={styles.links}>
                  <button type="button" onClick={() => setMode("login")}>
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/Button";
import { Input } from "../../../components/Input";
import { useAuth } from "../hooks/useAuth";
import styles from "./LoginPage.module.css";

type Step = "phone" | "otp";

export function LoginPage() {
  const navigate = useNavigate();
  const {
    sendOtp,
    verifyOtp,
    isSendOtpPending,
    isVerifyOtpPending,
    isAuthenticated,
  } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const formatPhoneForApi = (localPhone: string) => {
    // Remove any non-digit characters
    const digits = localPhone.replace(/\D/g, "");
    // Add country code
    return `+84${digits.startsWith("0") ? digits.slice(1) : digits}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await sendOtp({ phone: formatPhoneForApi(phone) });
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Không thể gửi mã OTP");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every((d) => d)) {
      handleVerifyOtp(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode?: string) => {
    setError(null);
    const code = otpCode || otp.join("");

    if (code.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    try {
      await verifyOtp({ phone: formatPhoneForApi(phone), otp: code });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Mã OTP không đúng");
    }
  };

  const handleBack = () => {
    setStep("phone");
    setOtp(["", "", "", "", "", ""]);
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.logo}>👗 MYTuDo</h1>
        <p className={styles.tagline}>Tủ đồ số & Chợ thời trang bền vững</p>

        {step === "phone" ? (
          <>
            <h2 className={styles.title}>Đăng nhập</h2>
            <form onSubmit={handleSendOtp} className={styles.form}>
              <div className={styles.phoneInputWrapper}>
                <span className={styles.countryCode}>+84</span>
                <Input
                  type="tel"
                  placeholder="Số điện thoại"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.phoneInput}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <Button type="submit" isLoading={isSendOtpPending}>
                Gửi mã OTP
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Nhập mã OTP</h2>
            <p className={styles.otpInfo}>
              Mã xác thực đã được gửi đến +84{phone}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyOtp();
              }}
              className={styles.form}
            >
              <div className={styles.otpInputWrapper}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={styles.otpInput}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <Button type="submit" isLoading={isVerifyOtpPending}>
                Xác nhận
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className={styles.backButton}
              >
                Quay lại
              </Button>
            </form>

            <div className={styles.resendLink}>
              <button
                type="button"
                onClick={() =>
                  handleSendOtp({ preventDefault: () => {} } as any)
                }
                disabled={isSendOtpPending}
              >
                Gửi lại mã
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

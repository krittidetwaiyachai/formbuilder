import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { VerificationStateStatus } from '@/types';
import TurnstileWidget from './TurnstileWidget';
interface FormVerificationPanelProps {
  verificationRequired: boolean;
  captchaRequired: boolean;
  canonicalEmail: string | null;
  verificationStatus: VerificationStateStatus;
  verificationMessage?: string | null;
  requesting: boolean;
  recovering: boolean;
  captchaResetSignal: number;
  onCaptchaTokenChange: (token: string | null) => void;
  onRequestVerification: () => Promise<void>;
}
function getStatusVariant(status: VerificationStateStatus) {
  switch (status) {
    case 'verified':
      return 'default';
    case 'expired':
      return 'destructive';
    case 'pending':
    case 'required':
      return 'secondary';
    default:
      return 'outline';
  }
}
function getStatusLabel(status: VerificationStateStatus) {
  switch (status) {
    case 'verified':
      return 'Verified';
    case 'pending':
      return 'Pending';
    case 'required':
      return 'Action required';
    case 'expired':
      return 'Expired';
    default:
      return 'Not started';
  }
}
export default function FormVerificationPanel({
  verificationRequired,
  captchaRequired,
  canonicalEmail,
  verificationStatus,
  verificationMessage,
  requesting,
  recovering,
  captchaResetSignal,
  onCaptchaTokenChange,
  onRequestVerification
}: FormVerificationPanelProps) {
  if (!verificationRequired && !captchaRequired) {
    return null;
  }
  if (!verificationRequired && captchaRequired) {
    return (
      <div className="mt-6">        <TurnstileWidget
          onTokenChange={onCaptchaTokenChange}
          resetSignal={captchaResetSignal} />      </div>);
  }
  const actionLabel =
  verificationStatus === 'pending' || verificationStatus === 'expired' ?
  'Resend verification' :
  'Verify email';
  return (
    <div
      className="mt-6 rounded-2xl border px-4 py-4 shadow-sm"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--primary) 4%, var(--card-bg))',
        borderColor: 'color-mix(in srgb, var(--primary) 18%, transparent)'
      }}>      <div className="flex flex-col gap-3">        <div className="flex flex-wrap items-center justify-between gap-3">          <div>            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>              Submission security            </p>            <p className="text-xs" style={{ color: 'var(--text)', opacity: 0.7 }}>              {verificationRequired ?
              'Verify the email address before final submission.' :
              'Complete the captcha before final submission.'}            </p>          </div>          {verificationRequired &&
          <Badge variant={getStatusVariant(verificationStatus)}>            {getStatusLabel(verificationStatus)}          </Badge>
          }        </div>        {canonicalEmail &&
        <div className="rounded-lg border border-black/5 bg-white/40 px-3 py-2 text-sm">          <span className="font-medium">Email:</span> {canonicalEmail}        </div>
        }        {!canonicalEmail && verificationRequired &&
        <p className="text-sm text-amber-700">            Enter your email before requesting verification.        </p>
        }        {verificationMessage &&
        <p className="text-sm" style={{ color: 'var(--text)', opacity: 0.85 }}>          {verificationMessage}        </p>
        }        {captchaRequired &&
        <div className="rounded-xl border border-dashed border-black/10 bg-white/30 px-3 py-3">          <TurnstileWidget
            onTokenChange={onCaptchaTokenChange}
            resetSignal={captchaResetSignal} />        </div>
        }        {verificationRequired &&
        <div className="flex flex-wrap items-center gap-3">          <Button
            type="button"
            onClick={() => void onRequestVerification()}
            disabled={!canonicalEmail || requesting || recovering}>            {requesting || recovering ? 'Processing...' : actionLabel}          </Button>          <span className="text-xs" style={{ color: 'var(--text)', opacity: 0.65 }}>              You can return to this tab after email verification.          </span>        </div>
        }      </div>    </div>);
}
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseApiError } from '../services/api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Student' | 'Instructor'>('Student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorList, setErrorList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live password validation criteria matching backend Identity rules
  const passwordRules = useMemo(() => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.lowercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});
    setErrorList([]);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    // Client-side validations
    const errors: Record<string, string> = {};

    if (!trimmedFirst) {
      errors['firstname'] = 'First name is required.';
    }
    if (!trimmedLast) {
      errors['lastname'] = 'Last name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors['email'] = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors['email'] = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!password) {
      errors['password'] = 'Password is required.';
    } else if (!isPasswordValid) {
      errors['password'] =
        'Password does not meet all required complexity criteria listed below.';
    }

    if (!confirmPassword) {
      errors['confirmpassword'] = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors['confirmpassword'] = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError('Please resolve the highlighted field errors below.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await register({
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        password,
        role,
      });

      if (res.roles?.includes('Instructor')) {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: any) {
      const parsed = parseApiError(
        err,
        'Registration could not be completed. Please verify your details.'
      );
      setGeneralError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      setErrorList(parsed.errorList);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create an Account</h2>
          <p className="text-xs text-slate-500">
            Start learning with certified curriculum or share your engineering knowledge
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{generalError}</span>
            </div>
            {errorList.length > 1 && (
              <ul className="list-disc list-inside pl-5 space-y-0.5 text-rose-700 text-[11px]">
                {errorList.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              I want to join as
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('Student')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  role === 'Student'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student Learner</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('Instructor')}
                className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  role === 'Instructor'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Course Creator</span>
              </button>
            </div>
          </div>

          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              required
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (fieldErrors['firstname']) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next['firstname'];
                    return next;
                  });
                }
              }}
              placeholder="e.g. Alex"
              error={fieldErrors['firstname']}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (fieldErrors['lastname']) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next['lastname'];
                    return next;
                  });
                }
              }}
              placeholder="e.g. Johnson"
              error={fieldErrors['lastname']}
            />
          </div>

          {/* Email Address */}
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors['email']) {
                setFieldErrors((prev) => {
                  const next = { ...prev };
                  delete next['email'];
                  return next;
                });
              }
            }}
            placeholder="name@domain.com"
            error={fieldErrors['email']}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors['password']) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next['password'];
                      return next;
                    });
                  }
                }}
                placeholder="••••••••"
                error={fieldErrors['password']}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors['confirmpassword']) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next['confirmpassword'];
                      return next;
                    });
                  }
                }}
                placeholder="••••••••"
                error={fieldErrors['confirmpassword']}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>
          </div>

          {/* Password Complexity Checklist */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold text-slate-700">Security Requirements:</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                {passwordRules.length ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={passwordRules.length ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                  8+ characters
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordRules.uppercase && passwordRules.lowercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span
                  className={
                    passwordRules.uppercase && passwordRules.lowercase
                      ? 'text-emerald-800 font-medium'
                      : 'text-slate-500'
                  }
                >
                  Uppercase &amp; lowercase
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordRules.number ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={passwordRules.number ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                  At least 1 digit (0-9)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordRules.special ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
                <span className={passwordRules.special ? 'text-emerald-800 font-medium' : 'text-slate-500'}>
                  Special symbol (@$!%*?)
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Existing account link */}
        <div className="text-center text-xs text-slate-500 pt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

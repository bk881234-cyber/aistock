import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirm) {
      setErr('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (form.password.length < 8) {
      setErr('비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (!/[A-Za-z]/.test(form.password)) {
      setErr('비밀번호에 영문자가 포함되어야 합니다.');
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setErr('비밀번호에 숫자가 포함되어야 합니다.');
      return;
    }
    const ok = await register(form.name, form.email, form.password);
    if (ok) navigate('/');
  };

  const f = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <div className="min-h-screen bg-surface2 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">AIstock</h1>
          <p className="text-sm text-text-muted mt-1">AI 기반 주식 트래커</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-bold text-text-primary mb-5">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: '이름',      key: 'name',     type: 'text',     placeholder: '홍길동' },
              { label: '이메일',    key: 'email',    type: 'email',    placeholder: 'example@email.com' },
              { label: '비밀번호',  key: 'password', type: 'password', placeholder: '8자 이상' },
              { label: '비밀번호 확인', key: 'confirm', type: 'password', placeholder: '비밀번호 재입력' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
                <input type={type} className="input" placeholder={placeholder} {...f(key)} required />
              </div>
            ))}

            {err && <p className="text-sm text-bear">{err}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted mt-4">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

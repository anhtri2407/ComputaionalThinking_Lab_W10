import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signup, login, resetPassword } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validate
    if (!email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp');
        return;
      }
      if (password.length < 6) {
        setError('Mật khẩu phải có ít nhất 6 ký tự');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        setMessage('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      } else {
        await signup(email, password, displayName);
        setMessage('Đăng ký thành công!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('Email này đã được sử dụng');
          break;
        case 'auth/invalid-email':
          setError('Email không hợp lệ');
          break;
        case 'auth/weak-password':
          setError('Mật khẩu quá yếu');
          break;
        case 'auth/user-not-found':
          setError('Không tìm thấy tài khoản với email này');
          break;
        case 'auth/wrong-password':
          setError('Mật khẩu không đúng');
          break;
        case 'auth/invalid-credential':
          setError('Email hoặc mật khẩu không đúng');
          break;
        default:
          setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Vui lòng nhập email của bạn');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setMessage('Email đặt lại mật khẩu đã được gửi!');
    } catch (err) {
      console.error('Reset password error:', err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('Không tìm thấy tài khoản với email này');
          break;
        case 'auth/invalid-email':
          setError('Email không hợp lệ');
          break;
        default:
          setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-modal-header">
          <h2>
            {showForgotPassword 
              ? 'Quên mật khẩu' 
              : isLogin 
                ? 'Đăng nhập' 
                : 'Đăng ký'}
          </h2>
          <p>
            {showForgotPassword
              ? 'Nhập email để nhận link đặt lại mật khẩu'
              : isLogin
                ? 'Đăng nhập để trải nghiệm đầy đủ tính năng'
                : 'Tạo tài khoản mới để bắt đầu'}
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <div className="form-group">
              <label htmlFor="reset-email">Email</label>
              <input
                type="email"
                id="reset-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi email đặt lại'}
            </button>

            <p className="auth-switch">
              <button 
                type="button" 
                onClick={() => {
                  setShowForgotPassword(false);
                  resetForm();
                }}
              >
                Quay lại đăng nhập
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="displayName">Tên hiển thị</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  required
                />
              </div>
            )}

            {isLogin && (
              <div className="forgot-password">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setMessage('');
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading 
                ? (isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...') 
                : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>

            <p className="auth-switch">
              {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button type="button" onClick={switchMode}>
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

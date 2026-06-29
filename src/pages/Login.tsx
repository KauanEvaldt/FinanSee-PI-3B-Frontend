import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password: senha });
      const { token, user } = response.data;
      
      login(token, { nome: user.nome, perfil: user.perfil });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.logo}>FinanSee</div>
      
      <div className={styles.card}>
        <h2 className={styles.title}>Faça o login para acessar sua conta</h2>
        
        <form onSubmit={handleSubmit}>
          {error && <div className={styles.errorMessage} style={{color: 'red', marginBottom: '1rem', fontSize: '0.9rem', textAlign: 'center'}}>{error}</div>}
          <div className={styles.inputGroup}>
            <label>E-mail ou telefone</label>
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Senha</label>
            <div className={styles.inputWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                className={styles.input} 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required 
              />
              {showPassword ? (
                <Eye className={styles.eyeIcon} size={20} onClick={() => setShowPassword(false)} />
              ) : (
                <EyeOff className={styles.eyeIcon} size={20} onClick={() => setShowPassword(true)} />
              )}
            </div>
          </div>
          
          <div className={styles.actions}>
            <label className={styles.checkboxGroup}>
              <input type="checkbox" />
              <span>Manter-me logado</span>
            </label>
            <a href="#" className={styles.forgotPassword}>Esqueci minha senha</a>
          </div>
          
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

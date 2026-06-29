import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './Configuracoes.module.css';

const Configuracoes: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkTheme = document.body.classList.contains('dark-theme');
    setIsDark(isDarkTheme);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark-theme');
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-theme');
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={styles.title}>Configurações</h1>
          <p className={styles.subtitle}>Gerencie suas preferências de sistema e aparência.</p>
        </header>

        <div className={styles.card}>
          <div className={styles.settingRow}>
            <div>
              <h3>Tema Escuro (Dark Mode)</h3>
              <p>Altera a aparência do sistema para cores escuras.</p>
            </div>
            <button 
              className={`${styles.toggleBtn} ${isDark ? styles.active : ''}`}
              onClick={toggleTheme}
            >
              <div className={styles.toggleKnob}></div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Configuracoes;

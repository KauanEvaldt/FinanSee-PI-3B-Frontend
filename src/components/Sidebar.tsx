import React from 'react';
import styles from './Sidebar.module.css';
import { 
  LayoutDashboard, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        FinanSee
      </div>
      
      <nav className={styles.nav}>
        <div 
          className={`${styles.navItem} ${isActive('/dashboard') ? styles.active : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </div>
        <div 
          className={`${styles.navItem} ${isActive('/projetos') ? styles.active : ''}`}
          onClick={() => navigate('/projetos')}
        >
          <FolderOpen size={20} />
          <span>Projetos</span>
        </div>
        <div 
          className={`${styles.navItem} ${isActive('/relatorios') ? styles.active : ''}`}
          onClick={() => navigate('/relatorios')}
        >
          <BarChart3 size={20} />
          <span>Relatórios</span>
        </div>
        <div 
          className={`${styles.navItem} ${isActive('/configuracoes') ? styles.active : ''}`}
          onClick={() => navigate('/configuracoes')}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </div>
      </nav>
      

      
      <div className={styles.userProfile} onClick={handleLogout}>
        <div className={styles.avatar}></div>
        <span className={styles.userName}>{user?.nome || 'Usuário'}</span>
        <LogOut size={20} className={styles.logoutIcon} />
      </div>
    </div>
  );
};

export default Sidebar;

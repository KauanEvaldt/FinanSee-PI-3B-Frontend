import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import styles from './Dashboard.module.css';
import { Bell, FolderOpen, DollarSign, CreditCard, AlertTriangle, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/dashboard');
        setDashboardData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className={styles.layout} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Carregando dashboard...</div>;
  }

  // Prepara dados para o gráfico
  const chartData = dashboardData?.graficoLabels?.map((label: string, index: number) => ({
    name: label,
    orcamento: dashboardData.graficoOrcamento[index] || 0,
    gasto: dashboardData.graficoGasto[index] || 0
  })) || [];

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.welcome}>Bem vindo, {user?.nome || 'Usuário'}!</h1>
            <p className={styles.subtitle}>Você tem <strong>{dashboardData?.projetosAtivos || 0} projetos ativos</strong>.</p>
          </div>
          <button className={styles.notificationBtn}>
            <Bell size={24} />
          </button>
        </header>
        
        <div className={styles.kpiContainer}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper}>
              <FolderOpen size={28} className={styles.kpiIconBlue} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Projetos ativos</span>
              <span className={styles.kpiValue}>{dashboardData?.projetosAtivos || 0}</span>
            </div>
          </div>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper}>
              <DollarSign size={28} className={styles.kpiIconBlue} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Orçamento total</span>
              <span className={styles.kpiValue}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData?.orcamentoTotal || 0)}
              </span>
            </div>
          </div>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapper}>
              <CreditCard size={28} className={styles.kpiIconBlue} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Gasto total</span>
              <span className={styles.kpiValue}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData?.gastoTotal || 0)}
              </span>
            </div>
          </div>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiIconWrapperAlert}>
              <AlertTriangle size={28} className={styles.kpiIconAlert} />
            </div>
            <div className={styles.kpiInfo}>
              <span className={styles.kpiLabel}>Alertas</span>
              <span className={styles.kpiValueAlert}>{dashboardData?.alertas || 0}</span>
              <span className={styles.kpiSubLabel}>Projeto próximo do limite</span>
            </div>
          </div>
        </div>
        
        <div className={styles.chartsContainer}>
          <div className={styles.projectsCard}>
            <div className={styles.cardHeader}>
              <h2>Projetos em andamento</h2>
              <a href="/projetos" className={styles.btnSecondary}>Ver todos</a>
            </div>
            
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Progresso do orçamento</th>
                  <th>Gasto / Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.projetos?.length > 0 ? (
                  dashboardData.projetos.map((proj: any, index: number) => {
                    const progresso = proj.orcamento > 0 ? (proj.gasto / proj.orcamento) * 100 : 0;
                    
                    let statusClass = styles.statusSuccess;
                    let statusText = proj.status || 'Ok';
                    if (progresso > 90) { statusClass = styles.statusDanger; statusText = 'Alerta'; }
                    else if (progresso > 70) { statusClass = styles.statusWarning; statusText = 'Atenção'; }

                    return (
                      <tr key={index}>
                        <td className={styles.projectName}>{proj.nome}</td>
                        <td>
                          <div className={styles.progressBarWrapper}>
                            <div className={styles.progressBar} style={{ width: `${Math.min(progresso, 100)}%`, backgroundColor: progresso > 90 ? 'var(--color-danger)' : (progresso > 70 ? 'var(--color-warning)' : 'var(--color-blue-chart)') }}></div>
                          </div>
                          <span className={styles.progressText}>{progresso.toFixed(0)}%</span>
                        </td>
                        <td>
                          <div className={styles.moneyValue}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proj.gasto)}</div>
                          <div className={styles.moneyTotal}>/ {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proj.orcamento)}</div>
                        </td>
                        <td><span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span></td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Nenhum projeto em andamento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Gasto vs. Orçamento</h2>
            <div className={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => `R$ ${value}`} />
                  <Legend iconType="circle" wrapperStyle={{top: -20, right: 0}} />
                  <Bar dataKey="orcamento" name="Orçamento" fill="var(--color-blue-chart)" radius={[4, 4, 0, 0]} barSize={24} />
                  <Bar dataKey="gasto" name="Gasto" fill="var(--color-green-chart)" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomContainer}>
          <div className={styles.activitiesCard}>
            <h2>Atividades recentes</h2>
            
            {dashboardData?.atividades?.length > 0 ? (
              dashboardData.atividades.map((ativ: any, idx: number) => {
                const isGasto = ativ.tipo === 'Gasto';
                const Icon = isGasto ? DollarSign : (ativ.tipo === 'Item' ? CheckSquare : FolderOpen);
                const colorClass = isGasto ? styles.iconGreen : styles.iconBlue;
                
                return (
                  <div key={idx} className={styles.activityItem}>
                    <div className={`${styles.activityIcon} ${colorClass}`}>
                      <Icon size={18} />
                    </div>
                    <div className={styles.activityText}>
                      <p dangerouslySetInnerHTML={{ __html: ativ.descricaoHtml }} />
                    </div>
                    <div className={styles.activityTime}>{new Date(ativ.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                );
              })
            ) : (
              <p style={{color: 'var(--color-text-muted)', padding: '1rem'}}>Nenhuma atividade recente.</p>
            )}
          </div>
          
          <div className={styles.alertsCard}>
            <h2><AlertTriangle size={24} className={styles.titleAlertIcon}/> Alertas importantes</h2>
            
            {dashboardData?.alertasLista?.length > 0 ? (
              dashboardData.alertasLista.map((alerta: any, idx: number) => (
                <div key={idx} className={alerta.tipo === 'Danger' ? styles.alertBannerDanger : styles.alertBannerInfo}>
                  {alerta.tipo === 'Danger' ? (
                    <AlertTriangle size={20} className={styles.bannerIconDanger} />
                  ) : (
                    <div className={styles.infoIconWrapper}>i</div>
                  )}
                  <div className={styles.bannerText}>
                    <p dangerouslySetInnerHTML={{ __html: alerta.descricaoHtml }} />
                  </div>
                  {alerta.projetoId && (
                    <button 
                      className={alerta.tipo === 'Danger' ? styles.bannerBtn : styles.bannerBtnInfo}
                      onClick={() => window.location.href = `/projetos/${alerta.projetoId}`}
                    >
                      {alerta.tipo === 'Danger' ? 'Ver detalhes' : 'Verificar'}
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p style={{color: 'var(--color-text-muted)', padding: '1rem'}}>Nenhum alerta no momento.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

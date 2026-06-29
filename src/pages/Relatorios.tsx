import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './Relatorios.module.css';
import { Briefcase, Activity, CheckCircle, DollarSign } from 'lucide-react';

const Relatorios: React.FC = () => {
  const [relatorioGeral, setRelatorioGeral] = useState<any>(null);
  const [projetos, setProjetos] = useState<any[]>([]);
  const [selectedProjetoId, setSelectedProjetoId] = useState<string>('');
  const [evolucao, setEvolucao] = useState<any>(null);
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loadingEvolucao, setLoadingEvolucao] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [relatorioRes, projetosRes] = await Promise.all([
          api.get('/relatorios'),
          api.get('/projetos')
        ]);
        setRelatorioGeral(relatorioRes.data);
        setProjetos(projetosRes.data);
      } catch (error) {
        console.error('Erro ao buscar dados iniciais de relatórios:', error);
      } finally {
        setLoadingGeral(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchEvolucao = async () => {
      if (!selectedProjetoId) {
        setEvolucao(null);
        return;
      }
      setLoadingEvolucao(true);
      try {
        const response = await api.get(`/relatorios/evolucao?projetoId=${selectedProjetoId}`);
        setEvolucao(response.data);
      } catch (error) {
        console.error('Erro ao buscar evolução do projeto:', error);
        setEvolucao(null);
      } finally {
        setLoadingEvolucao(false);
      }
    };
    fetchEvolucao();
  }, [selectedProjetoId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const evolucaoChartData = evolucao?.labels?.map((label: string, idx: number) => ({
    name: label,
    Orcado: evolucao.orcado[idx] || 0,
    Realizado: evolucao.realizado[idx] || 0,
  })) || [];

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Relatórios</h1>
            <p className={styles.subtitle}>Visão consolidada e evolução financeira dos projetos.</p>
          </div>
        </header>

        {loadingGeral ? (
          <div className={styles.loading}>Carregando relatórios...</div>
        ) : (
          <>
            <div className={styles.kpiGrid}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                  <Briefcase size={24} />
                </div>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Total de Projetos</span>
                  <span className={styles.kpiValue}>{relatorioGeral?.totalProjetos || 0}</span>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}>
                  <Activity size={24} />
                </div>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Em Andamento</span>
                  <span className={styles.kpiValue}>{relatorioGeral?.emAndamento || 0}</span>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                  <CheckCircle size={24} />
                </div>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Concluídos</span>
                  <span className={styles.kpiValue}>{relatorioGeral?.concluidos || 0}</span>
                </div>
              </div>

              <div className={styles.kpiCard}>
                <div className={styles.kpiIconWrapper} style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
                  <DollarSign size={24} />
                </div>
                <div className={styles.kpiInfo}>
                  <span className={styles.kpiLabel}>Gasto Consolidado</span>
                  <span className={styles.kpiValue}>{formatCurrency(relatorioGeral?.totalGasto || 0)}</span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Evolução Financeira por Projeto</h3>
                <select 
                  className={styles.selectProject}
                  value={selectedProjetoId}
                  onChange={(e) => setSelectedProjetoId(e.target.value)}
                >
                  <option value="">Selecione um projeto...</option>
                  {projetos.map(p => (
                    <option key={p.id} value={p.id}>{p.titulo}</option>
                  ))}
                </select>
              </div>

              <div className={styles.chartContainer}>
                {!selectedProjetoId ? (
                  <div className={styles.emptyState}>Selecione um projeto acima para visualizar sua evolução.</div>
                ) : loadingEvolucao ? (
                  <div className={styles.loading}>Gerando gráfico...</div>
                ) : evolucaoChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={evolucaoChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(value) => `R$ ${value / 1000}k`} tick={{ fill: '#64748b' }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="Orcado" stroke="#94a3b8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Orçamento Acumulado" />
                      <Line type="monotone" dataKey="Realizado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Gasto Acumulado" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyState}>Dados insuficientes para gerar o gráfico deste projeto.</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Relatorios;

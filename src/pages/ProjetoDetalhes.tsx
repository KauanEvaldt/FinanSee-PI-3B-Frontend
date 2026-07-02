import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { ArrowLeft, Edit, PlusCircle, Receipt, Trash2 } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from 'recharts';
import NovoItemModal from '../components/NovoItemModal';
import NovoGastoModal from '../components/NovoGastoModal';
import NovoProjetoModal from '../components/NovoProjetoModal';
import styles from './ProjetoDetalhes.module.css';

const CUSTEIO_COLOR = '#1a3a6e';
const CAPITAL_COLOR = '#93c5fd';

const ProjetoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [projeto, setProjeto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'visao_geral' | 'orcados' | 'realizados'>('visao_geral');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [isProjetoModalOpen, setIsProjetoModalOpen] = useState(false);
  
  const [editItem, setEditItem] = useState<any>(null);
  const [editGasto, setEditGasto] = useState<any>(null);

  const fetchProjeto = async () => {
    try {
      const response = await api.get(`/projetos/${id}`);
      setProjeto(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes do projeto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjeto();
  }, [id]);

  const handleDeleteItemOrcado = async (itemId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este item orçado?')) return;
    try {
      await api.delete(`/itens-orcados/${itemId}`);
      fetchProjeto();
    } catch (err) {
      console.error('Erro ao excluir item orçado:', err);
      alert('Erro ao excluir item.');
    }
  };

  const handleDeleteGasto = async (gastoId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este gasto?')) return;
    try {
      await api.delete(`/gastos/${gastoId}`);
      fetchProjeto();
    } catch (err) {
      console.error('Erro ao excluir gasto:', err);
      alert('Erro ao excluir gasto.');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0);

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (!projeto) return <div className={styles.loading}>Projeto não encontrado.</div>;

  const percentual = projeto.percentual ?? 0;
  const progressColor = percentual > 90 ? '#dc2626' : percentual > 70 ? '#d97706' : '#3b82f6';

  // Dados para o gráfico de pizza Custeio vs Capital
  const pieData = [
    { name: 'Custeio', value: projeto.custeio ?? 0 },
    { name: 'Capital', value: projeto.capital ?? 0 },
  ].filter(d => d.value > 0);

  // Dados para gráfico Orçado vs Realizado por categoria (itens agrupados)
  const categoriaMap: Record<string, { orcado: number; realizado: number }> = {};
  (projeto.itensOrcados ?? []).forEach((item: any) => {
    const cat = item.categoria || item.natureza || 'Outros';
    if (!categoriaMap[cat]) categoriaMap[cat] = { orcado: 0, realizado: 0 };
    categoriaMap[cat].orcado += item.valorTotalOrcado ?? 0;
  });
  (projeto.itensRealizados ?? []).forEach((gasto: any) => {
    const cat = gasto.natureza || 'Outros';
    if (!categoriaMap[cat]) categoriaMap[cat] = { orcado: 0, realizado: 0 };
    categoriaMap[cat].realizado += gasto.valorTotalRealizado ?? 0;
  });
  const barData = Object.entries(categoriaMap).map(([name, vals]) => ({
    name: name.length > 10 ? name.slice(0, 10) + '...' : name,
    Orçado: vals.orcado,
    Realizado: vals.realizado,
  }));

  // Dados para Linha do Tempo
  const lineData = (projeto.labels ?? []).map((label: string, idx: number) => ({
    name: label,
    Orçado: projeto.orcado?.[idx] ?? 0,
    Realizado: projeto.realizado?.[idx] ?? 0,
  }));

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <button className={styles.backBtn} onClick={() => navigate('/projetos')}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className={styles.breadcrumb}>Projetos / <strong>{projeto.titulo}</strong></p>
              <p className={styles.subtitle}>Edital: {projeto.numeroEdital || 'N/A'} &nbsp;|&nbsp; Início: {projeto.dataInicio}</p>
            </div>
          </div>
          <button className={styles.btnSecondary} onClick={() => setIsProjetoModalOpen(true)}>
            <Edit size={18} /> Editar
          </button>
        </header>

        <div className={styles.tabs}>
          {(['visao_geral', 'orcados', 'realizados'] as const).map(tab => (
            <div
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'visao_geral' ? 'Visão Geral' : tab === 'orcados' ? 'Itens orçados' : 'Itens realizados'}
            </div>
          ))}
        </div>

        {/* ===================== VISÃO GERAL ===================== */}
        {activeTab === 'visao_geral' && (
          <>
            {/* KPIs */}
            <div className={styles.kpiRow}>
              {[
                { label: 'Orçamento', value: formatCurrency(projeto.valorTotalOrcamento) },
                { label: 'Realizado', value: formatCurrency(projeto.totalRealizado) },
                { label: 'Disponível', value: formatCurrency(projeto.disponivel) },
              ].map(kpi => (
                <div key={kpi.label} className={styles.kpiCard}>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiValue}>{kpi.value}</span>
                </div>
              ))}
              <div className={styles.kpiCard}>
                <span className={styles.kpiLabel}>Execução</span>
                <div className={styles.progressRow}>
                  <div className={styles.progressBarWrapper}>
                    <div
                      className={styles.progressBar}
                      style={{ width: `${Math.min(percentual, 100)}%`, backgroundColor: progressColor }}
                    />
                  </div>
                  <strong style={{ color: progressColor }}>{percentual.toFixed(0)}%</strong>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className={styles.chartsRow}>
              {/* Orçado vs Realizado por Categoria */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Orçado vs Realizado por Categoria</h3>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend iconType="circle" />
                      <Bar dataKey="Orçado" fill={CUSTEIO_COLOR} radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="Realizado" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyChart}>Sem dados suficientes.</div>
                )}
              </div>

              {/* Custeio vs Capital */}
              <div className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Custeio vs Capital</h3>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                        <Cell fill={CUSTEIO_COLOR} />
                        <Cell fill={CAPITAL_COLOR} />
                      </Pie>
                      <Tooltip formatter={(v: number) => formatCurrency(v)} />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className={styles.emptyChart}>Sem dados de custeio/capital.</div>
                )}
              </div>
            </div>

            {/* Linha do Tempo */}
            {lineData.length > 0 && (
              <div className={`${styles.chartCard} ${styles.chartCardFull}`} style={{ marginTop: '1.5rem' }}>
                <div className={styles.chartCardHeader}>
                  <h3 className={styles.chartTitle}>Linha do Tempo</h3>
                  <span className={styles.chartSubtitle}>Por mês</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="Orçado" stroke={CUSTEIO_COLOR} strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Realizado" stroke="#94a3b8" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ===================== ITENS ORÇADOS ===================== */}
        {activeTab === 'orcados' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Itens Orçados</h3>
              <button className={styles.btnPrimary} onClick={() => setIsItemModalOpen(true)}>
                <PlusCircle size={18} /> + Novo Item
              </button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor Unitário</th>
                  <th>Quantidade</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {projeto.itensOrcados?.length > 0 ? (
                  projeto.itensOrcados.map((item: any) => (
                    <tr key={item.id}>
                      <td><strong>{item.categoria || item.natureza}</strong></td>
                      <td>{item.descricao || '-'}</td>
                      <td>{formatCurrency(item.valorUnitarioOrcado)}</td>
                      <td>{item.quantidadeOrcada}</td>
                      <td><strong>{formatCurrency(item.valorTotalOrcado)}</strong></td>
                      <td>
                        <span className={`${styles.statusBadge} ${item.status === 'concluido' ? styles.statusSuccess : item.status === 'em_andamento' ? styles.statusOk : styles.statusMuted}`}>
                          {item.status === 'concluido' ? 'Concluído' : item.status === 'em_andamento' ? 'Em And.' : 'Não Init.'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.iconBtn} title="Editar" onClick={() => { setEditItem(item); setIsItemModalOpen(true); }}>
                            <Edit size={16} />
                          </button>
                          <button className={styles.iconBtn} title="Excluir" onClick={() => handleDeleteItemOrcado(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className={styles.emptyCell}>Nenhum item orçado. Clique em "+ Novo Item" para adicionar.</td></tr>
                )}
              </tbody>
              {projeto.itensOrcados?.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={4}><strong>Total de itens: {projeto.itensOrcados.length}</strong></td>
                    <td colSpan={3}><strong>Total Orçado: {formatCurrency(projeto.itensOrcados.reduce((s: number, i: any) => s + (i.valorTotalOrcado ?? 0), 0))}</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

        {/* ===================== ITENS REALIZADOS ===================== */}
        {activeTab === 'realizados' && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>Itens Realizados</h3>
              <button className={styles.btnPrimary} onClick={() => setIsGastoModalOpen(true)}>
                <Receipt size={18} /> + Registrar Gasto
              </button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Fornecedor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {projeto.itensRealizados?.length > 0 ? (
                  projeto.itensRealizados.map((gasto: any) => (
                    <tr key={gasto.id}>
                      <td>{gasto.dataDespesa ? String(gasto.dataDespesa) : '-'}</td>
                      <td>{gasto.natureza || gasto.tipoDespesa || '-'}</td>
                      <td>{gasto.observacao || '-'}</td>
                      <td><strong>{formatCurrency(gasto.valorTotalRealizado)}</strong></td>
                      <td>{gasto.fornecedor || '-'}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button className={styles.iconBtn} title="Editar" onClick={() => { setEditGasto(gasto); setIsGastoModalOpen(true); }}>
                            <Edit size={16} />
                          </button>
                          <button className={styles.iconBtn} title="Excluir" onClick={() => handleDeleteGasto(gasto.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={6} className={styles.emptyCell}>Nenhum gasto registrado. Clique em "+ Registrar Gasto".</td></tr>
                )}
              </tbody>
              {projeto.itensRealizados?.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={3}><strong>Mostrando {projeto.itensRealizados.length} itens</strong></td>
                    <td colSpan={3}><strong>Total: {formatCurrency(projeto.itensRealizados.reduce((s: number, g: any) => s + (g.valorTotalRealizado ?? 0), 0))}</strong></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}

      </main>

      {projeto && (
        <>
          <NovoProjetoModal
            isOpen={isProjetoModalOpen}
            onClose={() => { setIsProjetoModalOpen(false); }}
            onSuccess={() => { setIsProjetoModalOpen(false); fetchProjeto(); }}
            initialData={projeto}
          />
          <NovoItemModal
            isOpen={isItemModalOpen}
            onClose={() => { setIsItemModalOpen(false); setEditItem(null); }}
            onSuccess={() => { setIsItemModalOpen(false); setEditItem(null); fetchProjeto(); }}
            projetoId={projeto.id}
            initialData={editItem}
          />
          <NovoGastoModal
            isOpen={isGastoModalOpen}
            onClose={() => { setIsGastoModalOpen(false); setEditGasto(null); }}
            onSuccess={() => { setIsGastoModalOpen(false); setEditGasto(null); fetchProjeto(); }}
            projetoId={projeto.id}
            itensOrcados={projeto.itensOrcados || []}
            initialData={editGasto}
          />
        </>
      )}
    </div>
  );
};

export default ProjetoDetalhes;

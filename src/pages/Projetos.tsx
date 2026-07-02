import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NovoProjetoModal from '../components/NovoProjetoModal';
import { Plus, Search, Edit } from 'lucide-react';
import api from '../services/api';
import styles from './Projetos.module.css';

const Projetos: React.FC = () => {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProjeto, setEditProjeto] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'em_andamento' | 'concluido' | 'alerta'>('todos');
  const navigate = useNavigate();

  const fetchProjetos = async () => {
    try {
      const response = await api.get('/projetos');
      setProjetos(response.data);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjetos();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusInfo = (proj: any) => {
    if (proj.percentual >= 100 || proj.status === 'concluido') {
      return { text: 'Concluído', cls: styles.statusSuccess, color: '#16a34a' };
    } else if (proj.percentual > 90) {
      return { text: 'Alerta', cls: styles.statusDanger, color: '#dc2626' };
    } else if (proj.percentual > 70) {
      return { text: 'Atenção', cls: styles.statusWarning, color: '#d97706' };
    }
    return { text: 'Em andamento', cls: styles.statusOk, color: '#3b82f6' };
  };

  const projetosFiltrados = projetos.filter((p) => {
    const matchSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    const pct = p.percentual;
    if (filterStatus === 'concluido') return pct >= 100 || p.status === 'concluido';
    if (filterStatus === 'alerta') return pct > 90 && pct < 100;
    if (filterStatus === 'em_andamento') return pct <= 90 && p.status !== 'concluido';
    return true;
  });

  const emAndamento = projetosFiltrados.filter(p => p.percentual < 100 && p.status !== 'concluido');
  const concluidos = projetosFiltrados.filter(p => p.percentual >= 100 || p.status === 'concluido');

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Projetos</h1>
            <p className={styles.subtitle}>Gerencie todos os seus projetos ativos e concluídos.</p>
          </div>
          <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            <span>Novo Projeto</span>
          </button>
        </header>

        <div className={styles.controls}>
          <div className={styles.filtersBar}>
            <span className={styles.filtersLabel}>Filtros:</span>
            {(['todos', 'em_andamento', 'alerta', 'concluido'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterChip} ${filterStatus === f ? styles.filterChipActive : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {f === 'todos' ? 'Todos' : f === 'em_andamento' ? 'Em andamento' : f === 'alerta' ? 'Alerta' : 'Concluídos'}
              </button>
            ))}
          </div>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar projeto..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Carregando projetos...</div>
        ) : (
          <>
            {emAndamento.length > 0 && (
              <section>
                <h2 className={styles.sectionTitle}>Projetos em andamento</h2>
                <div className={styles.cardGrid}>
                  {emAndamento.map(proj => {
                    const { text, cls, color } = getStatusInfo(proj);
                    return (
                      <div key={proj.id} className={styles.projetoCard}>
                        <div className={styles.cardTop}>
                          <span className={`${styles.statusBadge} ${cls}`}>{text}</span>
                          <button
                            className={styles.iconBtn}
                            onClick={(e) => { e.stopPropagation(); setEditProjeto(proj); setIsModalOpen(true); }}
                            title="Editar Projeto"
                            style={{ padding: 0, color: 'var(--color-text-light)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                        <h3 className={styles.cardTitle}>{proj.titulo}</h3>
                        {proj.numeroEdital && <p className={styles.cardEdital}>{proj.numeroEdital}</p>}
                        <div className={styles.cardValues}>
                          <span>Orçamento: <strong>{formatCurrency(proj.valorTotalOrcamento)}</strong></span>
                          <span>Execução: <strong style={{ color }}>{proj.percentual.toFixed(0)}%</strong></span>
                        </div>
                        <div className={styles.progressBarWrapper}>
                          <div
                            className={styles.progressBar}
                            style={{ width: `${Math.min(proj.percentual, 100)}%`, backgroundColor: color }}
                          />
                        </div>
                        <button
                          className={styles.btnDetalhes}
                          onClick={() => navigate(`/projetos/${proj.id}`)}
                        >
                          Ver detalhes
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {concluidos.length > 0 && (
              <section style={{ marginTop: '2rem' }}>
                <h2 className={styles.sectionTitle}>Projetos concluídos</h2>
                <div className={styles.cardGrid}>
                  {concluidos.map(proj => (
                    <div key={proj.id} className={`${styles.projetoCard} ${styles.projetoCardConcluido}`}>
                      <div className={styles.cardTop}>
                        <span className={`${styles.statusBadge} ${styles.statusSuccess}`}>Concluído</span>
                        <button
                          className={styles.iconBtn}
                          onClick={(e) => { e.stopPropagation(); setEditProjeto(proj); setIsModalOpen(true); }}
                          title="Editar Projeto"
                          style={{ padding: 0, color: 'var(--color-text-light)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                      <h3 className={styles.cardTitle}>{proj.titulo}</h3>
                      {proj.numeroEdital && <p className={styles.cardEdital}>{proj.numeroEdital}</p>}
                      <div className={styles.cardValues}>
                        <span>Orçamento: <strong>{formatCurrency(proj.valorTotalOrcamento)}</strong></span>
                        <span>Execução: <strong style={{ color: '#16a34a' }}>100%</strong></span>
                      </div>
                      <div className={styles.progressBarWrapper}>
                        <div className={styles.progressBar} style={{ width: '100%', backgroundColor: '#16a34a' }} />
                      </div>
                      <button
                        className={styles.btnDetalhes}
                        onClick={() => navigate(`/projetos/${proj.id}`)}
                      >
                        Ver detalhes
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projetosFiltrados.length === 0 && (
              <div className={styles.emptyState}>
                {searchTerm ? `Nenhum projeto encontrado para "${searchTerm}".` : 'Nenhum projeto encontrado.'}
              </div>
            )}
          </>
        )}
      </main>

      <NovoProjetoModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditProjeto(null); }}
        onSuccess={() => { setIsModalOpen(false); setEditProjeto(null); fetchProjetos(); }}
        initialData={editProjeto}
      />
    </div>
  );
};

export default Projetos;

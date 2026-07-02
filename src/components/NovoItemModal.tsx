import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';
import styles from './NovoProjetoModal.module.css';

interface NovoItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projetoId: string | number;
  initialData?: any;
}

const NovoItemModal: React.FC<NovoItemModalProps> = ({ isOpen, onClose, onSuccess, projetoId, initialData }) => {
  const [naturezas, setNaturezas] = useState<any[]>([]);
  const [naturezaId, setNaturezaId] = useState('');
  const [descricao, setDescricao] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valorTotal = (parseFloat(quantidade.replace(',', '.')) || 0) * (parseFloat(valorUnitario.replace(',', '.')) || 0);

  useEffect(() => {
    if (isOpen) {
      api.get('/catalogos/naturezas').then(res => setNaturezas(res.data)).catch(console.error);
      
      if (initialData) {
        setNaturezaId(initialData.naturezaDespesaId?.toString() || '');
        setDescricao(initialData.descricao || '');
        setQuantidade(initialData.quantidadeOrcada?.toString() || '');
        setValorUnitario(initialData.valorUnitarioOrcado?.toString() || '');
      } else {
        setNaturezaId(''); setDescricao(''); setQuantidade(''); setValorUnitario('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const reset = () => {
    setNaturezaId(''); setDescricao(''); setQuantidade(''); setValorUnitario(''); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        naturezaDespesaId: parseInt(naturezaId),
        descricao: descricao || null,
        quantidadeOrcada: parseFloat(quantidade.toString().replace(',', '.')),
        valorUnitarioOrcado: parseFloat(valorUnitario.toString().replace(',', '.')),
      };
      
      if (initialData?.id) {
        await api.put(`/itens-orcados/${initialData.id}`, payload);
      } else {
        await api.post(`/projetos/${projetoId}/itens-orcados`, payload);
      }
      
      onSuccess();
      onClose();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.title || err.response?.data?.message || `Erro ao ${initialData ? 'editar' : 'criar'} item.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title={initialData ? "Editar Item" : "Criar Novo Item"}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.inputGroup}>
          <label>Categoria *</label>
          <select value={naturezaId} onChange={e => setNaturezaId(e.target.value)} required>
            <option value="">Selecione a categoria...</option>
            {naturezas.map(n => (
              <option key={n.id} value={n.id}>{n.categoria} — {n.nome}</option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Descrição *</label>
          <input
            type="text"
            placeholder="Ex: Passagem aérea, material escritório..."
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Valor Unitário (R$) *</label>
            <input type="number" step="0.01" min="0.01" value={valorUnitario} onChange={e => setValorUnitario(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Quantidade *</label>
            <input type="number" step="0.01" min="0.01" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Total</label>
          <input
            type="text"
            readOnly
            value={valorTotal > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal) : 'R$ 0,00'}
            style={{ backgroundColor: '#f8fafc', fontWeight: 600 }}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => { onClose(); reset(); }} className={styles.btnCancel}>Cancelar</button>
          <button type="submit" disabled={loading} className={styles.btnSubmit}>
            {loading ? 'Salvando...' : 'Salvar Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NovoItemModal;

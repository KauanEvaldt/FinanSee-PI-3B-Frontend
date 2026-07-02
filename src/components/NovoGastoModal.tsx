import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';
import styles from './NovoProjetoModal.module.css';

interface NovoGastoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projetoId: string | number;
  itensOrcados: any[];
  initialData?: any;
}

const NovoGastoModal: React.FC<NovoGastoModalProps> = ({ isOpen, onClose, onSuccess, projetoId, itensOrcados, initialData }) => {
  const [naturezas, setNaturezas] = useState<any[]>([]);
  const [itemOrcadoId, setItemOrcadoId] = useState('');
  const [naturezaId, setNaturezaId] = useState('');
  const [dataDespesa, setDataDespesa] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [valorUnitario, setValorUnitario] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [observacao, setObservacao] = useState('');
  const [justificativa, setJustificativa] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valorTotal = (parseFloat(quantidade.toString().replace(',', '.')) || 0) * (parseFloat(valorUnitario.toString().replace(',', '.')) || 0);

  useEffect(() => {
    if (isOpen) {
      api.get('/catalogos/naturezas').then(res => setNaturezas(res.data)).catch(console.error);

      if (initialData) {
        setItemOrcadoId(initialData.itemOrcadoId?.toString() || '');
        setNaturezaId(initialData.naturezaDespesaId?.toString() || '');
        setDataDespesa(initialData.dataDespesa ? String(initialData.dataDespesa).split('T')[0] : '');
        setQuantidade(initialData.quantidadeRealizada?.toString() || '');
        setValorUnitario(initialData.valorUnitarioRealizado?.toString() || '');
        setNumeroDocumento(initialData.numeroDocumento || '');
        setFornecedor(initialData.fornecedor || '');
        setObservacao(initialData.observacao || '');
        setJustificativa(initialData.justificativa || '');
      } else {
        setItemOrcadoId(''); setNaturezaId(''); setDataDespesa('');
        setQuantidade(''); setValorUnitario(''); setNumeroDocumento('');
        setFornecedor(''); setObservacao(''); setJustificativa('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  const reset = () => {
    setItemOrcadoId(''); setNaturezaId(''); setDataDespesa('');
    setQuantidade(''); setValorUnitario(''); setNumeroDocumento('');
    setFornecedor(''); setObservacao(''); setJustificativa(''); setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        itemOrcadoId: itemOrcadoId ? parseInt(itemOrcadoId) : null,
        naturezaDespesaId: !itemOrcadoId && naturezaId ? parseInt(naturezaId) : null,
        dataDespesa,
        quantidadeRealizada: parseFloat(quantidade.toString().replace(',', '.')),
        valorUnitarioRealizado: parseFloat(valorUnitario.toString().replace(',', '.')),
        numeroDocumento: numeroDocumento || null,
        fornecedor: fornecedor || null,
        observacao: observacao || null,
        justificativa: justificativa || null,
      };

      if (initialData?.id) {
        await api.put(`/gastos/${initialData.id}`, payload);
      } else {
        await api.post(`/projetos/${projetoId}/gastos`, payload);
      }

      onSuccess();
      onClose();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.title || err.response?.data?.message || `Erro ao ${initialData ? 'editar' : 'registrar'} gasto.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { onClose(); reset(); }} title={initialData ? "Editar Gasto" : "Registrar Novo Gasto"}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Data do Gasto *</label>
            <input type="date" value={dataDespesa} onChange={e => setDataDespesa(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Número do Documento</label>
            <input type="text" placeholder="1234" value={numeroDocumento} onChange={e => setNumeroDocumento(e.target.value)} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Item Orçado Relacionado</label>
          <select value={itemOrcadoId} onChange={e => { setItemOrcadoId(e.target.value); if (e.target.value) setNaturezaId(''); }}>
            <option value="">Nenhum — Gasto não previsto no orçamento</option>
            {itensOrcados.map(item => (
              <option key={item.id} value={item.id}>{item.categoria} — {item.descricao || item.natureza}</option>
            ))}
          </select>
        </div>

        {!itemOrcadoId && (
          <div className={styles.inputGroup}>
            <label>Categoria *</label>
            <select value={naturezaId} onChange={e => setNaturezaId(e.target.value)} required={!itemOrcadoId}>
              <option value="">Selecionar categoria...</option>
              {naturezas.map(n => (
                <option key={n.id} value={n.id}>{n.categoria} — {n.nome}</option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Quantidade *</label>
            <input type="number" step="0.01" min="0.01" value={quantidade} onChange={e => setQuantidade(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Valor Unitário (R$) *</label>
            <input type="number" step="0.01" min="0.01" value={valorUnitario} onChange={e => setValorUnitario(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label>Valor Total</label>
            <input
              type="text"
              readOnly
              value={valorTotal > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal) : 'R$ 0,00'}
              style={{ backgroundColor: '#f8fafc', fontWeight: 600 }}
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Fornecedor</label>
          <input type="text" placeholder="Ex: Restaurante X, Latam Airlines..." value={fornecedor} onChange={e => setFornecedor(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label>Observação</label>
          <input type="text" placeholder="Ex: Almoço equipe, passagem SP-Rio..." value={observacao} onChange={e => setObservacao(e.target.value)} />
        </div>

        <div className={styles.inputGroup}>
          <label>Justificativa</label>
          <input type="text" placeholder="Ex: Reposição de material imprevista..." value={justificativa} onChange={e => setJustificativa(e.target.value)} />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => { onClose(); reset(); }} className={styles.btnCancel}>Cancelar</button>
          <button type="submit" disabled={loading} className={styles.btnSubmit}>
            {loading ? 'Registrando...' : 'Confirmar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NovoGastoModal;

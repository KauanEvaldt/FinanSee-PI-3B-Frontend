import React, { useState } from 'react';
import Modal from './Modal';
import api from '../services/api';
import styles from './NovoProjetoModal.module.css';

interface NovoProjetoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NovoProjetoModal: React.FC<NovoProjetoModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [titulo, setTitulo] = useState('');
  const [numeroEdital, setNumeroEdital] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [valorTotalOrcamento, setValorTotalOrcamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/projetos', {
        titulo,
        numeroEdital,
        dataInicio,
        dataFim: dataFim || null,
        valorTotalOrcamento: parseFloat(valorTotalOrcamento.replace(',', '.'))
      });
      onSuccess();
      onClose();
      // Reset form
      setTitulo(''); setNumeroEdital(''); setDataInicio(''); setDataFim(''); setValorTotalOrcamento('');
    } catch (err: any) {
      setError(err.response?.data?.title || 'Erro ao criar projeto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Projeto">
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.inputGroup}>
          <label>Título do Projeto *</label>
          <input 
            type="text" 
            value={titulo} 
            onChange={(e) => setTitulo(e.target.value)} 
            required 
            placeholder="Ex: Pesquisa de IA"
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Nº do Edital</label>
          <input 
            type="text" 
            value={numeroEdital} 
            onChange={(e) => setNumeroEdital(e.target.value)} 
            placeholder="Ex: 001/2026"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Data de Início *</label>
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              required 
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Data de Fim</label>
            <input 
              type="date" 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Orçamento Total (R$) *</label>
          <input 
            type="number" 
            step="0.01" 
            value={valorTotalOrcamento} 
            onChange={(e) => setValorTotalOrcamento(e.target.value)} 
            required 
            placeholder="Ex: 50000.00"
          />
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
          <button type="submit" disabled={loading} className={styles.btnSubmit}>
            {loading ? 'Salvando...' : 'Salvar Projeto'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default NovoProjetoModal;

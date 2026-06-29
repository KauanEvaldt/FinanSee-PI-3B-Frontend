# FinanSee - Frontend 💰

FinanSee é uma plataforma moderna e intuitiva para o gerenciamento de orçamento e gastos de projetos. Este repositório contém **apenas a interface (Frontend)**, desenvolvida com React e Vite, focada em fornecer uma experiência rica (Aesthetics, Dark Mode, e Componentização) aos usuários.

## 🚀 Funcionalidades da Interface
- **Dashboard Resumo:** Gráficos, KPIs (Custeio vs Capital) e lista de Atividades Recentes e Alertas.
- **Gestão de Projetos:** Criação de novos projetos com listagem em Grid e status visuais de execução.
- **Detalhes e Relatórios do Projeto:** Acompanhamento de Itens Orçados e Gastos Realizados.
- **Modais Avançados:** Modais intuitivos para Registro de Gastos e Criação de Novos Itens com cálculos automáticos em tempo real.
- **Tema Escuro (Dark Mode):** Alternância instantânea de temas integrada às configurações locais (salva automaticamente).
- **Interface Responsiva:** Design limpo, uso de micro-interações, cores dinâmicas e tipografia moderna.

## 🛠️ Tecnologias Utilizadas
- **React.js** (com TypeScript)
- **Vite** (Build tool rápida)
- **Lucide React** (Ícones bonitos e consistentes)
- **Recharts** (Gráficos no Dashboard)
- **CSS Modules** (Estilização isolada)

---

## ⚙️ Como rodar o Frontend localmente

**1. Pré-requisitos:**
Certifique-se de que possui o **Node.js** instalado na sua máquina (versão 18+ recomendada).

**2. Instale as dependências:**
Abra o seu terminal **na pasta raiz deste repositório** e digite:
```bash
npm install
```

**3. Configure a URL da API (Backend):**
Caso precise rodar com o backend, abra o arquivo `src/services/api.ts` e altere a `baseURL` para a URL onde sua API .NET está rodando. O padrão atual normalmente é:
```typescript
baseURL: 'http://localhost:5116/api' // ou a porta configurada no seu backend
```

**4. Inicie o Servidor de Desenvolvimento:**
```bash
npm run dev
```

Após executar o comando acima, o Vite irá fornecer uma URL (geralmente `http://localhost:5173/`). Acesse-a no seu navegador para visualizar e interagir com o sistema.

---
**Observação:** Como este repositório contém apenas a camada Frontend, lembre-se de que as ações de salvamento e listagem dependem que a sua API (backend) correspondente esteja rodando para serem completadas com sucesso.

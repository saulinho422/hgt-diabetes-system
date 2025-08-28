# 🩺 Sistema de Controle Glicêmico (HGT)

Sistema web completo para monitoramento e análise de diabetes, desenvolvido especificamente para controle pessoal de glicemia e aplicação de insulina.

## 📊 Funcionalidades Principais

- **Dashboard Analítico**: Visão completa dos seus dados glicêmicos
- **Registro Diário**: Formulários intuitivos para entrada de dados
- **Gráficos e Relatórios**: Análises visuais avançadas
- **Alertas Inteligentes**: Notificações para valores críticos
- **Histórico Completo**: Todos os seus registros organizados
- **Exportação**: Dados em CSV/PDF para médicos

## 🏗️ Arquitetura

```
hgt-system/
├── frontend/          # React.js + Chart.js + Tailwind CSS
├── backend/           # Node.js + Express + PostgreSQL
├── database/          # Scripts SQL e migrações
├── docs/              # Documentação
└── scripts/           # Scripts de deploy e utilitários
```

## 🚀 Tecnologias

### Frontend
- **React.js** - Interface moderna e responsiva
- **Chart.js** - Gráficos interativos
- **Tailwind CSS** - Design system médico
- **PWA** - Acesso offline

### Backend
- **Node.js + Express** - API RESTful
- **PostgreSQL** - Banco de dados robusto
- **JWT** - Autenticação segura
- **Joi** - Validação de dados

### Análise de Dados
- **Estatísticas Descritivas** - Médias, desvios, percentis
- **Análise Temporal** - Tendências e padrões
- **Correlações** - Glicemia vs Insulina
- **Alertas Médicos** - Valores críticos

## 📈 Análises Implementadas

1. **Controle Glicêmico**
   - Tempo em range alvo (70-180 mg/dL)
   - Variabilidade glicêmica
   - Médias por período do dia

2. **Padrões de Insulina**
   - Doses por refeição
   - Eficácia das doses
   - Correlação com glicemia

3. **Relatórios Médicos**
   - HbA1c estimada
   - Episódios de hipo/hiperglicemia
   - Relatórios para consultas

## 🔒 Segurança

- Dados criptografados
- Backup automático
- LGPD compliant
- Acesso individual

## 📱 Recursos Mobile

- PWA responsivo
- Entrada offline
- Notificações push
- Sincronização automática

---

**Desenvolvido especificamente para controle pessoal de diabetes**

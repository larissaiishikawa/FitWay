# 📱 **FitWay – App de Dieta e Treino**

> Um aplicativo multiplataforma (iOS e Android) desenvolvido em **React Native + Expo**, focado em personalização, monitoramento e motivação do usuário para manter hábitos saudáveis.

---

## 📖 **Sumário**

* 📋 Visão Geral
* 🎯 Objetivo
* 🧠 Entendimento do Negócio
* 💡 Proposta de Solução
* 📂 Estrutura do Projeto
* 🖼 Mockups e Prototipagem
* ⚙️ Tecnologias Utilizadas
* 👥 Equipe
* 🛠 Como Executar o Projeto
* 🚀 Próximos Passos

---

## 📋 **Visão Geral**

O **FitWay** surgiu para resolver a dificuldade de manter hábitos saudáveis no dia a dia.
Nosso app permite que usuários planejem dieta, registrem refeições, acompanhem treinos e monitorem sua evolução de forma **simples, visual e intuitiva**.

---

## 🎯 **Objetivo**

✅ Criar um **MVP funcional** que permita ao usuário:

* Registrar refeições e treinos
* Visualizar metas e progresso diário
* Acompanhar relatórios semanais

---

## 🧠 **Entendimento do Negócio**

**Problema:**

* Falta de acompanhamento personalizado → frustração e abandono de metas
* Informações conflitantes e falta de tempo → hábitos inconsistentes

**Solução:**

* Aplicativo que centraliza dieta, treino e relatórios
* Interface amigável para manter engajamento
* Sistema de metas para motivação diária

---

## 💡 **Proposta de Solução**

* 🥗 **Plano alimentar** e diário de refeições
* 🏋️ **Treinos com vídeos e instruções**
* 📊 **Relatórios e gráficos** de evolução
* 🔔 **Notificações e lembretes** para manter o usuário no caminho
* ☁ **Sincronização em nuvem** (Firebase)

---

## 📂 **Estrutura do Projeto**

```bash
📦 FitWay
 ┣ 📂 app              # Estrutura principal do React Native + Expo
 ┣ 📂 assets/images   # Ícones, logos e imagens usadas no app
 ┣ 📂 components      # Componentes reutilizáveis (botões, inputs, headers)
 ┣ 📂 constants       # Variáveis globais (cores, fontes, configs)
 ┣ 📂 hooks           # Custom Hooks para lógica reutilizável
 ┣ 📂 scripts         # Scripts auxiliares
 ┣ 📜 app.json        # Configurações do Expo
 ┣ 📜 package.json    # Dependências e scripts NPM
 ┣ 📜 tsconfig.json   # Configurações de TypeScript
 ┣ 📜 eslint.config.js # Regras de lint
 ┣ 📜 README.md       # Este arquivo
```

---

## 🖼 **Mockups e Prototipagem**

📌 **Fluxo inicial do usuário:**
Login → Tela inicial (metas) → Diário alimentar → Tela de treino → Relatórios

🔗 Mockups criados no **Figma** *https://bit.ly/prototipo-fitway*

---

## ⚙️ **Tecnologias Utilizadas**

* **Framework:** React Native + Expo
* **Linguagem:** TypeScript (83,7%) + JavaScript
* **Gerenciamento de Estado:** Context API ou Redux
* **Banco de Dados:** Firebase Firestore
* **Navegação:** React Navigation
* **Validação:** Formik + Yup
* **Lint:** ESLint + Prettier

---

## 👥 **Equipe**

| Membro               | Função          |
| -------------------- | --------------- |
| **Larissa Ishikawa** | Documentação    |
| **Leonardo Fasano**  | Desenvolvimento |
| **André Agostinis**  | Desenvolvimento |
| **Roger Motoyama**   | UI/UX           |
| **Rafael Kondo**     | Desenvolvimento |

---

## 🛠 **Como Executar o Projeto**

```bash
# Clone o repositório
git clone https://github.com/larissaiishikawa/FitWay.git

# Acesse a pasta do projeto
cd FitWay

# Instale as dependências
npm install

# Rode o app no Expo
npx expo start
```

> Você pode escanear o QR Code no terminal com o **Expo Go** no celular para visualizar o app em tempo real.

---

## 🚀 **Próximos Passos**

* Criar tela de relatórios com gráficos dinâmicos
* Integrar Firebase para autenticação e banco de dados
* Implementar notificações push
* Adicionar sistema de metas gamificado
* Testes com usuários e melhorias de UX

---


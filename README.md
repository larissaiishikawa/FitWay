# 📱 **FitWay – App de Dieta e Treino**

> Um aplicativo multiplataforma (iOS e Android) desenvolvido em **React Native + Expo**, focado em personalização, monitoramento e motivação do usuário para manter hábitos saudáveis.

---

## 📋 **Visão Geral**

O **FitWay** surgiu para resolver a dificuldade de manter hábitos saudáveis no dia a dia.
O app permite que o usuário planeje a dieta, registre refeições, acompanhe treinos e monitore sua evolução de forma **simples, intuitiva e visual**.

Ele foi construído com **React Native + Expo**, usando **TypeScript**, arquitetura limpa (MVVM), componentes reutilizáveis e integração com **Firebase** para persistência de dados.

---

## 🎯 **Objetivo**

Criar um **MVP funcional** que possibilite ao usuário:

* Registrar refeições e treinos
* Manter metas e progresso diário
* Visualizar relatórios semanais e mensais
* Ter acesso a uma interface simples e rápida
* Sincronizar dados na nuvem

---

## 🧠 **Entendimento do Negócio**

### **Problema Identificado**

* Falta de acompanhamento adequado → abandono das metas
* Informações dispersas → falta de organização
* Falta de motivação visual → baixa adesão

### **Solução Proposta**

* App que centraliza dieta + treino + relatórios
* Interface amigável, sem poluição visual
* Feedback rápido e visual das metas
* Persistência de dados em cloud

---

## 💡 **Proposta de Solução**

* 🥗 **Diário alimentar completo**
* 🏋️ **Registro de treinos com duração e data**
* 📊 **Relatórios visuais de evolução**
* 🔐 **Login e autenticação com Firebase**
* ☁ **Salvamento em Firestore (NoSQL)**
* 🌓 **Tema claro e escuro automático**

---

## 📂 **Arquitetura e Estrutura do Projeto**

O FitWay utiliza o padrão **MVVM**, separando interface, lógica e dados.

```bash
📦 FitWay
 ┣ 📂 app                 # Telas, stacks e rotas (Expo Router)
 ┣ 📂 assets/images       # Imagens e ícones
 ┣ 📂 components          # Componentes reutilizáveis
 ┣ 📂 constants           # Cores, estilos, temas
 ┣ 📂 context             # AuthContext (login persistente)
 ┣ 📂 hooks               # Hooks de tema, Firestore e lógica
 ┣ 📂 scripts             # Scripts auxiliares
 ┣ 📜 firebaseConfig.ts   # Configuração do Firebase
 ┣ 📜 app.json            # Configurações Expo
 ┣ 📜 package.json        # Dependências
 ┣ 📜 tsconfig.json       # TypeScript
 ┣ 📜 eslint.config.js    # Padronização de código
 ┗ 📜 README.md
```

---

## 🗺 **Fluxo de Navegação**

* Tela inicial: Login / Cadastro
* Usuário autenticado → navegação por abas:

  * **Dashboard**
  * **Dieta**
  * **Treino**
  * **Relatórios**
  * **Explorar**

---

## 🖼 **Mockups e Prototipagem**

Protótipos criados no **Figma**:
[https://bit.ly/prototipo-fitway](https://bit.ly/prototipo-fitway)

Fluxo geral:
Login → Home → Diário → Treinos → Relatórios

---

## ⚙️ **Tecnologias Utilizadas**

* **React Native + Expo**
* **TypeScript**
* **Firebase Authentication**
* **Firestore (NoSQL)**
* **Expo Router**
* **Context API**
* **ESLint + Prettier**
* **Figma** para prototipação

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

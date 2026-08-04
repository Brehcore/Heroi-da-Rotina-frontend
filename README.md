# 🦸‍♂️ Herói da Rotina

**Transformando tarefas diárias em uma grande aventura!**

O **Herói da Rotina** é uma plataforma de gamificação para gerenciamento familiar. Ele transforma um "Contrato de Rotina e Responsabilidades" em um aplicativo interativo (Web e Mobile).

O objetivo é ajudar "Monitores" (pais/responsáveis) a gerenciar tarefas e o tempo de tela de um "Menor" (criança/adolescente), ensinando responsabilidade, organização e noções de finanças de uma forma divertida.

---

## ✨ Funcionalidades Principais

* 👨‍👩‍👧‍👦 **Gestão Familiar:** Crie famílias e adicione membros (Monitores e Menores).
* ✅ **Quadro de Tarefas:** Monitores criam tarefas diárias, semanais ou bônus (ex: "Arrumar o quarto", "Leitura diária").
* 💪 **Jornada do Herói:** O "Menor" visualiza suas tarefas e as marca como `CONCLUÍDA`.
* 👍 **Aprovação de Monitores:** Monitores validam as tarefas, podendo `APROVAR` (pagando bônus) ou `REJEITAR` (solicitando refazer ou aplicando multa).
* 🎟️ **Banco de Fichas:** Um sistema completo para gerenciar "Fichas", a moeda do app.
* 💰 **Cofrinho Digital:** Ensina educação financeira, convertendo fichas não usadas em dinheiro (com juros!).

---

## Rules of engagement Regras do Jogo

O sistema opera com base nas definições criadas pelos Monitores, que podem ser ajustadas conforme a necessidade da família:

### 🎟️ O Sistema de Fichas (A Moeda)

* **Distribuição Semanal:** O "Menor" recebe uma quantidade de fichas para utilização semanal.
* **Valor da Ficha:** Cada ficha poderá equivaler a um saldo de tempo de tela pré-definido.
* **Limites Diários de Uso:** Definir um valor máximo de fichas que podem ser gastas por dia, incentivando o planejamento e a economia.

### 🏆 Ganhando Fichas Extras (Missões Bônus - Tarefas)

O "Menor" pode ganhar fichas extras ao completar tarefas bônus:

* **Tarefas 📖:** Defina uma recompensa (nome da tarefa) e a quantidade de fichas.

### 💰 O Cofrinho (Conversão e Juros)

Esta é a mecânica central para ensinar a poupar:

* **Conversão Automática:** Defina uma conversão dos valores de cada ficha para dinheiro real (ex: 1 ficha = R$ 1,00).
* **Juros Semanais 📈:** O cofrinho ensina a poupar! Defina uma regra para rendimento em juros dos valores em dinheiro (Diário, Semanal, Mensal).

### 💀 Multas (Perda de Fichas)

* Reclamações de comportamento, desempenho escolar insatisfatório ou tarefas `REJEITADAS` podem gerar **multas em fichas**.

---

## 🛠️ Tecnologias Utilizadas

* **Backend (API):** ☕ Java 17+ (IntelliJ)
* **Framework:** 🌱 Spring Boot 3
* **Segurança:** 🔒 Spring Security (com JWT)
* **Banco de Dados:** 🐘 PostgreSQL (via 🐳 Docker)
* **Frontend (Web):** 🅰️ Angular (VS Code)
* **Mobile (App do Menor):** 📱 Webview (Android Studio) | Disponível em .apk

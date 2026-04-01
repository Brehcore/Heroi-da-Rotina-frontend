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

## Rules of engagement Regras do Jogo (Baseadas no Contrato)

O sistema opera com base nas regras do contrato familiar, que foram digitalizadas para o app:

### 🎟️ O Sistema de Fichas (A Moeda)

* **Distribuição Semanal:** O "Menor" recebe **14 Fichas** automaticamente toda segunda-feira.
* **Valor da Ficha:** Cada **1 Ficha** equivale a **30 minutos** de tempo de tela (PC ou Celular).
* **Limites Diários de Uso:**
    * **Segunda a Sexta:** Limite de 1h30min/dia (3 Fichas).
    * **Sábado e Domingo:** Limite de 4h/dia (8 Fichas).
* **Período de Provas 📚:** Os limites são reduzidos automaticamente:
    * **Segunda a Sexta:** Máximo de 1h/dia (2 Fichas).
    * **Sábado e Domingo:** Máximo de 2h/dia (4 Fichas).

### 🏆 Ganhando Fichas Extras (Missões Bônus)

O "Menor" pode ganhar fichas extras ao completar tarefas bônus:

* **Leitura 📖:** Cada 30 min de leitura = **+1 Ficha**.
* **Caligrafia ✍️:** Cada 30 min de caligrafia = **+1 Ficha**.
* *(Limite diário de 3 fichas extras)*.

### 💰 O Cofrinho (Conversão e Juros)

Esta é a mecânica central para ensinar a poupar:

* **Conversão Automática:** Ao final de cada domingo, todas as fichas que *não* foram usadas são convertidas automaticamente:
    * **R$ 0,70** por ficha (depositado no cofrinho).
    * OU **10 Game Coins** por ficha (à critério dos monitores).
* **Juros Semanais 📈:** O cofrinho ensina a poupar! A cada **R$ 7,00** acumulados, o saldo rende **R$ 0,70 de juros** na semana.

### 💀 Multas (Perda de Fichas)

* Reclamações de comportamento, desempenho escolar insatisfatório ou tarefas `REJEITADAS` podem gerar **multas em fichas**.

---

## 🛠️ Tecnologias Utilizadas

* **Backend (API):** ☕ Java 17+ (IntelliJ)
* **Framework:** 🌱 Spring Boot 3
* **Segurança:** 🔒 Spring Security (com JWT)
* **Banco de Dados:** 🐘 PostgreSQL (via 🐳 Docker)
* **Frontend (Web):** 🅰️ Angular (VS Code)
* **Mobile (App do Menor):** 📱 Java / Kotlin (Android Studio)

# Design System e Escopo do Painel da Cliente

## 1. Visão geral

Este documento define a identidade visual, o design system e a arquitetura de telas do painel da cliente para o marketplace de agendamentos. A proposta prioriza minimalismo, clareza visual, confiança, alto contraste e conversão, mantendo a estética moderna inspirada no ecossistema Booksy.

---

## 2. Diretrizes de identidade visual

### 2.1 Paleta de cores

#### Cores principais
- Primária: #0052FF
- Secundária: #00D2C4
- Accent: #FF6B6B

#### Neutros
- Fundo claro: #F8F9FA
- Superfície branca: #FFFFFF
- Texto principal: #1A1D20
- Texto secundário: #6B7280
- Bordas: #E5E7EB

#### Modo escuro
- Fundo: #121212
- Superfície: #1E1E1E
- Texto principal: #E4E6EB
- Texto secundário: #A1A1AA
- Bordas: #2C2C2C

#### Status
- Sucesso: #2ECC71
- Alerta: #E74C3C
- Atenção: #F1C40F

### 2.2 Psicologia da paleta
- Azul elétrico transmite confiança, tecnologia e precisão.
- Turquesa reforça clareza, modernidade e higiene.
- Coral/rosa proporciona acolhimento e energia, útil em ações de conversão.

---

## 3. Tipografia e escala visual

### Fontes recomendadas
- Inter
- Poppins
- Roboto

### Escala tipográfica
- H1: 28px / 700
- H2: 22px / 600
- H3: 18px / 600
- Corpo: 14px / 400
- Secundário: 12px / 400
- Botões: 14px / 600

### Diretrizes de leitura
- Títulos com bom contraste e espaçamento vertical.
- Textos de apoio em cinza médio para reduzir ruído visual.
- Linhas e blocos curtos para melhorar a legibilidade no mobile.

---

## 4. Princípios de UI

### 4.1 Bordas arredondadas
- Cards: 16px
- Botões: 12px ou 14px
- Campos de entrada: 12px

### 4.2 Sombras
- Sombras leves e suaves:
  - box-shadow: 0 4px 20px rgba(0,0,0,0.04)
  - box-shadow: 0 8px 24px rgba(0,0,0,0.06)

### 4.3 Estados interativos
- Hover: elevação leve + mudança de cor
- Active: leve compressão visual
- Disabled: opacidade reduzida e cursor padrão
- Transições: 0.2s ease

### 4.4 Espaçamento
- Espaçamento base: 8px
- Escala recomendada: 8, 12, 16, 20, 24, 32

---

## 5. Arquitetura de telas do painel da cliente

### 5.1 Navegação principal
- Home
- Agendamentos
- Favoritos
- Perfil
- Recompensas / Fidelidade

### 5.2 Fluxo de navegação sugerido
1. Abertura da app: tela de login ou onboarding
2. Home com próximo agendamento e atalhos
3. Acesso a agendamentos e histórico
4. Perfil e carteira digital
5. Recompensas e pacotes ativos
6. Avaliações pendentes

---

## 6. Estrutura das telas

### Tela 1 — Home customizada
Conteúdo principal:
- card de próximo agendamento
- favoritos
- agendar novamente
- atalhos rápidos

#### Elementos obrigatórios
- foto do estabelecimento
- nome do profissional
- serviço
- data/hora
- botão Ver direções
- botão Gerenciar

### Tela 2 — Perfil e carteira digital
Conteúdo principal:
- foto de perfil
- dados pessoais
- telefone e e-mail
- meios de pagamento salvos
- método padrão
- área de fidelidade

### Tela 3 — Central de agendamentos
Conteúdo principal:
- abas: Próximos, Passados, Cancelados
- cards de agendamento com status
- ações de cancelar ou remarcar conforme regra do negócio
- aviso de multa em caso de cancelamento tardio

### Tela 4 — Avaliações pendentes
Conteúdo principal:
- banner de feedback
- seletor de estrelas
- campo de comentário
- upload de foto
- botão de enviar avaliação

### Tela 5 — Pacotes e assinaturas
Conteúdo principal:
- lista de pacotes ativos
- contador de sessões restantes
- botão para agendar sessão restante
- data de renovação

---

## 7. Componentes de UI recomendados

### 7.1 Card de próximo agendamento
- fundo branco
- borda arredondada
- imagem de fundo ou avatar do estabelecimento
- título destacado
- botão primário e secundário

### 7.2 Card de serviço / estabelecimento
- imagem de capa
- nome do local
- avaliação em estrelas
- preço e badge de disponibilidade
- botão de reservar

### 7.3 Tabs de agenda
- estilo pill ou segmento visual
- estado ativo com cor primária
- estado inativo com neutro claro

### 7.4 Botões
- primário: azul elétrico com texto branco
- secundário: branco com borda azul
- ghost: transparente com texto cinza/azul

### 7.5 Inputs
- fundo claro
- borda sutil
- foco com borda azul e sombra leve

---

## 8. Exemplo de componente em HTML/CSS

```html
<div class="next-appointment-card">
  <div class="card-media">
    <img src="https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=800&q=80" alt="Estabelecimento">
  </div>
  <div class="card-content">
    <div class="badge">É amanhã</div>
    <h3>Manicure Studio</h3>
    <p><strong>Larissa</strong> · Corte feminino</p>
    <p>15/07 · 14:30</p>
    <div class="actions">
      <button class="btn btn-primary">Gerenciar</button>
      <button class="btn btn-secondary">Ver direções</button>
    </div>
  </div>
</div>
```

```css
body {
  font-family: Inter, sans-serif;
  background: #F8F9FA;
  color: #1A1D20;
}

.next-appointment-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  display: flex;
  gap: 14px;
  align-items: center;
}

.card-media img {
  width: 84px;
  height: 84px;
  object-fit: cover;
  border-radius: 14px;
}

.badge {
  display: inline-block;
  background: #EAF2FF;
  color: #0052FF;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 10px 12px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-primary {
  background: #0052FF;
  color: white;
}

.btn-secondary {
  background: #F8F9FA;
  color: #1A1D20;
  border: 1px solid #E5E7EB;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}
```

---

## 9. Diretrizes de layout responsivo

### 9.1 Mobile first
- Priorizar uma navegação simples e uma hierarquia visual clara.
- Componentes empilhados verticalmente.
- Botões grandes com área de toque mínima de 44px.
- Espaçamento generoso para evitar sobrecarga.

### 9.2 Tablet
- Conteúdo em duas colunas quando houver espaço suficiente.
- Cards de destaque podem ser exibidos lado a lado.

### 9.3 Web/Desktop
- Layout com maior densidade visual.
- Sidebar ou navegação superior opcional.
- Cards podem expandir para colunas de 2 ou 3 itens.

### 9.4 Regras de adaptação
- O conteúdo mais importante deve permanecer visível sem scroll excessivo.
- A navegação principal deve ser fixa ou sticky em telas maiores.
- Imagens e cards devem manter proporção e não estourar a tela.

---

## 10. Recomendações de experiência de uso

- Mostrar sempre o próximo compromisso em destaque.
- Reduzir passos na hora de remarcar ou avaliar.
- Exibir status claros em cada agendamento.
- Fazer com que o usuário veja valor rapidamente: próximos compromissos, favoritos e histórico.
- Usar linguagem clara, direta e amigável.

---

## 11. Conclusão

A interface proposta para o painel da cliente deve ser visualmente moderna, funcional, confiável e altamente conversacional. O foco é entregar uma experiência de uso simples e elegante, com navegação intuitiva, componentes reutilizáveis e uma estética alinhada à proposta do marketplace de agendamentos.

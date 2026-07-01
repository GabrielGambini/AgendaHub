# Especificação Técnica — Sistema de Agendamentos SaaS Multi-Nicho

## 1. Visão geral

Este projeto consiste em uma plataforma SaaS de agendamentos online com modelo de marketplace e gestão operacional para negócios de serviços. A proposta é suportar diferentes nichos, como cabelo, unha, estética, tatuagem, pet care, saúde, ensino particular e outros, através de uma arquitetura multi-tenant que isola dados por empresa.

A solução é composta por três frentes:

1. Banco de dados centralizado multi-tenant.
2. Painel do profissional (Biz) para gestão operacional.
3. Aplicativo do cliente (Marketplace) para descoberta, agendamento e pagamento.

---

## 2. Objetivos do produto

### Objetivos de negócio
- Permitir que profissionais e estabelecimentos gerenciem agenda, equipe, serviços, pagamentos e marketing.
- Permitir que clientes encontrem locais próximos, visualizem serviços e agendem em poucos cliques.
- Reduzir vazios, conflitos e no-shows com regras automatizadas.
- Criar uma base escalável para expansão para múltiplos nichos.

### Objetivos técnicos
- Garantir isolamento seguro de dados por merchant.
- Evitar overbooking com consistência de concorrência.
- Suportar alta disponibilidade e tempo real para agenda.
- Manter a arquitetura preparada para evoluir de monólito modular para microsserviços.

---

## 3. Arquitetura recomendada

### Estratégia geral
Recomenda-se uma abordagem de monólito modular no início, com separação clara de domínios, seguida de evolução para microsserviços quando a carga e a complexidade aumentarem.

### Arquitetura proposta
- Frontend web do profissional: Next.js + React + TypeScript
- Frontend mobile do cliente: React Native + Expo
- Backend: NestJS + TypeScript
- Banco relacional: PostgreSQL
- Cache e coordenação de tempo real: Redis
- Mensageria assíncrona: RabbitMQ ou Kafka
- Armazenamento de arquivos: S3 / Cloudflare R2
- WebSockets: Socket.IO ou Nest WebSockets com Redis Pub/Sub
- Autenticação: JWT + refresh tokens + MFA opcional
- Pagamentos: Stripe / Asaas / PagarMe / Mercado Pago
- Geolocalização: Google Maps API / Mapbox
- Notificações: Twilio, SendGrid, Firebase Cloud Messaging, WhatsApp Business API

### Padrão de implantação
- Containers Docker
- Orquestração: Kubernetes opcional para escala
- Infraestrutura: AWS / Azure / GCP
- CI/CD com GitHub Actions
- Observabilidade: OpenTelemetry + Grafana + Prometheus + Sentry

### Justificativa arquitetural
- PostgreSQL é a melhor escolha para transações, integridade e relatórios.
- Redis é ideal para cache, locks temporários e sincronização de disponibilidade.
- WebSockets evitam atrasos visuais nas agendas.
- O modelo de monólito modular reduz tempo de desenvolvimento no MVP e preserva flexibilidade futura.

---

## 4. Estratégia de multi-tenancy

### Modelo recomendado
- Um único banco de dados PostgreSQL com isolamento lógico por merchant_id.
- Cada tabela relevante deve ter coluna merchant_id.
- Uso de Row Level Security (RLS) para reforçar o isolamento a nível de banco.
- Todas as queries devem sempre filtrar por merchant_id, salvo em operações administrativas globais.

### Vantagens
- Menor custo operacional no início.
- Menor complexidade para backups, migrações e relatórios.
- Facilita o crescimento de uma empresa para múltiplos planos e domínios.

### Estratégia futura
- Se o volume crescer muito, pode-se migrar para separação por schema ou por banco por tenant.

---

## 5. Modelo de domínio principal

### Domínios funcionais
- Merchant Management
- Scheduling & Availability
- Services & Pricing
- Staff & Permissions
- Customers & Wallet
- Payments & Invoicing
- Marketing & Loyalty
- Reviews & Reputation
- Analytics & Reports

---

## 6. Dicionário de dados e modelo relacional

### Tabelas essenciais

#### merchants
- id
- name
- legal_name
- category_id
- subcategory_ids (jsonb)
- address
- latitude
- longitude
- service_radius_km
- delivery_enabled
- delivery_fee_mode
- delivery_fee_amount
- timezone
- logo_url
- cover_url
- description
- status
- created_at
- updated_at

#### users
- id
- merchant_id
- full_name
- email
- phone
- password_hash
- role
- is_active
- avatar_url
- created_at
- updated_at

#### staff
- id
- merchant_id
- user_id
- full_name
- email
- phone
- specialty
- bio
- color_tag
- is_active
- commission_type
- commission_value
- created_at
- updated_at

#### staff_shifts
- id
- merchant_id
- staff_id
- weekday
- start_time
- end_time
- is_active
- recurring_rule
- created_at
- updated_at

#### business_hours
- id
- merchant_id
- weekday
- opening_time
- closing_time
- is_closed
- created_at
- updated_at

#### services
- id
- merchant_id
- category_id
- name
- description
- duration_minutes
- base_price_cents
- is_active
- requires_staff_selection
- padding_time_minutes
- created_at
- updated_at

#### service_variants
- id
- merchant_id
- service_id
- name
- duration_minutes
- price_cents
- staff_level
- is_active
- created_at
- updated_at

#### service_combos
- id
- merchant_id
- name
- description
- total_duration_minutes
- discount_percent
- is_active
- created_at
- updated_at

#### combo_items
- id
- merchant_id
- combo_id
- service_id
- quantity
- created_at

#### addons
- id
- merchant_id
- name
- description
- price_cents
- duration_minutes
- is_active
- created_at
- updated_at

#### products
- id
- merchant_id
- name
- description
- price_cents
- stock_quantity
- is_active
- created_at
- updated_at

#### customers
- id
- merchant_id
- full_name
- email
- phone
- birth_date
- notes
- created_at
- updated_at

#### appointments
- id
- merchant_id
- customer_id
- staff_id
- service_id
- start_at
- end_at
- status
- source
- booking_token
- note
- deposit_amount_cents
- total_amount_cents
- created_at
- updated_at

#### appointment_items
- id
- merchant_id
- appointment_id
- service_id
- variant_id
- addon_id
- quantity
- unit_price_cents
- duration_minutes
- created_at

#### appointment_addons
- id
- merchant_id
- appointment_id
- addon_id
- quantity
- unit_price_cents
- created_at

#### payments
- id
- merchant_id
- appointment_id
- customer_id
- payment_provider
- provider_payment_id
- amount_cents
- currency
- status
- payment_method
- paid_at
- created_at

#### refunds
- id
- merchant_id
- payment_id
- appointment_id
- amount_cents
- reason
- status
- created_at

#### reviews
- id
- merchant_id
- appointment_id
- customer_id
- rating
- comment
- photo_url
- created_at
- updated_at

#### waiting_list_entries
- id
- merchant_id
- customer_id
- service_id
- preferred_staff_id
- preferred_datetime
- status
- notified_at
- created_at

#### blocks
- id
- merchant_id
- staff_id
- start_at
- end_at
- reason
- block_type
- created_at
- updated_at

#### loyalty_programs
- id
- merchant_id
- name
- points_rule
- reward_rule
- is_active
- created_at
- updated_at

#### loyalty_points
- id
- merchant_id
- customer_id
- points
- source
- expires_at
- created_at

### Relacionamentos principais
- merchants 1:N users
- merchants 1:N staff
- merchants 1:N services
- services 1:N service_variants
- merchants 1:N appointments
- customers 1:N appointments
- staff 1:N appointments
- appointments 1:N appointment_items
- appointments 1:N payments
- appointments 1:N reviews
- merchants 1:N blocks
- merchants 1:N waiting_list_entries

### Isolamento SaaS
- Cada tabela deve possuir merchant_id.
- Toda leitura e escrita deve filtrar por merchant_id.
- O tenant é identificado por subdomínio, token de organização ou domínio customizado.

---

## 7. Regras de negócio essenciais

### 7.1 Disponibilidade e agenda
- Um horário só pode ser reservado se estiver livre no intervalo solicitado.
- O sistema deve bloquear automaticamente o tempo de padding pós-serviço.
- Bloqueios manuais têm prioridade sobre disponibilidade padrão.
- A agenda deve mostrar disponibilidade real em tempo real.

### 7.2 Agendamento com variantes e combos
- O cliente pode escolher uma variante quando a empresa configurou múltiplas opções para o mesmo serviço.
- Combos devem calcular soma de duração e aplicar desconto configurado.
- Add-ons são opcionais e somam ao valor total.

### 7.3 Pagamentos e depósitos
- Se a empresa exigir depósito, o valor deve ser cobrado antes da confirmação do agendamento.
- O pagamento restante pode ser feito no local ou no app.
- Cancelamentos tardios podem gerar multa conforme regras do merchant.

### 7.4 No-show protection
- O no-show pode ser identificado quando o cliente não comparece ou cancela fora do prazo.
- O sistema pode bloquear novas reservas para o cliente ou cobrar taxa.

### 7.5 Permissões e RBAC
- Owner/Admin: acesso total.
- Manager: agenda, caixa e equipe, sem acesso total a relatórios financeiros sensíveis.
- Staff: visualiza e altera apenas sua própria agenda e dados básicos.

### 7.6 Regras de comissão
- Comissões podem ser percentuais, fixas ou escalonadas.
- O cálculo deve ocorrer no fechamento do período ou no momento da confirmação do serviço.

---

## 8. Fluxos de telas principais

### 8.1 Painel do profissional

#### Onboarding
1. Cadastro de conta e empresa.
2. Seleção da categoria e subcategorias.
3. Cadastro de endereço e configuração de atendimento.
4. Upload de logo, fotos de capa e galeria.
5. Definição de serviços e preços.

#### Dashboard
- Faturamento do dia/semana/mês.
- Agenda diária, semanal e visão da equipe.
- Próximos agendamentos.
- Alertas de pagamentos e faltas.

#### Agenda
- Visualização diária, semanal e por profissional.
- Drag-and-drop para remarcar.
- Bloqueios de horário e feriados.
- Fila de espera automática.

#### Serviços
- Cadastro de serviços base.
- Configuração de variantes.
- Criação de combos.
- Definição de add-ons e padding time.

#### Equipe
- Cadastro de funcionários.
- Definição de turnos e escalas.
- Definição de permissões.
- Cálculo automático de comissões.

#### Marketing e fidelização
- Campanhas de reengajamento.
- Pacotes e assinaturas.
- Programas de pontos.

#### Relatórios
- Receita bruta.
- Ticket médio.
- Taxa de ocupação.
- Retenção de clientes.
- Comissões por colaborador.

### 8.2 Aplicativo do cliente

#### Descoberta
1. Busca por serviço, palavra-chave ou categoria.
2. Filtros por distância, avaliação, preço e disponibilidade imediata.
3. Exibição de mapa e lista de resultados.

#### Perfil do estabelecimento
- Fotos, descrição, avaliações, serviços, disponibilidade e localização.

#### Fluxo de agendamento em 3 cliques
1. Escolha do serviço e adicionais.
2. Escolha do profissional ou qualquer profissional disponível.
3. Escolha do dia e horário.

#### Checkout
- Resumo do agendamento.
- Seleção de pagamento.
- Confirmação e recibo.

#### Central do cliente
- Histórico de agendamentos.
- Reagendamento/cancelamento.
- Pagamentos salvos.
- Avaliações e fotos do resultado.

---

## 9. Recomendação de stack técnica detalhada

### Frontend profissional
- Next.js 14+
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- FullCalendar ou DayPilot para agendas
- Zustand ou Redux Toolkit

### Frontend cliente
- React Native + Expo
- TypeScript
- React Navigation
- React Query/TanStack Query
- Maps SDK

### Backend
- NestJS
- TypeScript
- Prisma ORM ou TypeORM
- Validation pipes
- Event-driven architecture via RabbitMQ/Kafka
- WebSockets para sincronização em tempo real

### Banco de dados
- PostgreSQL 16+
- Redis 7+
- S3/R2 para mídia

### Segurança
- Argon2 para hash de senha
- JWT com refresh token
- Rate limiting
- Audit logs
- Encriptação em trânsito e em repouso
- PCI-compliance para dados de cartão via gateway externo

### Integrações externas
- Stripe ou Asaas para pagamentos
- Google Maps / Mapbox para localização
- Twilio / WhatsApp Business / Firebase para notificações
- SendGrid / Resend para e-mails

---

## 10. Estratégia para evitar overbooking

### Problema
Vários clientes podem tentar reservar o mesmo horário simultaneamente.

### Solução recomendada
- O backend deve usar transações e locks de linha ou versão otimista.
- Antes de confirmar uma reserva, o sistema valida disponibilidade em tempo real.
- O agendamento é criado em uma transação atômica.
- A reserva é mantida em uma fila de eventos para atualização de agenda em tempo real.

### Implementação prática
- Endpoint de pré-reserva cria um lock temporário por 60 a 90 segundos.
- Se o pagamento ou confirmação falhar, o lock é liberado.
- O cliente recebe atualização via WebSocket quando a disponibilidade muda.

---

## 11. Roadmap de APIs essenciais

### Autenticação
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

### Merchants e perfil
- GET /merchants/:id
- PATCH /merchants/:id
- GET /merchants/:id/availability

### Serviços
- GET /services
- POST /services
- GET /services/:id
- PATCH /services/:id
- DELETE /services/:id
- GET /services/:id/variants
- GET /services/:id/addons

### Equipe e turnos
- GET /staff
- POST /staff
- GET /staff/:id/shifts
- POST /staff/:id/shifts
- PATCH /staff/:id/shifts/:shiftId

### Agenda e bloqueios
- GET /appointments?date=...
- POST /appointments
- PATCH /appointments/:id
- DELETE /appointments/:id
- POST /blocks
- GET /blocks

### Clientes
- GET /customers
- POST /customers
- GET /customers/:id
- PATCH /customers/:id

### Pagamentos
- POST /payments/intent
- POST /payments/confirm
- GET /payments/:id
- POST /payments/refund

### Lista de espera
- POST /waiting-list
- GET /waiting-list
- PATCH /waiting-list/:id

### Reviews
- POST /reviews
- GET /reviews?merchantId=...

### Relatórios
- GET /analytics/summary
- GET /analytics/commission-report
- GET /analytics/occupancy

### WebSocket eventos
- subscribe: appointment.updated
- subscribe: availability.changed
- subscribe: payment.status.changed

---

## 12. Estrutura sugerida de módulos do backend

- auth
- users
- merchants
- services
- staff
- availability
- appointments
- payments
- customers
- notifications
- reviews
- analytics
- marketing
- loyalty
- media

---

## 13. MVP recomendado

Para validar o produto rapidamente, o MVP deve priorizar:
- Cadastro de merchant
- Gestão básica de serviços
- Agenda com disponibilidade
- Restrições simples de bloqueio
- Agendamento do cliente
- Pagamento com depósito ou confirmação
- Notificações por e-mail/SMS
- Avaliações básicas

### MVP v1
- 1 painel profissional web
- 1 app cliente mobile/web
- 1 merchant por conta
- 1 profissional por business
- Agenda simples
- Pagamento inicial via gateway

### Próximos incrementos
- Multi-profissional
- Variações e combos
- Fila de espera
- PDV integrado
- Fidelidade e marketing
- BI avançado

---

## 14. Considerações de UX

- Fluxo de agendamento deve ser simples, com no máximo 3 etapas principais.
- A agenda deve ser visualmente clara, com indicação de disponibilidade, bloqueios e status.
- O checkout deve mostrar preço, duração e confirmação imediata.
- A interface profissional deve ter foco em rapidez diária, não apenas em configuração.

---

## 15. Recomendação final

A melhor estratégia para este produto é construir uma plataforma SaaS com:
- Banco relacional centralizado e multi-tenant.
- Backend modular em NestJS.
- PostgreSQL + Redis + WebSockets.
- Frontend profissional em Next.js e cliente em React Native.
- Arquitetura preparada para escalabilidade sem perder consistência operacional.

Essa combinação oferece equilíbrio entre velocidade de desenvolvimento, segurança, escalabilidade e experiência de usuário, além de estar alinhada com o modelo de marketplace e gestão de negócios inspirado no ecossistema Booksy.

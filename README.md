# AgendaHub — MVP de agendamentos

## O que foi entregue

Este projeto agora possui:
- uma página pública de agendamento para clientes;
- um painel administrativo simples para gerir agenda, clientes, serviços e disponibilidade;
- armazenamento local em navegador usando localStorage;
- regras básicas de disponibilidade por dias e bloqueios de datas.

## Como usar

1. Abra a página pública em:
   - http://127.0.0.1:8000/
2. Abra o painel administrativo em:
   - http://127.0.0.1:8000/admin/index.html
3. Entre com a senha:
   - unhas2024

## Funcionalidades do MVP
- seleção de serviço;
- escolha de data e horário;
- registro de agendamento no painel;
- bloqueio de datas e configuração de horários;
- relatórios básicos por mês e serviço.

## Observações
- Os dados ficam salvos no navegador do usuário via localStorage.
- Para uso real em produção, é recomendável substituir isso por um backend com banco de dados e autenticação robusta.

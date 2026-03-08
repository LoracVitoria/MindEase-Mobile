# MindEase

Projeto Expo (Expo Router) focado em acessibilidade cognitiva.

## Requisitos atendidos (visão geral)
- Painel Cognitivo Personalizável (complexidade, foco, resumo/detalhado, contraste por intensidade, espaçamento, fonte, alertas e avisos de transição)
- Organizador de Tarefas com suporte cognitivo (Kanban simplificado, Pomodoro adaptado, checklist, transições suaves)
- Perfil do Usuário + configurações persistentes (AsyncStorage: preferências cognitivas + perfil)

## Rodar
```bash
npm install
npm run start
```

## Arquitetura
- `features/panel`, `features/tasks`, `features/profile`
- Domínio isolado em `domain/`
- Casos de uso em `application/usecases/`
- Repositórios e persistência em `infrastructure/repositories/`
- UI em `presentation/`

## Observações
- Todas as preferências ficam em `shared/stores/settings-store.ts` e persistem via AsyncStorage.
- Acessibilidade Cognitiva: complexidade ajustável, modo foco, redução de estímulos (inclui controle de animações), avisos guiados e contraste por intensidade.

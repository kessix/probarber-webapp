@AGENTS.md

# ProBarber (site)

Landing em `/` e página pública de agendamento do cliente em `/{slug}` (`/admin` é reservado). O app dos barbeiros e o
schema do banco ficam no repo irmão `probarber-app` (`supabase/migrations/`). Veja lá também `CLAUDE.md` e
`docs/pendencias.md`, com as decisões e o que falta.

## Verificar antes de dar por pronto
`npx tsc --noEmit`, `npm run lint` e `npm run build`. O lint tem um aviso antigo de `<img>` em `src/app/page.tsx`.

## Regras
- Next.js 16 com `cacheComponents`: leia `params` dentro de `<Suspense>`; route handlers são dinâmicos.
- Disponibilidade e agendamento vêm só do banco (`available_days`, `available_slots`, `create_appointment`). Não recalcular no site.
- O servidor confirma o Pix consultando o AbacatePay (`/api/pix/[id]`) e só então marca como pago. Preço e valor vêm do banco, nunca do navegador.
- E-mail (Resend) só para quem marcou notificações, no máximo uma vez (`confirmation_sent_at`). Todo texto vindo de usuário passa por `escapeHtml`.
- Chave secreta do Supabase (`NEXT_SUPABASE_SECRET_KEY`) só em código de servidor (`supabase-admin.ts`).
- A página nova só entra no ar **depois** de o usuário rodar a migração que ela usa.
- Textos do AbacatePay não aceitam caracteres como "·": passe por `plainText()`.

## Variáveis de ambiente
Valores reais só em `.env.local` (fora do git) e na Vercel. Os nomes estão em `.env.example`.

## Trabalho
Português do Brasil. Só fazer commit e push quando o usuário pedir, um repo de cada vez.

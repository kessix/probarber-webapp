# ProBarber webapp

Site e web app do ProBarber em um único projeto Next.js, servido em `probarberapp.com.br`.

| Rota | O que é |
| --- | --- |
| `/` | Landpage |
| `/{slug}` | Página pública de agendamento da barbearia (ex.: `/doisirmaos`) |
| `/admin` | Painel do barbeiro (reservada, ainda não implementada) |

## Desenvolvimento

```bash
npm install
npm run dev
```

A página `/{slug}` lê a barbearia, os serviços e os horários ocupados do Supabase (as barbearias são criadas pelo app). Variáveis de ambiente em `.env.example`.

O agendamento do cliente é gravado pela função `create_appointment` do banco (veja `supabase/schema.sql` no repositório do app). O Pix usa a AbacatePay (chave de teste `abc_dev_`).

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

Barbearias de exemplo para testar os três modos de agendamento (dados em `src/lib/barbershops.ts`):

- `/doisirmaos`: pagar no app (Pix) ou na barbearia
- `/studiodobarba`: pagamento obrigatório (Pix)
- `/barber013`: agendamento comum

Os dados e o pagamento Pix ainda são simulados. Slugs reservados ficam em `RESERVED_SLUGS`.

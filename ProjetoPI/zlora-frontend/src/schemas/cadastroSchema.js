import { z } from 'zod';

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do estabelecimento.'),
  nomecontato: z.string().trim().min(2, 'Informe o nome do contato.'),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine(
      (v) => v.length >= 10 && v.length <= 11,
      'Informe um telefone válido com DDD.'
    ),
  email: z.string().email('Informe um e-mail válido.'),
  senha: z
    .string()
    .min(6, 'Mínimo de 6 caracteres.')
    .max(15, 'Máximo de 15 caracteres.'),
  conduso: z.literal(true, {
    errorMap: () => ({ message: 'É necessário aceitar os Termos de Uso.' }),
  }),
});
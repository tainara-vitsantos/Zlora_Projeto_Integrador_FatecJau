import { z } from 'zod';

export const cadastroSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do estabelecimento.'),
  nomecontato: z.string().trim().min(2, 'Informe o nome do contato.'),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 11, 'Informe um telefone válido com DDD.'),
  email: z.string().email('Informe um e-mail válido.'),
  senha: z
    .string()
    .min(8, 'A senha deve ter no mínimo 8 caracteres.')
    .regex(/[a-zA-Z]/, 'A senha deve conter pelo menos uma letra.')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número.'),
  confirmarSenha: z.string()
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem.",
  path: ["confirmarSenha"],
}).refine((data) => data.conduso === true, {
  message: "É necessário aceitar os Termos de Uso.",
  path: ["conduso"],
});
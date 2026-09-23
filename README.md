# iPhoneCenter

Projeto inicial de site para a iPhoneCenter, com:
- página institucional responsiva;
- catálogo visual;
- formulário de solicitação de atendimento;
- consentimento para Política de Privacidade;
- API Node/Express;
- banco SQLite local;
- painel administrativo protegido por autenticação HTTP Basic.

## Como executar

1. Instale Node.js 20+.
2. Abra o terminal nesta pasta.
3. Rode:
   npm install
   ADMIN_USER=admin ADMIN_PASSWORD="uma-senha-forte" npm start

No Windows PowerShell:
   $env:ADMIN_USER="admin"
   $env:ADMIN_PASSWORD="uma-senha-forte"
   npm start

Abra http://localhost:3000

Painel: http://localhost:3000/admin

## Antes de publicar

- Troque a senha administrativa.
- Configure HTTPS no servidor.
- Revise a Política de Privacidade com os dados reais da empresa/controlador.
- Defina prazo de retenção e procedimento para atendimento aos direitos dos titulares.
- Faça backup e controle de acesso ao banco.
- Não peça senhas, códigos de autenticação, PIN, CVV ou credenciais bancárias.
- Para produção, considere rate limiting, logs de segurança, CSRF/CORS conforme arquitetura e um provedor de hospedagem confiável.

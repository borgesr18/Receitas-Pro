Desenvolva o sistema chamado Receitas Pro, uma plataforma completa para gerenciar a produção de pães e bolos, com controle total sobre receitas, custos, produção, estoque, vendas, relatórios e impressão profissional.

Desenvolva o sistema pronto para produção com tudo funcionando, botões, módulos, tudo, não quero ver nada para implantar depois. Os dados do Supabase estão abaixo.

Estruture o layout do sistema com um menu superior (header) fixo e um sidebar lateral fixo (à esquerda).
Todo o conteúdo das páginas (dashboard, cadastros, fichas técnicas, etc.) deve ser carregado dinamicamente no centro da tela, dentro de um container responsivo.
❗️O layout deve manter o header e o sidebar visíveis o tempo todo, mesmo ao rolar a página.
O conteúdo principal deve ocupar o restante do espaço, com scroll interno se necessário.

O sidebar lateral deve conter links para as seguintes seções principais: Dashboard, Fichas Técnicas, Insumos, Produtos, Produção, Vendas, Relatórios e Configurações." Isso define a estrutura de navegação primária.

Todos os formulários de cadastro devem ter validação de dados no frontend e no backend. Campos essenciais como 'nome' e 'preço' não podem ser vazios. O sistema deve exibir mensagens de erro claras e amigáveis para o usuário (ex: 'O campo nome é obrigatório') sem quebrar a aplicação.

No sidebar de aparecer Receita Pro – Sistema de fichas para panificação.

 
✅ Stack:
•	Frontend/backend: Next.js (App Router)
•	Banco de dados: Supabase (PostgreSQL)
•	ORM: Prisma
•	Hospedagem: Vercel
•	Versionamento: GitHub
 
✅ Módulos e Funcionalidades
1. Configurações
•	Categorias de receitas
•	Categorias de insumos
•	Unidades de medida (peso, volume, unidade)
•	Cadastro de usuários com permissões (admin, editor, viewer)

Adicione uma instrução para a criação de um script de "seeding" no Prisma. Exemplo: "Crie um script seed.ts que popule o banco de dados com dados iniciais essenciais. No mínimo, ele deve cadastrar as seguintes Unidades de Medida: 'Grama (g)', 'Quilograma (kg)', 'Litro (L)', 'Mililitro (ml)', 'Unidade (un)'. E as seguintes Categorias de Insumos: 'Farináceos', 'Gorduras', 'Líquidos', 'Fermentos', 'Açúcares'.
 
2. Cadastro de Insumos
•	Nome do insumo
•	Unidade de compra (ex: kg, L, lata)
•	Fator de conversão automático (para g/ml)
•	Preço por unidade de compra
•	Fornecedor
•	Data de compra
•	Tipo de insumo (farinha, gordura, fermento...)
•	Validade
•	Local de armazenamento (seca, refrigerada, congelada)
•	Histórico de preços (opcional)
 
3. Cadastro de Produtos
•	Nome do produto (ex: Bolo de Milho)
•	Categoria
•	Peso médio final (em gramas)
•	Canais de venda (varejo, atacado)
•	Tabela de preços por canal
 
4. Fichas Técnicas
•	Nome da receita
•	Descrição
•	Ingredientes com:
o	Quantidade em gramas ou ml
o	Porcentagem baseada na quantidade de farinha (100%)
•	Cálculo automático:
o	Custo total
o	Custo por grama
•	Tempo de preparo
•	Temperatura do forno
•	Modo de preparo detalhado
•	Observações técnicas (repouso, fermentação etc.)
•	Histórico de versões da ficha
 
5. Cálculo de Receita (% de Padeiro)
•	Ao informar a quantidade de farinha (ex: 1000g), o sistema:
o	Recalcula todos os ingredientes com base nas porcentagens da ficha técnica
o	Atualiza pesos, custo e rendimento
 
6. Cálculo de Preço de Venda
•	Entradas:
o	Peso final do produto (ex: 1234g)
o	Custo da receita
o	Lucro desejado (%)
o	Custo de embalagem e extras (opcional)
•	Saídas:
o	Custo por grama
o	Preço sugerido de venda
o	Markup e preço por porção
 
7. Produção
•	Seleção de ficha técnica
•	Registro de quantidade produzida
•	Consumo automático dos insumos
•	Registro de perdas (peso ou percentual)
•	Geração de lote de produção
•	Entrada no estoque de produtos finais
 
8. Estoque
•	Estoque de Insumos:
o	Entradas/saídas
o	Quantidade atual em gramas
o	Validade e lote
•	Estoque de Produtos:
o	Quantidade e peso
o	Rastreabilidade por lote
o	Validade do produto final
 
9. Vendas
•	Registro de vendas com:
o	Produto
o	Peso vendido
o	Canal de venda
o	Lucro aplicado
o	Preço final
 
10. Relatórios
•	Custo por receita
•	Lucro por produto
•	Consumo de insumos
•	Produção por período
•	Produtos mais vendidos
•	Comparativo entre versões de fichas técnicas
 
11. Impressão de Fichas Técnicas e Receitas Calculadas
•	Impressão limpa, com apenas o conteúdo da receita
•	Layout formatado para A4
•	Campos incluídos: nome, ingredientes, porcentagens, custo, modo de preparo, rendimento, versão
•	Opção de impressão via botão
•	Rota dedicada ou modal usando @media print
•	(Futuro): geração automática de PDF
 
12. Dashboard
•	Visão geral da produção, insumos, estoque e vendas
•	Indicadores: receita mais lucrativa, custo por kg médio, estoque atual em tempo real, avisos de validade

O Dashboard deve exibir 4 cards principais: 1) Total de vendas no mês, 2) Custo total de insumos no mês, 3) Quantidade de produtos em estoque, 4) Alerta de insumos com validade próxima. Abaixo dos cards, exibir um gráfico de barras com os 5 produtos mais vendidos.
 
Layout e Design (UI/UX)
•	Layout: Página centralizada com no máximo 800px de largura. Header e sidebar fixos.
•	Paleta de Cores (Tema Monocromático): O design deve seguir estritamente a paleta de tons de cinza abaixo para criar uma aparência profissional e limpa.
o	Fundo Principal (Background): Cinza bem escuro, quase preto. Ex: #111827
o	Fundo de Containers/Cards (Sidebar, Modais): Um tom de cinza um pouco mais claro. Ex: #1F2937
o	Bordas e Divisórias: Cinza sutil para separação. Ex: #374151
o	Texto Principal: Cinza muito claro, quase branco. Ex: #F9FAFB
o	Texto Secundário/Subtítulos: Cinza mais suave. Ex: #9CA3AF
o	Cor de Destaque (Botões Primários, Links, Ícones Ativos): Um cinza claro e chamativo ou até mesmo branco para contraste máximo. Ex: #FFFFFF (para o texto do botão) sobre um fundo #374151.
o	Feedback de Interação (Hover): Ao passar o mouse sobre botões ou links, eles devem clarear ou escurecer sutilmente. Por exemplo, um botão com fundo #374151 pode ir para #4B5563 no hover.

 

📦 SUPABASE – CONFIGURAÇÃO CRÍTICA PARA FUNCIONAMENTO DO SISTEMA

O sistema FichaChef deve ser totalmente funcional com o Supabase como backend. Para isso, siga as diretrizes abaixo para garantir que a conexão com o banco de dados, autenticação e permissões estejam corretas e seguras.

✅ 1. Conexão com o Supabase:
- Use corretamente as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` no `.env.local`
- Utilize `createServerComponentClient()` e `createClient()` conforme o contexto (SSR ou Client)
- Todas as rotas da API devem estar protegidas com `requireAuth()` (ou equivalente) e recuperar a sessão do usuário.

✅ 2. Autenticação:
- O sistema utiliza autenticação via Supabase JWT.
- Garanta que a sessão esteja ativa e que o `user_id` do usuário autenticado esteja sendo corretamente obtido com `supabase.auth.getUser()` ou equivalente.
- Ao inserir ou editar dados, o campo `user_id` deve ser incluído no payload e persistido na tabela.

✅ 3. RLS – Row Level Security:
- RLS deve estar **ativado** em todas as tabelas sensíveis (ex: ingredients, fichas_tecnicas, users, etc).
- Para cada tabela protegida por RLS, crie a seguinte policy de acesso:

```sql
CREATE POLICY "Allow access to own data"
ON public.nome_da_tabela
FOR SELECT, INSERT, UPDATE, DELETE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

Substitua nome_da_tabela pelo nome real da tabela.
Certifique-se de que o campo user_id existe e é preenchido corretamente.

✅ 4. Confirmação de Email:
Durante o desenvolvimento, desabilite a obrigatoriedade de confirmação de email no Supabase para evitar erro 401 Unauthorized.
Alternativamente, configure corretamente o SMTP para envio de e-mails e confirmação de conta.

✅ 5. Teste de Integração:
Após configurar tudo corretamente, faça este teste completo:
Realize login como usuário comum
Acesse qualquer formulário de cadastro (ex: ingredientes)
Tente adicionar, editar e excluir dados
Confirme se os dados foram salvos corretamente no Supabase (via SQL ou interface visual)
Verifique se a consulta mostra apenas dados pertencentes ao usuário autenticado

⚠️ Atenção:
RLS não deve ser desativado em hipótese alguma, mas sim configurado corretamente para funcionar com o sistema.
Se o campo user_id não for passado ou estiver incorreto, INSERT e UPDATE falharão silenciosamente ou gerarão erro.

⚠️ Observação Preventiva – Fator de Conversão Automático
Para que o sistema calcule corretamente a conversão de unidades (ex: de “lata de 250g” para gramas), certifique-se de que:
•	O campo "unidade de compra" esteja vinculado à tabela measurement_units
•	Essa tabela contenha um campo específico para o fator de conversão, como fator_para_grama ou fator_para_ml

Exemplo sugerido no schema.prisma:
model MeasurementUnit {
  id               String   @id @default(cuid())
  nome             String
  tipo             String   // Ex: "peso", "volume", "unidade"
  fatorParaGrama   Float?   // Ex: 1.0 para kg, 1000 para tonelada, 250 para lata de 250g
  fatorParaML      Float?   // Se aplicável para líquidos
  ingredientes     Ingredient[]
}

E no modelo Ingredient, relacione assim:

model Ingredient {
  id               String   @id @default(cuid())
  name             String
  unitId           String
  unit             MeasurementUnit @relation(fields: [unitId], references: [id])
  quantidadeCompra Float    // Quantidade comprada na unidade (ex: 1 lata)
  ...
}

🧠 A lógica de cálculo deve multiplicar quantidadeCompra * fatorParaGrama (ou fatorParaML) para obter o valor real em gramas ou ml.

✅ Scripts padrão esperados no projeto:
bash
npx prisma generate
npx prisma migrate dev --name init
npm run dev
 
📌 Considerações técnicas:
•	Todas as quantidades devem ser convertidas e manipuladas em gramas ou ml
•	Fatores de conversão devem funcionar automaticamente (ex: lata de 250g → 250g)
•	Interfaces devem ser limpas, responsivas e usáveis em desktop ou mobile
•	Código limpo, modular, documentado e pronto para escalar
 
🔜 Sugestão de início:
1.	Criar o schema.prisma com todos os relacionamentos

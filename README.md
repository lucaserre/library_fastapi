#  API Biblioteca - Sistema de Gerenciamento de Leituras

Esta é uma API RESTful de alta performance desenvolvida para gerenciar o acervo de uma biblioteca pessoal e o histórico de leituras dos usuários (`Books_Read`). O projeto foi desenhado seguindo os princípios de **Clean Architecture**, garantindo isolamento de responsabilidades, alta testabilidade e uma esteira de deploy totalmente automatizada.

##  Principais Recursos (Features)

* **Autenticação e Segurança:** Controle de acesso robusto utilizando tokens **JWT (JSON Web Tokens)** assinados e criptografia de senhas com o algoritmo recomendado **Argon2** (via `pwdlib`).
* **Gerenciamento Relacional:** Mapeamento complexo de banco de dados (Muitos-para-Muitos e Um-para-Muitos) conectando Usuários, Livros (`Items`) e Fichas de Leitura (`Books_Read`) com integridade referencial.
* **Upload Seguro de Capas (AWS S3):** Rota otimizada para upload de imagens diretamente para a nuvem da Amazon, contando com *Cláusulas de Guarda* para validação estrita de formatos permitidos e limitação de tamanho de arquivo (máx. 2MB) na memória RAM.
* **Infraestrutura como Código:** Ambiente local de desenvolvimento 100% isolado e conteinerizado via **Docker Compose**.
* **Pipeline DevOps Completo (CI/CD):** Automação de deploy para a nuvem (AWS EC2) disparada automaticamente a cada `git push` na branch principal.

---

##  Tecnologias Utilizadas (Stack Tecnológica)

* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) - Operação assíncrona e documentação automática com Swagger UI.
* **Servidor ASGI:** [Uvicorn](https://www.uvicorn.org/)
* **ORM (Mapeamento Objeto-Relacional):** [SQLAlchemy 2.0](https://www.sqlalchemy.org/) (utilizando tipagem moderna com `Mapped` e `relationship`).
* **Gerenciador de Migrações:** [Alembic](https://alembic.sqlalchemy.org/) - Histórico de evolução estrutural do banco.
* **Banco de Dados:** [PostgreSQL 15](https://www.postgresql.org/) (Produção/Desenvolvimento) e [SQLite](https://www.sqlite.org/) (Testes).
* **SDK Cloud:** [Boto3](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html) - Integração com AWS S3.
* **Containers:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
* **CI/CD:** [GitHub Actions](https://github.com/features/actions)
* **Cloud Providers:** [AWS (EC2 e S3)](https://aws.amazon.com/) e [Docker Hub](https://hub.docker.com/)

---

##  Arquitetura do Projeto

O projeto adota uma estrutura modular onde cada componente possui uma única responsabilidade (*Single Responsibility Principle*):

```text
├── .github/workflows/   # Esteira de CI/CD (Deploy Automático via deploy.yml)
├── alembic/             # Configuração e histórico de migrações do banco de dados
├── dados/               # Diretório de persistência local (quando não usando Docker)
├── routers/             # Roteadores de endpoints isolados (auth, stock, user)
├── .env.example         # Exemplo das variáveis de ambiente necessárias
├── .gitignore           # Ocultação de credenciais e pastas virtuais (venv)
├── alembic.ini          # Arquivo de inicialização do orquestrador de migrações
├── argon_encrypt.py     # Script utilitário para geração manual de hashes
├── database.py          # Configuração do Engine e Sessão do SQLAlchemy
├── docker-compose.yml   # Orquestração dos containers locais (API + Postgres)
├── Dockerfile           # Instruções de build da imagem Linux da API
├── main.py              # Ponto de entrada da aplicação (Quartel-General)
├── models.py            # Modelos físicos das tabelas do Banco de Dados
├── requirements.txt     # Dependências do projeto (lista VIP do pip)
├── schemas.py           # Validação de dados de entrada/saída (Pydantic)
├── security.py          # Lógica de senhas, JWT e dependências de autenticação
└── services.py          # Regras de negócios isoladas e integrações externas (AWS)

```

---

##  Fluxo de CI/CD e Infraestrutura

O ciclo de vida de deploy do software foi automatizado para garantir que o ambiente de produção reflita o código homologado localmente:

1. **Desenvolvimento:** O desenvolvedor realiza alterações, testa localmente com Docker e gera as migrações estruturais via `alembic revision --autogenerate`.
2. **Gatilho:** Ao realizar um `git push` para a branch `main`, o **GitHub Actions** intercepta o evento.
3. **Build:** O robô do GitHub compila o código Python em uma imagem Docker otimizada e faz o upload (*push*) para o **Docker Hub**.
4. **Deploy na Nuvem (AWS EC2):** O robô conecta via SSH no servidor da Amazon, atualiza o arquivo `docker-compose.yml`, baixa a imagem nova do Docker Hub e recria o container silenciosamente (`docker compose up -d`).
5. **Migração:** O **Alembic** roda dentro do servidor para garantir que as tabelas do PostgreSQL na nuvem se atualizem sem perda de dados.

---

##  Como Executar o Projeto Localmente

### Pré-requisitos

* Possuir o **Docker** e o **Docker Compose** instalados na máquina.
* Configurar um arquivo `.env` na raiz do projeto com base no `.env.example`.

### Passo a Passo

1. Clonar o repositório:

```bash
git clone https://github.com/seu-usuario/sua-api-biblioteca.git
cd sua-api-biblioteca

```

2. Subir a infraestrutura conteinerizada (Banco Postgres + API FastAPI):

```bash
docker compose up -d --build

```

3. Aplicar as migrações do banco de dados para desenhar as tabelas:

```bash
alembic upgrade head

```

4. Acessar a documentação interativa e testar os endpoints:

* **Swagger UI:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)


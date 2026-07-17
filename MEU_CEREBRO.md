
# 🧠 MEU CÉREBRO 

> **A Regra de Ouro da Arquitetura Limpa:** "Cada arquivo tem uma única responsabilidade. O que acontece em Vegas, fica em Vegas."

---

## 🛡️ 1. SEGURANÇA E AUTENTICAÇÃO (JWT / HASH)

* **Gerar SECRET_KEY (Windows):** `python -c "import secrets; print(secrets.token_hex(32))"`
* **A Regra do JWT:** O payload NÃO é criptografado, é apenas codificado em Base64. **NUNCA** coloque senhas ou dados sensíveis dentro dele.
* **A Regra do Hash (Argon2):** Nunca copie o 'Salt' de um usuário para outro. O algoritmo deve gerar um novo automaticamente.

---

## ☁️ 2. INTEGRAÇÕES EXTERNAS E UPLOADS (AWS S3)

* **Cláusulas de Guarda (Bateu, Voltou):** Valide os erros o mais rápido possível e pare a execução com `raise`. **Não use `else**`. Se o formato não está na lista VIP (`not in allow_formats`), chute a requisição na mesma hora (Erro 400).
* **Limite de RAM:** Nunca leia um arquivo para a memória sem checar o tamanho antes. Se for maior que 2MB (`if file.size > 2 * 1024 * 1024:`), devolva **Erro 413 (Payload Too Large)**.
* **Regra de Ouro da Nuvem:** Nunca confie num serviço externo. Envolva integrações (como o S3) num `try... except`.
* **Logs vs Usuário:** Deu erro na AWS? Registre no seu terminal com `logger.error(..., exc_info=True)` para você debugar, mas retorne um `raise HTTPException(500)` limpo para o Front-end não enxergar a sua infraestrutura.
* **Bugs Clássicos do Boto3:** * *InvalidRegionError:* A AWS não entende nomes (Norte da Virgínia). Use o código de máquina (`region_name='us-east-1'`).
* *PartialCredentials:* O Boto3 não achou a sua chave. Verifique espaços em branco no `.env`, veja se usou aspas onde não devia, ou se simplesmente engoliu uma letra ao copiar/colar.



---

## 🏗️ 3. BANCO DE DADOS, ORM E ALEMBIC

* **O Enigma do `back_populates`:** É o cabo de rede que liga duas tabelas. Eles devem apontar **um para o nome da variável do outro**, formando uma via de mão dupla.
* **O Truque das Aspas:** Se a Classe `A` precisa apontar para a Classe `B`, mas a `B` está escrita mais abaixo no arquivo, use aspas na tipagem para o Python não quebrar: `Mapped[list["ClasseB"]]`.
* **Alembic & GitHub:** Os arquivos da pasta `alembic/versions/` (as receitas do banco) **DEVEM** ir para o GitHub. A AWS precisa deles!
* **Perigo de Vazamento:** NUNCA suba o arquivo `alembic.ini` se a sua `sqlalchemy.url` estiver preenchida com senhas reais lá dentro. Puxe tudo do `.env`.

---

## 🐳 4. DOCKER E INFRAESTRUTURA (AS CICATRIZES DE GUERRA)

* **O Paradoxo do Localhost:** * Para o **Alembic** (no seu Windows), o banco está no `localhost:5432`.
* Para a **API** (presa dentro do Docker), ela não pode usar `localhost`, senão ela procura o banco dentro dela mesma. No `docker-compose.yml`, a URL deve apontar para o nome do vizinho: `db_postgres:5432`.


* **A Senha Cravada na Pedra:** O PostgreSQL **só lê** a senha do arquivo `.env` na primeira vez que ele liga. Se você mudar a senha no `.env` depois, ele vai te ignorar. **Solução:** Apague o "volume" (o pen-drive) do Postgres no Docker Desktop e rode `docker compose up -d` de novo para ele recriar do zero.
* **As Portas do Compose:** * A API precisa falar com o navegador? Mapeie `"8000:8000"`.
* O Alembic no seu PC precisa criar as tabelas no Docker? Mapeie `"5432:5432"` no serviço do banco.


* **O Erro do Cache Fantasma:** Mudou o código no PC mas o Docker continua rodando a versão velha? Force a lavagem cerebral: `docker compose build --no-cache api_biblioteca`.

---

## 🚀 5. DEPLOY E CI/CD (GitHub Actions)

* **Lavagem Cerebral do Git (Arquivo Vazado):** Se o `.gitignore` falhou e arquivos proibidos subiram, rode: `git rm -r --cached .` -> `git add .` -> `git status`.
* **O Robô de Deploy:** Com as chaves no *GitHub Secrets*, o `deploy.yml` constrói a imagem, envia pro DockerHub, entra no EC2 via SSH, derruba o contêiner velho e levanta o novo usando o seu `docker-compose.yml` da nuvem.

---

## 🦇 6. O CINTO DE UTILIDADES (O QUE FAZ O QUÊ)

* **FastAPI + APIRouter:** O garçom. Recebe o pedido HTTP e divide a carga em departamentos (arquivos separados).
* **Pydantic:** O segurança da porta. Define a forma exata dos dados (JSON) de entrada e saída.
* **SQLAlchemy:** O tradutor. Você escreve Python puro, ele vomita código SQL na porta do banco de dados.
* **Alembic:** O Arquiteto. Lê seus arquivos Python, compara com o banco e cria o script de atualização sem apagar os dados do cliente.
* **Docker:** O Caminhão de Mudança. Congela seu código numa caixa Linux isolada que funciona idêntica no seu Windows e no servidor da Amazon.
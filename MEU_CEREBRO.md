# ==========================================
# FASE 4: SEGURANÇA E CRIPTOGRAFIA (JWT / HASH)
# ==========================================

# Comando para gerar uma SECRET_KEY segura nativamente no Windows com Python:
python -c "import secrets; print(secrets.token_hex(32))"

# Como gerar o Hash de uma senha usando Argon2 (pwdlib) sem overengineering:
# No terminal interativo do Python:
from pwdlib import PasswordHash
password_hash = PasswordHash.recommended()
print(password_hash.hash("sua_senha_aqui"))

# Regra de Ouro do JWT:
# O payload (corpo) do token NÃO é criptografado, é apenas codificado em Base64 e assinado.
# NUNCA colocar senhas ou dados sensíveis dentro do token. 

# Regra de Ouro do HASH:
# NUNCA repita ou copie o 'Salt' de um usuário para outro. O Salt deve ser gerado aleatoriamente pelo algoritmo a cada nova senha.

# ==========================================
# FASE 5: BANCO DE DADOS E ORM (SQLAlchemy + SQLite)
# ==========================================

# Instalação do ORM (O Tradutor de Python para SQL):
pip install sqlalchemy

# Arquitetura Básica:
# 1. database.py -> Cria o 'engine' (motor) e abre a conexão com o arquivo .db.
# 2. models.py -> Cria as tabelas do banco. 1 Classe Python = 1 Tabela. Atributos = Colunas.
# 3. main.py -> Usa a Sessão (db: Session) para fazer db.add(), db.commit() e db.refresh().

# Tratamento de Caminho e Permissão (Windows vs Linux):
# O SQLite não cria pastas sozinho. Para evitar erros no Windows, force a criação do diretório no database.py:
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "dados", "biblioteca.db")
os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True) # O trator de diretórios

# ==========================================
# FASE 6: ATUALIZAÇÃO E PERSISTÊNCIA NA NUVEM (Deploy 2.0)
# ==========================================

# Regra Crítica: Sempre atualize o requirements.txt local antes de "buildar" uma imagem nova!

# 1. Reconstrói a imagem localmente com o código novo (o "." indica a pasta atual):
docker build -t SEU_USUARIO/minha-api:latest .

# 2. Empurra a imagem nova por cima da velha no Docker Hub:
docker push SEU_USUARIO/minha-api:latest

# --- DENTRO DO SERVIDOR AWS (Via SSH) ---

# 3. Para o contêiner antigo que está rodando:
sudo docker stop api-biblioteca

# 4. Deleta o contêiner antigo (O contêiner é descartável!):
sudo docker rm api-biblioteca

# 5. Puxa a versão nova atualizada do Docker Hub:
sudo docker pull SEU_USUARIO/minha-api:latest

# 6. O Lançamento Blindado com VOLUME (Obrigatório para não perder o Banco de Dados):
# O parâmetro '-v nome_volume:/caminho/no/conteiner' cria um "pen-drive" na AWS.
sudo docker run -d --name api-biblioteca -p 8000:8000 -v volume_banco:/app/dados SEU_USUARIO/minha-api:latest

# ==========================================
# FASE 7: CI/CD E GESTÃO DE REPOSITÓRIO (GitHub)
# ==========================================

# Regra Crítica de Segurança:
# NUNCA envie .env, chaves .pem ou bancos de dados reais para o GitHub. Use o arquivo .gitignore.

# Comando de Emergência (Lavagem Cerebral do Git):
# Se o Git engolir arquivos proibidos e o .gitignore não estiver funcionando, limpe o cache:
git rm -r --cached .
git add .
git status

# Estrutura do GitHub Actions (O Robô de Deploy):
# O arquivo de automação deve OBRIGATORIAMENTE ficar neste caminho na raiz do projeto:
# .github/workflows/deploy.yml

# Automação Industrial:
# Com as chaves salvas no GitHub Secrets (AWS_HOST, DOCKER_PASSWORD, etc), 
# um simples "git push" dispara o robô que faz o build, entra via SSH e atualiza a nuvem automaticamente.

# ==========================================
# FASE 8: CLEAN ARCHITECTURE E BOAS PRÁTICAS
# ==========================================

# A Regra de Ouro da Arquitetura Limpa:
# "Cada arquivo tem uma única responsabilidade. O que acontece em Vegas, fica em Vegas."

# 1. Roteadores (APIRouter): Departamentos isolados (auth.py, stock.py, user.py). 
# O main.py vira apenas um "Quartel General" que liga a tomada e não tem lógica de negócios.
# 2. Schemas (Pydantic): O catálogo de moldes. Define apenas a FORMA geométrica dos dados de entrada/saída.
# 3. Security/Dependencies: O motor do carro. Isola as conexões com o banco (get_db) e validações de token para evitar o "Erro de Importação Circular".

# Regra de Ouro do CRUD e RESTful:
# POST   = Criar (Insert)
# GET    = Ler (Select)
# PUT    = Atualizar tudo (Update)
# DELETE = Apagar (Delete)

# ==========================================
# FASE 9: O CATÁLOGO DE FERRAMENTAS (O Cinto do Batman)
# ==========================================

# FastAPI + APIRouter: O garçom da API. Recebe o pedido do cliente (HTTP) e leva pra cozinha.
# Pydantic: O segurança da porta. Só deixa entrar o formato de dado (JSON) exato que foi definido.
# SQLAlchemy: O tradutor (ORM). Você escreve Python, ele traduz para SQL puro pro banco entender.
# Alembic: O Arquiteto Civil. Guarda as "plantas" (migrações) do banco de dados e cria/altera colunas sem apagar os dados existentes.
# Docker / DockerHub: O caminhão de mudança. Empacota todo o seu sistema (código + Linux + Python) num contêiner padronizado que roda em qualquer PC do planeta.
# GitHub Actions (CI/CD): A Esteira DevOps. Um robô que vigia seu código; quando você dá 'git push', ele automaticamente constrói a imagem nova e atualiza a AWS sozinho.
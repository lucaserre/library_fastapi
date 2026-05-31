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
# Se o contêiner morrer, os dados da pasta /app/dados sobrevivem.
sudo docker run -d --name api-biblioteca -p 8000:8000 -v volume_banco:/app/dados SEU_USUARIO/minha-api:latest
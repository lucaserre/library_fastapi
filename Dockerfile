# 1. Pega um Linux levinho já com Python 3.10 instalado
FROM python:3.10-slim

# 2. Cria uma pasta chamada /app dentro do Linux e entra nela
WORKDIR /app

# 3. Copia a nossa lista de compras para dentro do Linux
COPY requirements.txt .

# 4. Manda o Linux instalar a FastAPI e o Uvicorn
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copia o seu código (estoque.py) e tudo mais para dentro do Linux
COPY . .

# 6. Avisa que o servidor vai escutar a porta 8000
EXPOSE 8000

# 7. O comando que liga o servidor quando o contêiner nascer
# ATENÇÃO: Se o seu arquivo python não se chamar "estoque.py", mude a palavra "estoque" abaixo para o nome correto do seu arquivo.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
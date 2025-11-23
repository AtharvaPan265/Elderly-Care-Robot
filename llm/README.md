# Setup

**Instructions using pip**
1. make a venv in `./LLM`
```sh
python3 -m venv .venv
```
2. source the venv
```sh
source .venv/bin/activate
```
3. install the requirements
```sh
pip install -r requirements.txt
```

**Instructions using uv**
1. create the venv 
```sh
uv venv --python 3.11
```
2. source the venv
```sh
source .venv/bin/activate
```
3. install the reqirements
```sh
uv add -r requirements.txt
```

# Running Langraph API

Once the Enviroment is setup create a `.env` file and fill the following fields witht teh api keys
```
GOOGLE_API_KEY=
TAVILY_API_KEY=
```

then you can run the langraph server in your terminal

```sh
langraph dev
```

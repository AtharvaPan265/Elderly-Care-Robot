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

Once the Enviroment is setup create a `.env` file and fill the following fields witht the api keys
```
GOOGLE_API_KEY=
TAVILY_API_KEY=
```

then you can run the langraph server in your terminal

```sh
langraph dev
```

# Using the js funcitons

you should be able to use the javascript funcitons to chat with the LLM, an example of it would be in `langgraph-test/chat_test.js`
You need to install the langraph-sdk

```sh
npm install @langchain/langgraph-sdk
```

If you want to ask gpt for modifictations etc. make sure you specify that the langraph api is hosted via `langraph dev`
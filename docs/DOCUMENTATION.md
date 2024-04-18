# Documentation

Due to the complexity of the project, we have decided to split the documentation into multiple parts.
This 'wiki' file will explain what documentation type does what.
Some documentation types require generation by the user (PyDoc & JSDoc), please see below how to do so.

In general, the documentation is divided into the following parts:
- General documentation (auth flows, API conventions, etc.): see [docs/](/)
- REST API: see [API.md](docs/API.md) and the Swagger documentation at `http://127.0.0.1:5000/api/docs` (when running the debug server locally with `APP_SWAGGER_ENABLED=true`)
- Entity-Relationship (ER) diagram: see diagram at draw.io [here](https://app.diagrams.net/#G1Ebpmnr3K95WjVUidBHmZOvmErXOZngmG#%7B%22pageId%22%3A%22qTOhjs8H4DzsFOw5SEp2%22%7D)
- Backend code documentation: see PyDoc documentation at `/pydocs`
- Frontend code documentation: see JSDoc documentation at `/jsDocs`
- High-level user manual, with links to technical details: see [USER_MANUAL.md](/docs/USER_MANUAL.md)
- Test cases: see [TEST_INDEX.md](/test-cases/TEST_INDEX.md)
- Used assets: see [credits.txt](/static/credits.txt)

### Backend code documentation
The backend code documentation is generated using PyDoc. 

To generate the documentation, run the app with `APP_GENERATE_DOCS=true` in your environment variables. 
Then, HTML documentation will be generated in the `pydocs` folder, starting from the `index.html` file.

### Frontend code documentation
The frontend code documentation is generated using JSDoc and therefore requires the usage of the `npm` package manager.
First, setup the project. You only have to do this step once:
```bash
sudo npm install -g jsdoc
sudo npm install @ckeditor/jsdoc-plugins
```
Then, to generate the documentation, run the following command from the root directory of the project:
```bash
jsdoc -c jsdoc.json
```
Then, HTML documentation will be generated in the `jsDocs` folder, starting from the `index.html` file.


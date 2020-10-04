# ensimag-cod

### Introduction
    Dans le cadre du Challenge Open Data nous avons développé une WebApp, dont le but est de permettre à l’utilisateur la visualisation de manière interactive d’un jeu de données.
    L’application développée par nos soins s’inscrit dans le cadre des débats et manifestations contre les bavures policières déclenchées par la mort tragique de George Floyd le 25 mai dernier. Elle a pour but de mettre en avant le caractère raciste de la police américaine. En effet les victimes des tirs de la police américaine sont catégorisés par ethnicité, âge, type d’arme , etc.

### Source:
    Nous avons choisi un jeu de données qui recense tous les tirs de la police américaine de Février 2015 à Juin 2020, ce jeu de données provient du site The Washington Post et regroupe les informations suivantes : Nom, Age, Ethnie, Lieu, type d’arme portée …
    Nous avons également utilisé un autre jeu de données qui recense les distributions ethniques dans chaque état américain. 

### To open the website:
- Browse to webapp/dist: `cd webapp/dist`.
- Open `index.html` in a web browser.

### To preprocess the files (Already Done):
- Install pandas: `pip install pandas`.
- Exectue `python3 preprocessing/preprocessor.py`.

### To run the project in developpement mode:
- Browse to webapp: `cd webapp`.
- Install dependencies using npm: `npm install`.
- Run `npm run dev`.

### To rebuild the project:
- Browse to webapp: `cd webapp`.
- Install dependencies using npm if not already installed: `npm install`.
- Run `npm run clean`.
- Run `npm run build`.
- Browse to dist to find the compiled version: `cd dist`.

# Deployment Handleiding: scan.vat39.nl

Om de app op **scan.vat39.nl** te krijgen, moet deze op een publieke server worden gehost. Omdat ik (Trae) lokaal op jouw computer draai, kan ik niet direct publiceren naar jouw domein zonder externe hosting.

De makkelijkste en beste manier voor Next.js apps is **Vercel** (de makers van Next.js).

## Stap 1: Code naar GitHub (of GitLab/Bitbucket)
Zorg dat deze code in een GitHub repository staat.
1. Maak een repo aan op GitHub.com.
2. Push deze code daarheen.

## Stap 2: Deployen op Vercel
1. Ga naar [vercel.com](https://vercel.com) en log in (kan met GitHub).
2. Klik op **"Add New..."** -> **"Project"**.
3. Importeer je GitHub repository.
4. **BELANGRIJK:** Voeg bij "Environment Variables" de sleutel `GEMINI_API_KEY` toe (voor de AI scanner).
5. Klik op **Deploy**.

## Stap 2.1: Updaten of Herstarten (Redeploy)
Als je later een Environment Variable (zoals de API key) toevoegt:
1. Ga naar je project in Vercel.
2. Ga naar de tab **Deployments**.
3. Klik op de drie puntjes (...) naast de bovenste/laatste deployment.
4. Kies **Redeploy**.
OF: Doe een nieuwe 'push' naar GitHub (elke codewijziging start automatisch een nieuwe deploy).

## Stap 3: Domein Koppelen (scan.vat39.nl)
Zodra de app online staat op een `vercel.app` domein:
1. Ga in Vercel naar je project dashboard.
2. Klik op **Settings** -> **Domains**.
3. Vul in: `scan.vat39.nl` en klik op **Add**.
4. Vercel geeft je nu DNS instellingen (meestal een **CNAME** record naar `cname.vercel-dns.com`).

## Stap 4: DNS Instellen
1. Log in bij je domein host (waar je `vat39.nl` hebt gekocht).
2. Ga naar DNS beheer.
3. Voeg een **CNAME** record toe:
   - **Naam/Host:** `scan`
   - **Waarde/Doel:** `cname.vercel-dns.com` (of wat Vercel aangeeft).
4. Wacht tot de DNS is bijgewerkt (kan 1-24 uur duren).

Nu is je app bereikbaar op `https://scan.vat39.nl`!

## Alternatief: VPS / Eigen Server
Als je een eigen VPS hebt, kun je de app bouwen en draaien met Docker of Node.js, maar Vercel is veel eenvoudiger voor onderhoud en SSL (https) certificaten.

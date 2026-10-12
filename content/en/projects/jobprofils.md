---
title: JobProfils
description: A recruitment platform where the soft skills observed in an interview end up visible on the candidate's profile.
year: 2025
stack:
  - Laravel
  - Nuxt
  - PostgreSQL
  - Tailwind CSS
url: "https://jobprofils.com"
cover: "/projects/jobprofils/01-accueil.jpg"
featured: true
order: 1
---

# JobProfils

An interview says far more than a CV: how someone explains, listens and qualifies what they claim. None of it survives the end of the conversation, and the next candidate starts from zero. JobProfils lets recruiters record the soft skills they observed during an interview, then surfaces them on the candidate's profile — observed in a real situation rather than self-declared.

I lead the development of the product, from the architecture down to coordinating the team.

## What it does

- The recruiter records observed strengths and areas for improvement on a structured grid: ten soft skills minimum per interview, four job levels.
- Strengths appear on the candidate's profile, visible to recruiters on the platform. Areas for improvement stay private until the candidate chooses to share them with a coach.
- Three distinct spaces coexist: candidates, recruiters and coaches.

![The three audiences of the platform](/projects/jobprofils/05-rejoindre.jpg)

## How it is built

![The candidate journey in three steps](/projects/jobprofils/02-comment-ca-marche.jpg)

One monorepo, four applications: the marketing site, the candidate app, the back office and the API. Laravel and PostgreSQL on the server, Nuxt in the browser.

![What each audience gets out of it](/projects/jobprofils/03-avantages.jpg)

![A profile enriched by interview feedback](/projects/jobprofils/04-profil-exemple.jpg)

## What I took from it

Almost every interface decision ended up following from a single rule: a strength is public, an area for improvement is not. Getting that boundary right in the domain model saved us from re-arguing it screen by screen.

[← All projects](/en/projects)

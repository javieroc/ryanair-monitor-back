# Ryan-Fail Backend

## Motivation  

The purpose of this repository is to deepen my understanding of [`NestJS`](https://nestjs.com/) and [`MongoDB`](https://www.mongodb.com/) by cloning the website [FailBondi](https://failbondi.fail/). FailBondi provides real-time flight data and insights about **Flybondi**, a low-cost airline from Argentina.  

Building on their idea, this project applies the same concept to **Ryanair**, another well-known low-cost airline. The goal is to track Ryanair's flight operations, providing users with relevant and structured data.  

## Tech Stack  

This project is built using the following technologies:  

- [`TypeScript`](https://www.typescriptlang.org/) – A strongly typed programming language that builds on JavaScript  
- [`NestJS`](https://nestjs.com/) – A progressive Node.js framework for building scalable and efficient server-side applications  
- [`MongoDB`](https://www.mongodb.com/) – A flexible and scalable NoSQL database used for storing flight data  

## How It Works  

The backend fetches real-time flight data from the [`AviationStack`](https://aviationstack.com/) API, processes it, and stores it in a **MongoDB** database. The structured data is then exposed through a set of RESTful API endpoints, allowing users to retrieve relevant flight information.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Timeline interaktif dan cabang alternatif

Pada hasil simulasi, pilih **Bagaimana jika keputusannya berbeda?** pada salah satu peristiwa timeline. Pilih salah satu dari dua pendekatan yang tersedia untuk meminta AI menyusun tiga peristiwa lanjutan sebagai cabang alternatif. Fitur ini memakai endpoint `POST /api/generate-scenario/branch` dan konfigurasi Groq yang sama dengan generator skenario.

Salin `server/.env.example` menjadi `server/.env`, lalu isi `GROQ_API_KEY` dengan API key milikmu sebelum menjalankan backend. Jangan membagikan atau mengunggah file `.env` yang berisi API key.

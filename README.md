This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


/src
  /app
    /(auth)              # Groupe de routes pour Login/Register
    /(dashboard)         # Layout avec Sidebar pour gérer ses arbres
    /tree/[treeId]       # LA page principale (l'éditeur de l'arbre)
      page.tsx
      layout.tsx
  /components
    /canvas              # Tout ce qui concerne React Flow
      FamilyTree.tsx     # Le composant parent du tableau blanc
      FamilyNode.tsx     # Le design spécifique "Style n8n"
      CustomEdge.tsx     # Le style des lignes de connexion
      Toolbar.tsx        # Zoom, Undo, Boutons d'ajout
    /ui                  # Composants Shadcn/UI (Button, Dialog, Avatar)
    /shared              # Navbar, ThemeSwitcher, etc.
  /hooks
    useTreeData.ts       # Hook pour fetch/update Firestore en temps réel
    usePermissions.ts    # Pour vérifier si l'user est owner ou invité
  /lib
    firebase.ts          # Config Firebase Client
    firebaseAdmin.ts     # Config Firebase Admin (pour les serveurs)
    /utils               # Fonctions pour transformer les données de l'arbre
  /store                 # Si tu utilises Zustand (recommandé pour React Flow)
    useTreeStore.ts
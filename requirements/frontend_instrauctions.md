# Project overview
Use this guide to build a web app where users can give a text prompt to genrate emoji using model hosted on Replicate.

# Feature requirements
 - We will use Next.js, shadcn, lucide icons, tailwind, Supabase, Clerk
 - Create a form where user can enter text prompt, and click on a button that calls Replicate API to generate an emoji.
 - Have a nice UI and animation when generating emoji
 - Display the generated emojis in a grid
 - When hover on an emoji, display the prompt that generated the emoji with a "copy" icon button.
 - Show an icon button for downloading the emoji, and an icon button for like should be shown up.
 - We will use Replicate API to generate emoji
 - We will use ngrok to expose our local server to the internet

# Relevant docs
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
const output = await replicate.run(
  "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
  {
    input: {
      width: 1024,
      height: 1024,
      prompt: "A TOK emoji of a man",
      refine: "no_refiner",
      scheduler: "K_EULER",
      lora_scale: 0.6,
      num_outputs: 1,
      guidance_scale: 7.5,
      apply_watermark: false,
      high_noise_frac: 0.8,
      negative_prompt: "",
      prompt_strength: 0.8,
      num_inference_steps: 50
    }
  }
);
console.log(output);

# Current file structure
EMOJ-GENERATOR
├── .next
├── app
│   ├── fonts
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   └── ui
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib
│   └── utils.ts
├── node_modules
├── requirements
│   └── frontend_instrauctions.md
├── .eslintrc.json
├── .gitignore
├── components.json
├── next-env.d.ts
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.ts
└── tsconfig.json

# Rules
- All new components should be in components and named like example-component.tsx, unless otherwise specified
- All new pages should be in app/ and named like example-page.tsx, unless otherwise specified

# 🍳 სამზარეულო კალკულაცია

მობილური ვებ-აპლიკაცია სამზარეულოსთვის — კერძების ღირებულების კალკულაცია.

## ✨ ფუნქციები

| ჩანართი | აღწერა |
|---------|--------|
| 🧪 ნახევრადფაბრიკატი | N ულუფის bulk კალკულაცია (მაგ: 50 ულუფა) |
| 🍽️ 1 ულუფა | ერთი კერძის კალკულაცია |
| 📋 სია | ყველა შენახული კალკულაცია, ძიებით |

## 🚀 გაშვება

### 1. Supabase ცხრილის შექმნა

1. გახსენით [supabase.com](https://supabase.com) → თქვენი პროექტი
2. **SQL Editor** → New Query
3. დააკოპირეთ `supabase_schema.sql` შიგთავსი და გაუშვით (**Run**)

### 2. `.env` ფაილის კონფიგურაცია

```bash
cp .env.example .env
```

შეავსეთ `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> **სად ნახოთ:**  
> Supabase Dashboard → Settings → API → Project URL & anon public key

### 3. დაყენება და გაშვება

```bash
npm install
npm run dev
```

ბრაუზერში გახსენით: `http://localhost:5173`

### 4. Build (GitHub Pages / Vercel)

```bash
npm run build
```

## 📤 GitHub-ზე ატვირთვა

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/kitchen-calc.git
git push -u origin main
```

> ⚠️ `.env` ფაილი `.gitignore`-ში არის — **არასდროს** ატვირთოთ GitHub-ზე!  
> Vercel/Netlify-ზე environment variables dashboard-ში შეიყვანეთ.

## 🗄️ მონაცემთა სტრუქტურა

### `calculations` ცხრილი

| სვეტი | ტიპი | აღწერა |
|-------|------|--------|
| `id` | UUID | უნიკალური ID |
| `type` | TEXT | `bulk` ან `portion` |
| `name` | TEXT | კალკულაციის სახელი |
| `category` | TEXT | კატეგორია |
| `servings` | INT | ულუფების რაოდენობა |
| `yield_amount` | NUMERIC | გამოსავლიანობა |
| `yield_unit` | TEXT | ერთეული (გ/მლ/კგ) |
| `ingredients` | JSONB | `[{name, qty_g, price_per_kg, cost}]` |
| `total_cost` | NUMERIC | ჯამური ღირებულება |
| `cost_per_serving` | NUMERIC | 1 ულუფის ღირებულება |
| `cost_per_unit` | NUMERIC | 1 გ/მლ-ს ღირებულება |
| `note` | TEXT | შენიშვნა |
| `created_at` | TIMESTAMPTZ | შექმნის დრო |

## 🛠 ტექნოლოგიები

- **React 18** + **Vite**
- **Supabase** (PostgreSQL + REST API)
- CSS-in-JS (ბიბლიოთეკების გარეშე)

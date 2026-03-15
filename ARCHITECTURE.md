# Mantez Reels — Architecture & Technical Reference

> **DO NOT DEPLOY THIS FILE TO PRODUCTION** — Remove before release.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (CRA via CRACO) | 19.x |
| Styling | Tailwind CSS + Shadcn/UI | 3.x |
| State | Zustand + React Context | 5.x |
| Drag & Drop | @dnd-kit | 6.x |
| Animation | Framer Motion | 12.x |
| Backend | FastAPI (async) | 0.110.x |
| Database | MongoDB (Motor async driver) | 7.x |
| Auth | JWT (PyJWT) + bcrypt | — |
| Storage | Cloudflare R2 (S3-compatible) | — |
| Deployment | Render.com / Docker | — |

## Directory Structure

```
/
├── backend/
│   ├── server.py                 # FastAPI app, middleware, startup
│   ├── auth.py                   # JWT auth, require_auth dependency
│   ├── database.py               # MongoDB connection via DatabaseProxy
│   ├── security_utils.py         # HTML sanitizer, input validation
│   ├── file_scanner.py           # ClamAV malware scanning (optional)
│   ├── media_optimizer.py        # Image/video optimization (Pillow, ffmpeg)
│   ├── create_admin.py           # CLI: create admin user
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Dev/test dependencies
│   ├── routes/
│   │   ├── auth_routes.py        # /api/auth/* (login, register, me, password)
│   │   ├── content_routes.py     # /api/content/* (hero, about, services, etc.)
│   │   ├── content_query_routes.py # /api/content/query, /api/content/items
│   │   ├── contact_routes.py     # /api/contact/* (submit, messages, reply)
│   │   ├── media_routes.py       # /api/media/* (upload, list, delete, R2)
│   │   ├── portfolio_routes.py   # /api/portfolio/* (CRUD, categories)
│   │   ├── settings_routes.py    # /api/settings/* (site config, storage test)
│   │   ├── user_routes.py        # /api/users/* (admin user management)
│   │   ├── pages_routes.py       # /api/pages/* (page builder CRUD, versions)
│   │   ├── theme_routes.py       # /api/theme/* (global styles, presets)
│   │   ├── feature_routes.py     # /api/admin/features (feature flags)
│   │   ├── activity_routes.py    # /api/activity/* (audit logs)
│   │   ├── integrations_routes.py # /api/integrations/* (email, storage, monitoring)
│   │   ├── security_routes.py    # /api/security/* (WAF, Cloudflare)
│   │   ├── analytics_proxy_routes.py # /proxy/stats (PostHog proxy)
│   │   ├── metrics_routes.py     # /api/metrics (performance)
│   │   ├── animation_routes.py   # /api/animations (CSS generation)
│   │   └── ai_routes.py          # /api/ai (AI features)
│   ├── services/
│   │   ├── email_service.py      # SMTP email sending
│   │   └── storage_service.py    # Cloudflare R2 storage
│   └── tests/                    # Backend test suite
├── frontend/
│   ├── src/
│   │   ├── App.js                # Root component, routing, lazy loading
│   │   ├── index.js              # Entry point, hydration support
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx    # Admin panel (tabbed)
│   │   │   ├── LoginPage.jsx         # Auth page
│   │   │   ├── ProjectsPage.jsx      # Public projects gallery
│   │   │   ├── PrivacyPolicy.jsx     # Privacy policy page
│   │   │   ├── ThemePreview.jsx      # Theme preview
│   │   │   └── VisualBuilder.jsx     # Page builder (3-pane layout)
│   │   ├── components/
│   │   │   ├── Hero.jsx, About.jsx, Services.jsx, etc. # Public sections
│   │   │   ├── admin/            # Admin panel components
│   │   │   ├── themeBuilder/     # Page builder components
│   │   │   ├── ui/               # Shadcn/UI primitives
│   │   │   └── animations/       # Framer Motion components
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx           # JWT auth state
│   │   │   ├── ThemeContext.jsx          # Public theme
│   │   │   ├── AdminThemeContext.jsx     # Admin theme
│   │   │   ├── SettingsContext.jsx       # Site settings
│   │   │   ├── FeatureFlagContext.jsx    # Feature flags
│   │   │   ├── ThemeEditorContext.jsx    # Page builder state
│   │   │   ├── ComponentRegistryContext.jsx # Component registry
│   │   │   ├── PanelNavigationContext.jsx   # Panel nav history
│   │   │   └── DndProvider.jsx           # @dnd-kit provider
│   │   ├── store/useStore.js     # Zustand global store
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Helpers, sanitization, perf
│   ├── craco.config.js           # Webpack customization (@ alias, chunks)
│   ├── server.js                 # Production Express server
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── .env.example (backend)
```

## Database Collections

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `users` | Admin accounts | username, email, password_hash, role |
| `portfolio` | Portfolio items | title, slug, media_id, category |
| `media` | Uploaded files | filename, url, storage_type, sizes |
| `contacts` | Contact messages | name, email, message, read, starred |
| `content` | CMS sections | section (hero/about/etc.), content |
| `settings` | Site configuration | _type: "site_settings", categories |
| `pages` | Page builder pages | page_id, sections, meta |
| `page_versions` | Page version history | page_id, version, snapshot |
| `feature_flags` | Feature toggles | flag_name, enabled, category |
| `activity_log` | Audit trail | action, user, timestamp, details |
| `global_styles` | Theme settings | colors, typography, spacing |

## Authentication Flow

1. `POST /api/auth/login` → returns JWT (24h expiry)
2. Frontend stores token in `localStorage`
3. All protected routes use `Authorization: Bearer <token>` header
4. Backend `require_auth` dependency validates JWT on each request
5. Auto-logout on 401 response via axios interceptor

## Security Architecture

- **Password hashing**: bcrypt with default salt rounds
- **JWT validation**: Rejects default/weak secret keys at startup
- **Rate limiting**: slowapi (5/min login, 3/hr register, 10/min contact, 100/min global)
- **CORS**: Restricted to configured origins (default: localhost:3000)
- **CSP**: Script/style sources whitelisted (TODO: nonce-based for unsafe-inline)
- **Input sanitization**: Custom HTMLParser-based sanitizer (replaced deprecated bleach)
- **XSS prevention**: DOMPurify on all dangerouslySetInnerHTML in frontend
- **File uploads**: MIME validation, ClamAV scanning (optional), size limits
- **Error responses**: Generic messages to client, detailed logs server-side

## Environment Variables

### Backend (required)
| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `DB_NAME` | Database name | `mantez_reels` |
| `JWT_SECRET_KEY` | JWT signing secret (min 32 chars) | `<random 64-char string>` |

### Backend (optional)
| Variable | Default | Purpose |
|----------|---------|---------|
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `MEDIA_DIR` | `/tmp/backend/media` | Local media storage path |
| `ADMIN_INITIAL_PASSWORD` | Auto-generated | First admin password |
| `ADMIN_EMAIL` | `admin@example.com` | First admin email |
| `MONGO_TLS` | — | Enable TLS for MongoDB |
| `TRUSTED_PROXY_COUNT` | `1` | For rate limiter IP detection |

### Frontend
| Variable | Purpose |
|----------|---------|
| `REACT_APP_BACKEND_URL` | Backend API base URL |

## Deployment

### Render.com
- **Frontend**: Static site, build command `cd frontend && npm install && npm run build`, publish `frontend/build`
- **Backend**: Web service, build command `pip install -r requirements.txt`, start `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Database**: MongoDB Atlas (external, free M0 tier)

### Docker
```bash
docker-compose up --build
```

### Pre-deployment Checklist
- [ ] Set strong `JWT_SECRET_KEY` (not the default)
- [ ] Set `CORS_ORIGINS` to production domain(s)
- [ ] Set `MONGO_URL` to production database
- [ ] Remove `ARCHITECTURE.md` and `CHANGELOG.md` from build
- [ ] Verify `.gitignore` covers `.env`, `.initial_admin_password`
- [ ] Run `npm run build` successfully
- [ ] Rotate any exposed credentials from git history
